// ═══════════════════════════════════════════════
// Skill Xchange — Sessions Controller
// ═══════════════════════════════════════════════

const mongoose = require("mongoose");
const Session = require("../models/Session");
const User = require("../models/User");
const Request = require("../models/Request");
const Transaction = require("../models/Transaction");
const Notification = require("../models/Notification");

/**
 * Helper to recalculate teacher's aggregate rating
 */
const updateTeacherRating = async (teacherId, dbOpts = {}) => {
  const completedSessions = await Session.find({
    teacher: teacherId,
    status: "completed",
    rating: { $ne: null },
  }, null, dbOpts);

  if (completedSessions.length === 0) return;

  const totalReviews = completedSessions.length;
  const sumRating = completedSessions.reduce((acc, s) => acc + s.rating, 0);
  const avgRating = Number((sumRating / totalReviews).toFixed(1));

  await User.findByIdAndUpdate(
    teacherId,
    { rating: avgRating, totalReviews },
    dbOpts
  );
};

/**
 * @desc    Schedule a new learning session
 * @route   POST /api/sessions
 * @access  Private
 */
const createSession = async (req, res) => {
  try {
    const {
      requestId,
      partnerId,
      teacherId,
      learnerId,
      role,
      skill,
      topic,
      date,
      time,
      duration,
    } = req.body;

    const currentUserId = req.user._id.toString();
    let finalTeacherId = teacherId;
    let finalLearnerId = learnerId;
    let linkedRequest = null;

    // 1. If requestId provided, validate against accepted exchange request
    if (requestId) {
      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid request ID format",
        });
      }

      linkedRequest = await Request.findById(requestId);
      if (!linkedRequest) {
        return res.status(404).json({
          success: false,
          message: "Referenced exchange request not found",
        });
      }

      if (linkedRequest.status !== "accepted") {
        return res.status(400).json({
          success: false,
          message: `Cannot schedule session for a request with status "${linkedRequest.status}". Request must be accepted.`,
        });
      }

      const reqFrom = linkedRequest.fromUser.toString();
      const reqTo = linkedRequest.toUser.toString();

      if (currentUserId !== reqFrom && currentUserId !== reqTo) {
        return res.status(403).json({
          success: false,
          message: "You are not a participant in the referenced exchange request",
        });
      }

      // Prevent duplicate scheduled session for the same request
      const existingSession = await Session.findOne({
        request: requestId,
        status: "scheduled",
      });

      if (existingSession) {
        return res.status(400).json({
          success: false,
          message: "A scheduled session for this exchange request already exists",
        });
      }

      const otherUserId = currentUserId === reqFrom ? reqTo : reqFrom;

      // Validate teacherId & learnerId if both provided
      if (finalTeacherId && finalLearnerId) {
        const t = finalTeacherId.toString();
        const l = finalLearnerId.toString();
        if (!((t === reqFrom && l === reqTo) || (t === reqTo && l === reqFrom))) {
          return res.status(400).json({
            success: false,
            message: "Specified teacher and learner must be the participants in this request",
          });
        }
      } else if (role === "teacher") {
        finalTeacherId = currentUserId;
        finalLearnerId = otherUserId;
      } else if (role === "learner") {
        finalTeacherId = otherUserId;
        finalLearnerId = currentUserId;
      } else {
        // Fallback role resolution
        if (req.user.skillsTeaching && req.user.skillsTeaching.includes(skill)) {
          finalTeacherId = currentUserId;
          finalLearnerId = otherUserId;
        } else if (skill && skill.toLowerCase() === linkedRequest.skillOffered.toLowerCase()) {
          finalTeacherId = reqFrom;
          finalLearnerId = reqTo;
        } else if (skill && skill.toLowerCase() === linkedRequest.skillWanted.toLowerCase()) {
          finalTeacherId = reqTo;
          finalLearnerId = reqFrom;
        } else {
          finalTeacherId = reqTo;
          finalLearnerId = reqFrom;
        }
      }
    } else {
      // Direct session scheduling with a partner
      if (partnerId) {
        if (!mongoose.Types.ObjectId.isValid(partnerId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid partner ID format",
          });
        }

        if (partnerId.toString() === currentUserId) {
          return res.status(400).json({
            success: false,
            message: "Cannot schedule a session with yourself",
          });
        }

        const pId = partnerId.toString();
        if (finalTeacherId && finalLearnerId) {
          const t = finalTeacherId.toString();
          const l = finalLearnerId.toString();
          if (!((t === currentUserId && l === pId) || (t === pId && l === currentUserId))) {
            return res.status(400).json({
              success: false,
              message: "Specified teacher and learner must match you and your partner",
            });
          }
        } else if (role === "teacher") {
          finalTeacherId = currentUserId;
          finalLearnerId = pId;
        } else if (role === "learner") {
          finalTeacherId = pId;
          finalLearnerId = currentUserId;
        } else {
          const isTeaching = req.user.skillsTeaching && req.user.skillsTeaching.includes(skill);
          finalTeacherId = isTeaching ? currentUserId : pId;
          finalLearnerId = isTeaching ? pId : currentUserId;
        }
      }
    }

    // Validate participants
    if (!finalTeacherId || !finalLearnerId) {
      return res.status(400).json({
        success: false,
        message: "Both teacher and learner must be designated for the session",
      });
    }

    if (finalTeacherId.toString() === finalLearnerId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Teacher and learner cannot be the same user",
      });
    }

    if (
      currentUserId !== finalTeacherId.toString() &&
      currentUserId !== finalLearnerId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You must be either the teacher or the learner in this session",
      });
    }

    // 2. Validate skill, date, time
    if (!skill || !skill.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please specify the skill for this session",
      });
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Date is required and must be in YYYY-MM-DD format",
      });
    }

    if (!time || !/^\d{2}:\d{2}$/.test(time)) {
      return res.status(400).json({
        success: false,
        message: "Time is required and must be in HH:mm format",
      });
    }

    // 3. Create Session
    const newSession = await Session.create({
      request: linkedRequest ? linkedRequest._id : null,
      teacher: finalTeacherId,
      learner: finalLearnerId,
      skill: skill.trim(),
      topic: topic ? topic.trim() : `${skill.trim()} Session`,
      date,
      time,
      duration: duration && Number(duration) >= 15 ? Number(duration) : 60,
      status: "scheduled",
    });

    // 4. Send notification to partner
    const partnerToNotify =
      currentUserId === finalTeacherId.toString() ? finalLearnerId : finalTeacherId;

    try {
      await Notification.create({
        user: partnerToNotify,
        fromUser: currentUserId,
        type: "session_scheduled",
        title: "Session Scheduled",
        message: `A new session on ${skill.trim()} has been scheduled by ${req.user.name} for ${date} at ${time}`,
        link: "/sessions",
      });
    } catch (notifErr) {
      console.warn("Could not create session notification:", notifErr.message);
    }

    const populatedSession = await Session.findById(newSession._id)
      .populate("teacher", "name email avatar title rating isOnline location")
      .populate("learner", "name email avatar title rating isOnline location");

    return res.status(201).json({
      success: true,
      message: "Session scheduled successfully",
      session: populatedSession.toJSON(),
    });
  } catch (err) {
    console.error("createSession error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error creating session",
    });
  }
};

