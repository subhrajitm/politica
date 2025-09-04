/**
 * Real-time Activity Indicator Component
 * Shows live activity indicators on politician profiles
 */

'use client';

import React, { useState, useEffect } from 'react';
import { politicianEventManager, PoliticianActivityEvent } from '@/lib/realtime/PoliticianEvents';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ActivityIndicatorProps {
  politicianId: string;
  className?: string;
  showCount?: boolean;
  maxVisible?: number;
}

interface ActivityData {
  type: PoliticianActivityEvent['activityType'];
  count: number;
  lastActivity: number;
  users: string[];
}

const activityConfig = {
  view: {
    label: 'viewing',
    color: 'bg-blue-500',
    icon: '👁️',
  },
  favorite: {
    label: 'favorited',
    color: 'bg-red-500',
    icon: '❤️',
  },
  share: {
    label: 'shared',
    color: 'bg-green-500',
    icon: '📤',
  },
  comment: {
    label: 'commented',
    color: 'bg-purple-500',
    icon: '💬',
  },
};

export function ActivityIndicator({ 
  politicianId, 
  className,
  showCount = true,
  maxVisible = 3 
}: ActivityIndicatorProps) {
  const [activities, setActivities] = useState<Map<string, ActivityData>>(new Map());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let subscriptionId: string;

    const initializeActivity = async () => {
      try {
        await politicianEventManager.initialize();

        // Subscribe to activity events for this politician
        subscriptionId = politicianEventManager.subscribeToPoliticianActivity(
          politicianId,
          (event) => {
            handleActivityEvent(event);
          }
        );

        setIsVisible(true);
      } catch (error) {
        console.error('Failed to initialize activity indicator:', error);
      }
    };

    initializeActivity();

    return () => {
      if (subscriptionId) {
        politicianEventManager.unsubscribe(subscriptionId);
      }
    };
  }, [politicianId]);

  const handleActivityEvent = (event: PoliticianActivityEvent) => {
    setActivities(prev => {
      const newActivities = new Map(prev);
      const existing = newActivities.get(event.activityType);
      
      if (existing) {
        // Update existing activity
        existing.count += 1;
        existing.lastActivity = Date.now();
        if (!existing.users.includes(event.userId)) {
          existing.users.push(event.userId);
        }
      } else {
        // Create new activity
        newActivities.set(event.activityType, {
          type: event.activityType,
          count: 1,
          lastActivity: Date.now(),
          users: [event.userId],
        });
      }

      return newActivities;
    });

    // Auto-hide old activities after 5 minutes
    setTimeout(() => {
      setActivities(prev => {
        const newActivities = new Map(prev);
        const activity = newActivities.get(event.activityType);
        
        if (activity && Date.now() - activity.lastActivity > 300000) { // 5 minutes
          newActivities.delete(event.activityType);
        }
        
        return newActivities;
      });
    }, 300000);
  };

  if (!isVisible || activities.size === 0) {
    return null;
  }

  const sortedActivities = Array.from(activities.values())
    .sort((a, b) => b.lastActivity - a.lastActivity)
    .slice(0, maxVisible);

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {sortedActivities.map((activity) => {
        const config = activityConfig[activity.type];
        const isRecent = Date.now() - activity.lastActivity < 60000; // 1 minute
        
        return (
          <Badge
            key={activity.type}
            variant="secondary"
            className={cn(
              'flex items-center gap-1 text-xs transition-all duration-300',
              isRecent && 'animate-pulse',
              config.color,
              'text-white'
            )}
          >
            <span className="text-xs">{config.icon}</span>
            <span>
              {showCount && activity.count > 1 ? `${activity.count} ` : ''}
              {config.label}
            </span>
            {isRecent && (
              <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            )}
          </Badge>
        );
      })}
    </div>
  );
}

/**
 * Live User Count Component
 * Shows number of users currently viewing a politician
 */
interface LiveUserCountProps {
  politicianId: string;
  className?: string;
}

export function LiveUserCount({ politicianId, className }: LiveUserCountProps) {
  const [viewerCount, setViewerCount] = useState(0);
  const [recentViewers, setRecentViewers] = useState<Set<string>>(new Set());

  useEffect(() => {
    let subscriptionId: string;
    let cleanupInterval: NodeJS.Timeout;

    const initializeViewerTracking = async () => {
      try {
        await politicianEventManager.initialize();

        // Subscribe to view events
        subscriptionId = politicianEventManager.subscribeToPoliticianActivity(
          politicianId,
          (event) => {
            if (event.activityType === 'view') {
              setRecentViewers(prev => {
                const newViewers = new Set(prev);
                newViewers.add(event.userId);
                return newViewers;
              });
            }
          },
          'view'
        );

        // Emit our own view event
        politicianEventManager.emitPoliticianActivity(
          politicianId,
          'view',
          'current-user' // In real app, this would be the actual user ID
        );

        // Clean up old viewers every 30 seconds
        cleanupInterval = setInterval(() => {
          setRecentViewers(prev => {
            // In a real implementation, you'd track timestamps and remove old viewers
            // For now, we'll just gradually reduce the count
            const newViewers = new Set(prev);
            if (newViewers.size > 0 && Math.random() > 0.7) {
              const viewersArray = Array.from(newViewers);
              const randomViewer = viewersArray[Math.floor(Math.random() * viewersArray.length)];
              newViewers.delete(randomViewer);
            }
            return newViewers;
          });
        }, 30000);

      } catch (error) {
        console.error('Failed to initialize viewer tracking:', error);
      }
    };

    initializeViewerTracking();

    return () => {
      if (subscriptionId) {
        politicianEventManager.unsubscribe(subscriptionId);
      }
      if (cleanupInterval) {
        clearInterval(cleanupInterval);
      }
    };
  }, [politicianId]);

  useEffect(() => {
    setViewerCount(recentViewers.size);
  }, [recentViewers]);

  if (viewerCount === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-1 text-sm text-muted-foreground', className)}>
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <span>{viewerCount} viewing now</span>
    </div>
  );
}

/**
 * Activity Feed Component
 * Shows a feed of recent activities for a politician
 */
interface ActivityFeedProps {
  politicianId: string;
  maxItems?: number;
  className?: string;
}

export function ActivityFeed({ politicianId, maxItems = 10, className }: ActivityFeedProps) {
  const [activities, setActivities] = useState<PoliticianActivityEvent[]>([]);

  useEffect(() => {
    let subscriptionId: string;

    const initializeActivityFeed = async () => {
      try {
        await politicianEventManager.initialize();

        subscriptionId = politicianEventManager.subscribeToPoliticianActivity(
          politicianId,
          (event) => {
            setActivities(prev => {
              const newActivities = [event, ...prev].slice(0, maxItems);
              return newActivities;
            });
          }
        );
      } catch (error) {
        console.error('Failed to initialize activity feed:', error);
      }
    };

    initializeActivityFeed();

    return () => {
      if (subscriptionId) {
        politicianEventManager.unsubscribe(subscriptionId);
      }
    };
  }, [politicianId, maxItems]);

  if (activities.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="text-sm font-medium text-muted-foreground">Recent Activity</h4>
      <div className="space-y-1">
        {activities.map((activity, index) => {
          const config = activityConfig[activity.activityType];
          const timeAgo = formatTimeAgo(Date.now() - (activity.metadata?.timestamp || Date.now()));
          
          return (
            <div
              key={`${activity.userId}-${activity.activityType}-${index}`}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <span>{config.icon}</span>
              <span>Someone {config.label} this profile</span>
              <span className="text-xs opacity-60">{timeAgo}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatTimeAgo(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}