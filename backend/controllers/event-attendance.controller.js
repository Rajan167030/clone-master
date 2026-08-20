import { EventAttendance, EventContent } from "../models/index.js";

export const markEventAttendance = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const accountId = req.user.sub;

    const event = await EventContent.findOne({ slug, isPublished: true }).lean();
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    const attendance = await EventAttendance.findOneAndUpdate(
      { accountId, eventSlug: slug },
      { $setOnInsert: { accountId, eventSlug: slug, eventTitle: event.title, registeredAt: new Date() } },
      { upsert: true, new: true },
    );

    return res.status(200).json({ message: "You're marked as attending.", attending: true, attendance });
  } catch (error) {
    return next(error);
  }
};

export const cancelEventAttendance = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const accountId = req.user.sub;

    await EventAttendance.deleteOne({ accountId, eventSlug: slug });

    return res.status(200).json({ message: "Attendance removed.", attending: false });
  } catch (error) {
    return next(error);
  }
};

export const getMyEventAttendanceStatus = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const accountId = req.user.sub;

    const attendance = await EventAttendance.findOne({ accountId, eventSlug: slug }).lean();

    return res.status(200).json({ attending: Boolean(attendance) });
  } catch (error) {
    return next(error);
  }
};

export const listMyAttendedEvents = async (req, res, next) => {
  try {
    const accountId = req.user.sub;

    const attendances = await EventAttendance.find({ accountId }).sort({ registeredAt: -1 }).lean();

    return res.status(200).json({
      events: attendances.map((a) => ({
        eventSlug: a.eventSlug,
        eventTitle: a.eventTitle,
        registeredAt: a.registeredAt,
      })),
      count: attendances.length,
    });
  } catch (error) {
    return next(error);
  }
};