/**
 * @desc    Get user sessions (filtered by status or all)
 * @route   GET /api/sessions
 * @access  Private
 */
const getSessions = async (req, res) => {
  try {
    const { status } = req.query; // 'scheduled' | 'completed' | 'cancelled'
    const userId = req.user._id;

    let filter = {
      $or: [{ teacher: userId }, { learner: userId }],
    };

    if (status) {
      filter.status = status;
    }

    const userFields = "name email avatar title rating isOnline location";

    const allSessions = await Session.find(filter)
      .populate("teacher", userFields)
      .populate("learner", userFields)
      .sort({ date: 1, time: 1, createdAt: -1 });

    const upcoming = allSessions.filter((s) => s.status === "scheduled");
    const completed = allSessions.filter((s) => s.status === "completed");

    return res.status(200).json({
      success: true,
      count: allSessions.length,
      sessions: allSessions.map((s) => s.toJSON()),
      upcoming: upcoming.map((s) => s.toJSON()),
      completed: completed.map((s) => s.toJSON()),
    });
  } catch (err) {
    console.error("getSessions error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching sessions",
    });
  }
};

/**
 * @desc    Get single session by ID
 * @route   GET /api/sessions/:id
 * @access  Private
 */
const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID format",
      });
    }

    const session = await Session.findById(id)
      .populate("teacher", "name email avatar title rating isOnline location")
      .populate("learner", "name email avatar title rating isOnline location");

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const currentUserId = req.user._id.toString();
    const teacherId = session.teacher._id ? session.teacher._id.toString() : session.teacher.toString();
    const learnerId = session.learner._id ? session.learner._id.toString() : session.learner.toString();

    if (currentUserId !== teacherId && currentUserId !== learnerId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this session",
      });
    }

    return res.status(200).json({
      success: true,
      session: session.toJSON(),
    });
  } catch (err) {
    console.error("getSessionById error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching session",
    });
  }
};

/**
 * @desc    Reschedule or update session details
 * @route   PATCH /api/sessions/:id
 * @access  Private (Participants only)
 */
