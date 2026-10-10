// pages/Notifications.jsx - Notifications Center
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { notificationService } from '../services/notificationService';
import { formatDate } from '../utils/helpers';
import {
  Bell,
  CheckCheck,
  CheckCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Smartphone,
  MessageSquare,
} from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const filteredList =
    filter === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const getIcon = (type) => {
    switch (type) {
      case 'resolution':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'assignment':
        return <ShieldCheck className="w-5 h-5 text-indigo-600" />;
      case 'status':
        return <Clock className="w-5 h-5 text-amber-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Notification Center
            </h1>
            <p className="text-sm text-slate-500">
              Live updates regarding your complaints, technician assignments, and resolutions
            </p>
          </div>

          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
            >
              <CheckCheck className="w-4 h-4 text-indigo-600" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-sm">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Unread ({notifications.filter((n) => !n.isRead).length})
          </button>
        </div>

        {/* Notifications List */}
        {loading ? (
          <LoadingSpinner label="Loading notifications..." />
        ) : filteredList.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You're all caught up! You will be notified when your complaints receive updates or assignments."
          />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {filteredList.map((item) => (
              <div
                key={item._id}
                className={`p-5 flex items-start gap-4 transition-colors ${
                  !item.isRead ? 'bg-indigo-50/30' : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1">
                  <p className={`text-sm ${!item.isRead ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                    {item.message}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                    <span>{formatDate(item.createdAt)}</span>
                    {item.complaintId && (
                      <>
                        <span>•</span>
                        <Link
                          to={`/complaints/${item.complaintId._id || item.complaintId}`}
                          className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1"
                        >
                          View Ticket
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                {!item.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(item._id)}
                    title="Mark as read"
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 block"></span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Notifications;
