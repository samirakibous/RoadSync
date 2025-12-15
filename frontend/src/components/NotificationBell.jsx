import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyNotifications, markNotificationAsRead, markAllAsRead } from '../features/notificationSlice';
import { Bell, X, AlertCircle, CheckCircle } from 'lucide-react';

export default function NotificationBell() {
  const dispatch = useDispatch();
  const { list, unreadCount, loading } = useSelector(state => state.notifications);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    // Charger les notifications au montage
    dispatch(fetchMyNotifications());

    // Recharger toutes les 60 secondes
    const interval = setInterval(() => {
      dispatch(fetchMyNotifications());
    }, 60000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleMarkAsRead = (id) => {
    dispatch(markNotificationAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-[#3b8492] to-[#2a6570]">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-white" />
              <h3 className="font-bold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowPanel(false)}
              className="text-white hover:bg-white/20 p-1 rounded transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mark all as read button */}
          {unreadCount > 0 && (
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-[#3b8492] hover:underline font-semibold flex items-center gap-1"
              >
                <CheckCircle className="w-4 h-4" />
                Tout marquer comme lu
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading && list.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="w-8 h-8 border-2 border-[#3b8492] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Chargement...
              </div>
            ) : list.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Aucune notification</p>
              </div>
            ) : (
              list.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition ${
                    !notif.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => !notif.read && handleMarkAsRead(notif._id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${notif.read ? 'bg-gray-200' : 'bg-orange-100'}`}>
                      <AlertCircle className={`w-5 h-5 ${notif.read ? 'text-gray-500' : 'text-orange-600'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${notif.read ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.createdAt).toLocaleDateString('fr-FR')} à{' '}
                        {new Date(notif.createdAt).toLocaleTimeString('fr-FR')}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay to close panel when clicking outside */}
      {showPanel && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowPanel(false)}
        ></div>
      )}
    </div>
  );
}