const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { topic, date, time, duration, meetingLink, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID format",
      });
    }

    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const currentUserId = req.user._id.toString();
    if (
      currentUserId !== session.teacher.toString() &&
      currentUserId !== session.learner.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to modify this session",
      });
    }

    if (session.status !== "scheduled") {
      return res.status(400).json({
        success: false,
        message: `Cannot edit a session that is already ${session.status}`,
      });
    }

    if (typeof topic === "string") session.topic = topic.trim();
    if (typeof notes === "string") session.notes = notes.trim();
    if (typeof meetingLink === "string" && meetingLink.trim()) session.meetingLink = meetingLink.trim();

    if (date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
          success: false,
          message: "Date must be formatted as YYYY-MM-DD",
        });
      }
      session.date = date;
    }

    if (time) {
      if (!/^\d{2}:\d{2}$/.test(time)) {
        return res.status(400).json({
          success: false,
          message: "Time must be formatted as HH:mm",
        });
      }
      session.time = time;
    }

    if (duration && Number(duration) >= 15) {
      session.duration = Number(duration);
    }

    await session.save();

    const updatedSession = await Session.findById(session._id)
      .populate("teacher", "name email avatar title rating isOnline location")
      .populate("learner", "name email avatar title rating isOnline location");

    return res.status(200).json({
      success: true,
      message: "Session updated successfully",
      session: updatedSession.toJSON(),
    });
  } catch (err) {
    console.error("updateSession error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error updating session",
    });
  }
};

/**
 * @desc    Mark session as completed and settle credits
 * @route   PATCH /api/sessions/:id/complete
 * @access  Private (Participants only)
 */
