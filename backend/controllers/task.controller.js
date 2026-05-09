import bcrypt from "bcryptjs";
import { Task } from "../models/task.model.js";
import { Account } from "../models/index.js";
import SendLog from "../models/send-log.model.js";
import { sendEmail } from "../utils/email.js";

export const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueAt } = req.body || {};
    if (!title || !String(title).trim()) return res.status(400).json({ message: "Title is required." });

    const task = await Task.create({
      title: String(title).trim(),
      description: String(description || "").trim(),
      priority: priority || "medium",
      dueAt: dueAt ? new Date(dueAt) : null,
      createdBy: req.user._id,
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

    await task.remove();
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

    const account = await Account.findById(id);
    if (!account) return res.status(404).json({ message: "Account not found." });

    account.role = role;
    await account.save();

    return res.status(200).json({ message: "Role updated.", account: account.toSafeJSON() });
  } catch (error) {
    return next(error);
  }
};

export const createAdmin = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, city, role } = req.body || {};
    if (!fullName || !email || !password || !phone || !city) return res.status(400).json({ message: "Missing required fields." });

    const normalizedEmail = String(email).toLowerCase().trim();
    const exists = await Account.findOne({ email: normalizedEmail });
    if (exists) return res.status(409).json({ message: "Email already in use." });

    const passwordHash = await bcrypt.hash(String(password), 12);

    const newAccount = await Account.create({
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      passwordHash,
      phone: String(phone).trim(),
      city: String(city).trim(),
      role: role === "superadmin" ? "superadmin" : "admin",
      isActive: true,
    });

    return res.status(201).json({ message: "Admin account created.", account: newAccount.toSafeJSON() });
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
    if (String(req.user._id) === String(account._id)) {
      return res.status(400).json({ message: "Cannot remove the current logged-in admin." });
    }

    if (hard) {
      await account.remove();
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
