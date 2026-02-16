import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Notification Store
 * Manages real-time notifications (outbid alerts, auction updates, etc.)
 */
export const useNotificationStore = create(
    persist(
        (set, get) => ({
            // State
            notifications: [],
            unreadCount: 0,

            /**
             * Add a new notification
             * @param {object} notification - { id, type, title, message, lotId, timestamp, read }
             */
            addNotification: (notification) => {
                const newNotification = {
                    id: notification.id || Date.now().toString(),
                    type: notification.type || 'info', // 'outbid', 'won', 'ending_soon', 'info'
                    title: notification.title,
                    message: notification.message,
                    lotId: notification.lotId,
                    timestamp: notification.timestamp || Date.now(),
                    read: false
                };

                set((state) => ({
                    notifications: [newNotification, ...state.notifications],
                    unreadCount: state.unreadCount + 1
                }));
            },

            /**
             * Mark notification as read
             * @param {string} notificationId
             */
            markAsRead: (notificationId) => {
                set((state) => ({
                    notifications: state.notifications.map(n =>
                        n.id === notificationId ? { ...n, read: true } : n
                    ),
                    unreadCount: Math.max(0, state.unreadCount - 1)
                }));
            },

            /**
             * Mark all notifications as read
             */
            markAllAsRead: () => {
                set((state) => ({
                    notifications: state.notifications.map(n => ({ ...n, read: true })),
                    unreadCount: 0
                }));
            },

            /**
             * Remove a notification
             * @param {string} notificationId
             */
            removeNotification: (notificationId) => {
                set((state) => {
                    const notification = state.notifications.find(n => n.id === notificationId);
                    const wasUnread = notification && !notification.read;

                    return {
                        notifications: state.notifications.filter(n => n.id !== notificationId),
                        unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount
                    };
                });
            },

            /**
             * Clear all notifications
             */
            clearAll: () => set({ notifications: [], unreadCount: 0 }),

            /**
             * Get unread notifications
             * @returns {array}
             */
            getUnread: () => {
                const { notifications } = get();
                return notifications.filter(n => !n.read);
            },

            /**
             * Get notifications by type
             * @param {string} type - Notification type
             * @returns {array}
             */
            getByType: (type) => {
                const { notifications } = get();
                return notifications.filter(n => n.type === type);
            }
        }),
        {
            name: 'notification-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // Only persist last 50 notifications
                notifications: state.notifications.slice(0, 50),
                unreadCount: state.unreadCount
            })
        }
    )
);
