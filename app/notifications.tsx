import { colors } from '@/constants/SharedStyles';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'reminder' | 'promotion' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  actionRequired?: boolean;
  bookingId?: string;
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'booking',
      title: 'Booking Confirmed',
      message: 'Your parking spot at City Center Garage has been confirmed for today at 2:30 PM',
      timestamp: '2 minutes ago',
      isRead: false,
      priority: 'high',
      actionRequired: false,
      bookingId: 'PCK001234',
    },
    {
      id: '2',
      type: 'reminder',
      title: 'Parking Session Ending Soon',
      message: 'Your parking session at Mall Parking West will expire in 15 minutes',
      timestamp: '1 hour ago',
      isRead: false,
      priority: 'high',
      actionRequired: true,
      bookingId: 'PCK001235',
    },
    {
      id: '3',
      type: 'payment',
      title: 'Payment Successful',
      message: 'Payment of $12.50 for your parking session has been processed successfully',
      timestamp: '3 hours ago',
      isRead: true,
      priority: 'medium',
      actionRequired: false,
    },
    {
      id: '4',
      type: 'promotion',
      title: 'Special Offer Available',
      message: 'Get 20% off your next parking session at Riverside Lot A. Valid until end of month',
      timestamp: '1 day ago',
      isRead: true,
      priority: 'low',
      actionRequired: false,
    },
    {
      id: '5',
      type: 'system',
      title: 'App Update Available',
      message: 'A new version of SmartParking is available with improved features and bug fixes',
      timestamp: '2 days ago',
      isRead: true,
      priority: 'medium',
      actionRequired: false,
    },
    {
      id: '6',
      type: 'booking',
      title: 'Booking Cancelled',
      message: 'Your booking at Underground C-12 has been cancelled due to maintenance',
      timestamp: '3 days ago',
      isRead: true,
      priority: 'medium',
      actionRequired: true,
      bookingId: 'PCK001230',
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'booking':
        return 'local-parking';
      case 'payment':
        return 'payment';
      case 'reminder':
        return 'schedule';
      case 'promotion':
        return 'local-offer';
      case 'system':
        return 'info';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: Notification['type'], priority: Notification['priority']) => {
    if (priority === 'high') return '#FF4444';
    switch (type) {
      case 'booking':
        return colors.primary;
      case 'payment':
        return '#4CAF50';
      case 'reminder':
        return '#FF9800';
      case 'promotion':
        return '#9C27B0';
      case 'system':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    Alert.alert(
      'Mark All as Read',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All Read',
          onPress: () => {
            setNotifications(prev =>
              prev.map(notification => ({ ...notification, isRead: true }))
            );
          }
        }
      ]
    );
  };

  const deleteNotification = (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
          }
        }
      ]
    );
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to delete all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            setNotifications([]);
          }
        }
      ]
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Handle different notification types
    switch (notification.type) {
      case 'booking':
        if (notification.bookingId) {
          Alert.alert('Booking Details', `View details for booking ${notification.bookingId}`);
        }
        break;
      case 'reminder':
        if (notification.actionRequired) {
          Alert.alert('Extend Session', 'Would you like to extend your parking session?');
        }
        break;
      case 'promotion':
        Alert.alert('Special Offer', 'Would you like to view available parking spots with this offer?');
        break;
      default:
        // Just mark as read
        break;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'high':
        return notification.priority === 'high';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high').length;

  const renderNotification = (notification: Notification) => (
    <TouchableOpacity
      key={notification.id}
      style={[
        styles.notificationCard,
        !notification.isRead && styles.unreadNotification,
        notification.actionRequired && styles.actionRequiredNotification
      ]}
      onPress={() => handleNotificationPress(notification)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationIconContainer}>
            <MaterialIcons
              name={getNotificationIcon(notification.type) as any}
              size={20}
              color={getNotificationColor(notification.type, notification.priority)}
            />
          </View>
          <View style={styles.notificationTextContainer}>
            <View style={styles.notificationTitleRow}>
              <Text style={[
                styles.notificationTitle,
                !notification.isRead && styles.unreadTitle
              ]}>
                {notification.title}
              </Text>
              {notification.actionRequired && (
                <View style={styles.actionRequiredBadge}>
                  <Text style={styles.actionRequiredText}>Action Required</Text>
                </View>
              )}
            </View>
            <Text style={styles.notificationMessage}>{notification.message}</Text>
            <Text style={styles.notificationTimestamp}>{notification.timestamp}</Text>
          </View>
        </View>
        
        <View style={styles.notificationActions}>
          {!notification.isRead && (
            <TouchableOpacity
              style={styles.markReadButton}
              onPress={() => markAsRead(notification.id)}
            >
              <MaterialIcons name="check" size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteNotification(notification.id)}
          >
            <MaterialIcons name="delete-outline" size={16} color="#FF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity
          style={styles.clearAllButton}
          onPress={clearAllNotifications}
        >
          <MaterialIcons name="clear-all" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            All ({notifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'unread' && styles.activeFilterTab]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.filterText, filter === 'unread' && styles.activeFilterText]}>
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'high' && styles.activeFilterTab]}
          onPress={() => setFilter('high')}
        >
          <Text style={[styles.filterText, filter === 'high' && styles.activeFilterText]}>
            High Priority ({highPriorityCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mark All Read Button */}
      {unreadCount > 0 && (
        <View style={styles.markAllContainer}>
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <MaterialIcons name="done-all" size={16} color={colors.primary} />
            <Text style={styles.markAllText}>Mark All as Read</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(renderNotification)
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="notifications-none" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>
              {filter === 'unread' ? 'No Unread Notifications' : 
               filter === 'high' ? 'No High Priority Notifications' : 
               'No Notifications'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'unread' ? 'You\'re all caught up!' : 
               filter === 'high' ? 'No urgent notifications at the moment' : 
               'Your notifications will appear here'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  clearAllButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeFilterTab: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#000000',
    fontWeight: '700',
  },
  markAllContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 6,
  },
  markAllText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  notificationCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  actionRequiredNotification: {
    borderColor: '#FF9800',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  notificationHeader: {
    flexDirection: 'row',
    flex: 1,
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '800',
  },
  actionRequiredBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  actionRequiredText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  notificationMessage: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTimestamp: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  notificationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },
  markReadButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
