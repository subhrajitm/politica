/**
 * Notification Center Component
 * Displays live notifications to users
 */

'use client';

import React, { useState, useEffect } from 'react';
import { notificationSystem, Notification } from '@/lib/realtime/NotificationSystem';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { X, Bell, Check, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';

interface NotificationCenterProps {
  className?: string;
  maxVisible?: number;
}

const notificationIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const notificationColors = {
  info: 'border-blue-500 bg-blue-50 text-blue-900',
  success: 'border-green-500 bg-green-50 text-green-900',
  warning: 'border-yellow-500 bg-yellow-50 text-yellow-900',
  error: 'border-red-500 bg-red-50 text-red-900',
};

export function NotificationCenter({ className, maxVisible = 5 }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeNotifications = async () => {
      try {
        await notificationSystem.initialize();

        // Subscribe to notification updates
        unsubscribe = notificationSystem.subscribe((notification) => {
          setNotifications(prev => {
            // Remove if it's a dismissal (read = true)
            if (notification.read) {
              return prev.filter(n => n.id !== notification.id);
            }
            
            // Add new notification
            const existing = prev.find(n => n.id === notification.id);
            if (existing) {
              return prev.map(n => n.id === notification.id ? notification : n);
            }
            
            return [notification, ...prev].slice(0, maxVisible);
          });
        });

        // Load existing notifications
        setNotifications(notificationSystem.getAll().slice(0, maxVisible));

      } catch (error) {
        console.error('Failed to initialize notification center:', error);
      }
    };

    initializeNotifications();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [maxVisible]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleDismiss = (notificationId: string) => {
    notificationSystem.dismiss(notificationId);
  };

  const handleMarkAsRead = (notificationId: string) => {
    notificationSystem.markAsRead(notificationId);
  };

  const handleClearAll = () => {
    notificationSystem.clearAll();
    setNotifications([]);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 max-h-96 shadow-lg z-50">
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-xs"
                >
                  Clear all
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="max-h-80">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No notifications
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onDismiss={handleDismiss}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  onMarkAsRead: (id: string) => void;
}

function NotificationItem({ notification, onDismiss, onMarkAsRead }: NotificationItemProps) {
  const Icon = notificationIcons[notification.type];
  const colorClass = notificationColors[notification.type];
  const timeAgo = formatTimeAgo(Date.now() - notification.timestamp);

  return (
    <div
      className={cn(
        'p-3 rounded-lg border-l-4 transition-all duration-200',
        colorClass,
        !notification.read && 'shadow-sm'
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm truncate">{notification.title}</h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="h-6 w-6 p-0"
                  title="Mark as read"
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(notification.id)}
                className="h-6 w-6 p-0"
                title="Dismiss"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <p className="text-sm opacity-90 mt-1">{notification.message}</p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs opacity-70">{timeAgo}</span>
            {!notification.read && (
              <div className="w-2 h-2 bg-current rounded-full" />
            )}
          </div>

          {/* Action buttons */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex gap-2 mt-2">
              {notification.actions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.style === 'primary' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    action.action();
                    onMarkAsRead(notification.id);
                  }}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Toast Notification Component
 * Shows floating notifications that auto-dismiss
 */
interface ToastNotificationProps {
  className?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function ToastNotifications({ 
  className, 
  position = 'top-right' 
}: ToastNotificationProps) {
  const [toasts, setToasts] = useState<Notification[]>([]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeToasts = async () => {
      try {
        await notificationSystem.initialize();

        unsubscribe = notificationSystem.subscribe((notification) => {
          if (notification.read) {
            // Remove dismissed notification
            setToasts(prev => prev.filter(t => t.id !== notification.id));
          } else if (!notification.persistent) {
            // Add non-persistent notifications as toasts
            setToasts(prev => {
              const existing = prev.find(t => t.id === notification.id);
              if (existing) return prev;
              return [...prev, notification];
            });
          }
        });

      } catch (error) {
        console.error('Failed to initialize toast notifications:', error);
      }
    };

    initializeToasts();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <div className={cn(
      'fixed z-50 flex flex-col gap-2 max-w-sm',
      positionClasses[position],
      className
    )}>
      {toasts.map((toast) => {
        const Icon = notificationIcons[toast.type];
        const colorClass = notificationColors[toast.type];

        return (
          <Card
            key={toast.id}
            className={cn(
              'border-l-4 shadow-lg animate-in slide-in-from-right duration-300',
              colorClass
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{toast.title}</h4>
                  <p className="text-sm opacity-90 mt-1">{toast.message}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => notificationSystem.dismiss(toast.id)}
                  className="h-6 w-6 p-0 flex-shrink-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function formatTimeAgo(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}