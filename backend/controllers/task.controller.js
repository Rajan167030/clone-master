import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Task } from "../models/task.model.js";
import { Account } from "../models/index.js";
import SendLog from "../models/send-log.model.js";
import { sendEmail } from "../utils/email.js";

const generateSecurePassword = () => {
  // 12 random bytes -> base64 -> strip ambiguous chars, keep it easy to read/type
  const raw = crypto.randomBytes(12).toString("base64").replace(/[+/=]/g, "");
  return `${raw.slice(0, 12)}${crypto.randomInt(10, 99)}!`;
};

const buildAdminCredentialsEmail = ({ fullName, email, password, role }) => `
  <div style="background-color: #0b071e; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center; color: #ffffff;">
    <div style="max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #130f35 0%, #0a0524 100%); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 40px 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.45); text-align: center;">
      <div style="margin-bottom: 30px;">
        <span style="font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #a855f7; text-transform: uppercase;">Founders Connect</span>
      </div>

      <h2 style="font-size: 24px; font-weight: 700; margin-top: 0; color: #ffffff; letter-spacing: -0.5px;">Your admin account is ready</h2>
      <p style="font-size: 15px; color: #b4acc9; line-height: 1.6; margin-bottom: 8px;">Hi ${fullName},</p>
      <p style="font-size: 15px; color: #b4acc9; line-height: 1.6; margin-bottom: 24px;">
        You've been granted <strong style="color: #c084fc;">${role}</strong> access to the Founders Connect admin dashboard. Use the credentials below to sign in.
      </p>

      <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 16px; padding: 18px; margin-bottom: 24px; text-align: left;">
        <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #8e85aa;">Email</p>
        <p style="margin: 0 0 16px; font-size: 15px; color: #ffffff; font-weight: 600;">${email}</p>
        <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #8e85aa;">Temporary Password</p>
        <p style="margin: 0; font-size: 18px; color: #c084fc; font-family: monospace; font-weight: 700; letter-spacing: 1px;">${password}</p>
      </div>

      <a href="https://foundersconnect.co.in/admin/login" style="display: inline-block; background: linear-gradient(135deg, #a855f7, #7c3aed); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 12px; margin-bottom: 10px;">
        Sign In to Admin Dashboard
      </a>

      <p style="font-size: 13px; color: #8e85aa; line-height: 1.5; margin-top: 20px; margin-bottom: 0;">
        For security, please sign in and change this password as soon as possible.
      </p>
    </div>
    <div style="margin-top: 20px; font-size: 12px; color: #5a5275; text-align: center;">
      © ${new Date().getFullYear()} Founders Connect. All rights reserved.<br/>
      <a href="https://foundersconnect.co.in" style="color: #a855f7; text-decoration: none; font-weight: 600;">foundersconnect.co.in</a>
    </div>
  </div>
`;

export const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueAt } = req.body || {};
    if (!title || !String(title).trim()) return res.status(400).json({ message: "Title is required." });

    const task = await Task.create({
      title: String(title).trim(),
      description: String(description || "").trim(),
      priority: priority || "medium",
      dueAt: dueAt ? new Date(dueAt) : null,
      createdBy: req.user.id,
    });

    return res.status(201).json({ message: "Task created.", task });
  } catch (error) {
    return next(error);
  }
};

export const listTasks = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    if (req.query.status) filter.status = req.query.status;

    const tasks = await Task.find(filter).sort({ createdAt: -1 }).populate("assignedTo createdBy", "fullName email role").lean();
    return res.status(200).json({ tasks });
  } catch (error) {
    return next(error);
  }
};