const completeSession = async (req, res) => {
  let dbSession = null;
  let useTransaction = false;

  try {
    const { id } = req.params;
    const { creditAmount = 50, rating, review } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID format",
      });
    }

    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const currentUserId = req.user._id.toString();
    const teacherId = session.teacher.toString();
    const learnerId = session.learner.toString();

    // 1. Authorization check
    if (currentUserId !== teacherId && currentUserId !== learnerId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to complete this session",
      });
    }

    // 2. Prevent duplicate completion
    if (session.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Session has already been completed and credits settled",
      });
    }

    if (session.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot complete a cancelled session",
      });
    }

    const transferAmount = Math.max(0, parseInt(creditAmount, 10) || 50);

    // 3. Verify learner balance
    const learner = await User.findById(learnerId);
    const teacher = await User.findById(teacherId);

    if (!learner || !teacher) {
      return res.status(404).json({
        success: false,
        message: "Session participants could not be found",
      });
    }

    if (transferAmount > 0 && learner.credits < transferAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient credits. Learner has ${learner.credits} credits, but ${transferAmount} credits are required to complete this session.`,
      });
    }

    // 4. Try starting a MongoDB session transaction for atomic credit settlement
    try {
      dbSession = await mongoose.startSession();
      dbSession.startTransaction();
      useTransaction = true;
    } catch (txnInitErr) {
      // Standalone MongoDB without replica set transaction support fallback
      useTransaction = false;
      dbSession = null;
    }

    const sessionOpts = useTransaction && dbSession ? { session: dbSession } : {};

    // 5. Deduct from learner, add to teacher
    if (transferAmount > 0) {
      const updatedLearner = await User.findOneAndUpdate(
        { _id: learnerId, credits: { $gte: transferAmount } },
        { $inc: { credits: -transferAmount, totalSessions: 1 } },
        { returnDocument: "after", ...sessionOpts }
      );

      if (!updatedLearner) {
        if (useTransaction && dbSession) {
          await dbSession.abortTransaction();
          dbSession.endSession();
          dbSession = null;
        }
        return res.status(400).json({
          success: false,
          message: "Insufficient credits. Learner does not have enough credits to complete this session.",
        });
      }

      await User.findByIdAndUpdate(
        teacherId,
        { $inc: { credits: transferAmount, totalSessions: 1 } },
        sessionOpts
      );

      // 6. Record double-entry transactions
      await Transaction.create(
        [
          {
            user: learnerId,
            type: "spent",
            amount: transferAmount,
            description: `Learned ${session.skill} from ${teacher.name}`,
            fromUser: teacherId,
            session: session._id,
          },
          {
            user: teacherId,
            type: "earned",
            amount: transferAmount,
            description: `Taught ${session.skill} to ${learner.name}`,
            fromUser: learnerId,
            session: session._id,
          },
        ],
        { ordered: true, ...(useTransaction && dbSession ? { session: dbSession } : {}) }
      );
    } else {
      await User.findByIdAndUpdate(learnerId, { $inc: { totalSessions: 1 } }, sessionOpts);
      await User.findByIdAndUpdate(teacherId, { $inc: { totalSessions: 1 } }, sessionOpts);
    }

    // 7. Update session status
    session.status = "completed";
    session.completedAt = new Date();
    session.creditsTransferred = transferAmount;

    if (rating && Number(rating) >= 1 && Number(rating) <= 5) {
      session.rating = Number(rating);
    }
    if (review && typeof review === "string") {
      session.review = review.trim();
    }

    await session.save(sessionOpts);

    // Commit transaction if active
    if (useTransaction && dbSession) {
      await dbSession.commitTransaction();
      dbSession.endSession();
      dbSession = null;
    }

    // 8. Update teacher's aggregate star rating
    if (session.rating) {
      await updateTeacherRating(teacherId);
    }

    // 9. Send notification to teacher
    try {
      if (transferAmount > 0) {
        await Notification.create({
          user: teacherId,
          fromUser: learnerId,
          type: "credit_received",
          title: "Credits Received!",
          message: `You earned ${transferAmount} Skill Credits for teaching ${session.skill} to ${learner.name}`,
          link: "/credits",
        });
      }
    } catch (notifErr) {
      console.warn("Could not create completion notification:", notifErr.message);
    }

    const populatedSession = await Session.findById(session._id)
      .populate("teacher", "name email avatar title rating isOnline location")
      .populate("learner", "name email avatar title rating isOnline location");

    return res.status(200).json({
      success: true,
      message: "Session completed successfully! Credits transferred.",
      session: populatedSession.toJSON(),
      creditsTransferred: transferAmount,
    });
  } catch (err) {
    if (useTransaction && dbSession) {
      await dbSession.abortTransaction();
      dbSession.endSession();
    }
    console.error("completeSession error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error completing session",
    });
  }
};

/**
 * @desc    Cancel a scheduled session
 * @route   PATCH /api/sessions/:id/cancel
 * @access  Private (Participants only)
 */
const cancelSession = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID format",
      });
    }

    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const currentUserId = req.user._id.toString();
    const teacherId = session.teacher.toString();
    const learnerId = session.learner.toString();

    if (currentUserId !== teacherId && currentUserId !== learnerId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this session",
      });
    }

    if (session.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a session that is already completed",
      });
    }

    if (session.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Session is already cancelled",
      });
    }

    session.status = "cancelled";
    await session.save();

    // Notify the other party
    const partnerId = currentUserId === teacherId ? learnerId : teacherId;
    try {
      await Notification.create({
        user: partnerId,
        fromUser: currentUserId,
        type: "system",
        title: "Session Cancelled",
        message: `${req.user.name} has cancelled the session on ${session.skill}`,
        link: "/sessions",
      });
    } catch (notifErr) {
      console.warn("Could not create cancellation notification:", notifErr.message);
    }

    const updatedSession = await Session.findById(session._id)
      .populate("teacher", "name email avatar title rating isOnline location")
      .populate("learner", "name email avatar title rating isOnline location");

    return res.status(200).json({
      success: true,
      message: "Session cancelled successfully",
      session: updatedSession.toJSON(),
    });
  } catch (err) {
    console.error("cancelSession error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error cancelling session",
    });
  }
};

/**
 * @desc    Submit review and rating for a completed session
 * @route   POST /api/sessions/:id/review
 * @access  Private (Participants only)
 */
const reviewSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID format",
      });
    }

    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const currentUserId = req.user._id.toString();
    const teacherId = session.teacher.toString();
    const learnerId = session.learner.toString();

    if (currentUserId !== teacherId && currentUserId !== learnerId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to review this session",
      });
    }

    if (session.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "You can only review completed sessions",
      });
    }

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    session.rating = numRating;
    session.review = review ? review.trim() : "";
    await session.save();

    // Recalculate teacher rating
    await updateTeacherRating(teacherId);

    // Notify teacher
    try {
      await Notification.create({
        user: teacherId,
        fromUser: currentUserId,
        type: "review_received",
        title: "New Review",
        message: `${req.user.name} gave you a ${numRating}-star review for ${session.skill}!`,
        link: `/profile/${teacherId}`,
      });
    } catch (notifErr) {
      console.warn("Could not create review notification:", notifErr.message);
    }

    const updatedSession = await Session.findById(session._id)
      .populate("teacher", "name email avatar title rating isOnline location")
      .populate("learner", "name email avatar title rating isOnline location");

    return res.status(200).json({
      success: true,
      message: "Review submitted successfully",
      session: updatedSession.toJSON(),
    });
  } catch (err) {
    console.error("reviewSession error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error submitting review",
    });
  }
};

module.exports = {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  completeSession,
  cancelSession,
  reviewSession,
};
