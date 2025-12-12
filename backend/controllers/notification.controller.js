import Notification from "../models/Notification.model.js";

export const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const notifications = await Notification.find({ user: userId })
      .populate('maintenance')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ 
      user: userId, 
      read: false 
    });

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount
    });
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification non trouvée"
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marquée comme lue",
      data: notification
    });
  } catch (err) {
    next(err);
  }
};