export const assignTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body || {};

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found." });

    const assignee = assignedTo ? await Account.findById(assignedTo) : null;
    task.assignedTo = assignee ? assignee._id : null;
    await task.save();

    // Add task to assignee.assignedTasks
    if (assignee) {
      assignee.assignedTasks = assignee.assignedTasks || [];
      if (!assignee.assignedTasks.find((t) => String(t) === String(task._id))) {
        assignee.assignedTasks.push(task._id);
      }
      await assignee.save();

      // send email notification (best-effort)
      try {
        const subject = `New task assigned: ${task.title}`;
        const html = `<p>Hi ${assignee.fullName},</p><p>A new task has been assigned to you: <strong>${task.title}</strong></p><p>${task.description || ""}</p><p>-- Founders Connect</p>`;
        const sendRes = await sendEmail({ to: assignee.email, subject, html, requireConfigured: false });

        // Log send attempt
        await SendLog.create({ to: assignee.email, name: assignee.fullName, status: sendRes?.ok ? "sent" : "failed" });
      } catch (err) {
        // ignore email errors
      }
    }

    return res.status(200).json({ message: "Task assigned.", task });
  } catch (error) {
    return next(error);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!["open", "in_progress", "done"].includes(status)) return res.status(400).json({ message: "Invalid status." });

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found." });

    task.status = status;
    await task.save();

    return res.status(200).json({ message: "Task updated.", task });
  } catch (error) {
    return next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found." });

    // remove from assigned user's list
    if (task.assignedTo) {
      const account = await Account.findById(task.assignedTo);
      if (account) {
        account.assignedTasks = (account.assignedTasks || []).filter((t) => String(t) !== String(task._id));
        await account.save();
      }
    }

    await Task.deleteOne({ _id: task._id });
    return res.status(200).json({ message: "Task deleted." });
  } catch (error) {
    return next(error);
  }
};

export const listAdmins = async (req, res, next) => {
  try {
    const admins = await Account.find({ role: { $in: ["admin", "superadmin"] } }).select("fullName email role isActive assignedTasks").lean();
    return res.status(200).json({ admins });
  } catch (error) {
    return next(error);
  }
};

export const updateAdminRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body || {};
    if (!["admin", "superadmin"].includes(role)) return res.status(400).json({ message: "Invalid role." });

    const existing = await Account.findById(id).lean();
    if (!existing) return res.status(404).json({ message: "Account not found." });

    // Mongoose discriminators lock the "role" field to whichever type the document was
    // hydrated as, so account.role = role; account.save() silently fails/no-ops when
    // crossing discriminator types (e.g. investor -> admin, or admin -> superadmin).
    // Updating through the raw driver bypasses that and persists correctly.
    await Account.collection.updateOne({ _id: existing._id }, { $set: { role } });

    const updated = await Account.findById(id);

    return res.status(200).json({ message: "Role updated.", account: updated.toSafeJSON() });
  } catch (error) {
    return next(error);
  }
};

export const createAdmin = async (req, res, next) => {
  try {
    const { fullName, email, phone, city, role } = req.body || {};
    if (!fullName || !email || !phone || !city) return res.status(400).json({ message: "Missing required fields." });

    const normalizedEmail = String(email).toLowerCase().trim();
    const exists = await Account.findOne({ email: normalizedEmail });
    if (exists) return res.status(409).json({ message: "Email already in use." });

    const resolvedRole = role === "superadmin" ? "superadmin" : "admin";
    const generatedPassword = generateSecurePassword();
    const passwordHash = await bcrypt.hash(generatedPassword, 12);

    const newAccount = await Account.create({
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      passwordHash,
      phone: String(phone).trim(),
      city: String(city).trim(),
      role: resolvedRole,
      isActive: true,
    });

    let emailSent = false;
    try {
      const sendRes = await sendEmail({
        to: normalizedEmail,
        subject: "Your Founders Connect admin account is ready",
        html: buildAdminCredentialsEmail({
          fullName: newAccount.fullName,
          email: normalizedEmail,
          password: generatedPassword,
          role: resolvedRole,
        }),
      });
      emailSent = Boolean(sendRes?.ok);
      await SendLog.create({ to: normalizedEmail, name: newAccount.fullName, status: emailSent ? "sent" : "failed" });
    } catch (emailError) {
      console.error("Admin credentials email failed:", emailError?.message || emailError);
    }

    return res.status(201).json({
      message: emailSent
        ? "Admin account created and credentials emailed."
        : "Admin account created, but the credentials email failed to send. Share the password below manually.",
      account: newAccount.toSafeJSON(),
      generatedPassword,
      emailSent,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteAdminAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hard = req.query.hard === "true";

    const account = await Account.findById(id);
    if (!account) return res.status(404).json({ message: "Account not found." });

    // Prevent deleting yourself
    if (String(req.user.id) === String(account._id)) {
      return res.status(400).json({ message: "Cannot remove the current logged-in admin." });
    }

    if (hard) {
      await Account.deleteOne({ _id: account._id });
      return res.status(200).json({ message: "Admin account permanently deleted." });
    }

    // Soft remove: demote to user and deactivate
    account.role = "user";
    account.isActive = false;
    account.assignedTasks = [];
    await account.save();

    return res.status(200).json({ message: "Admin account demoted and deactivated." });
  } catch (error) {
    return next(error);
  }
};
