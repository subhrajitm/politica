/**
 * Background Sync Service for PWA
 */

export interface BackgroundSyncTask {
  id: string;
  type: 'favourite' | 'search' | 'interaction' | 'settings';
  action: 'add' | 'remove' | 'update';
  data: any;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

export class BackgroundSyncService {
  private static instance: BackgroundSyncService;
  private tasks: BackgroundSyncTask[] = [];
  private isRegistered: boolean = false;

  private constructor() {
    this.init();
  }

  static getInstance(): BackgroundSyncService {
    if (!BackgroundSyncService.instance) {
      BackgroundSyncService.instance = new BackgroundSyncService();
    }
    return BackgroundSyncService.instance;
  }

  private async init(): Promise<void> {
    // Load pending tasks from localStorage
    this.loadTasks();

    // Register background sync if supported
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('background-sync');
        this.isRegistered = true;
        console.log('Background sync registered');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }

    // Fallback: periodic sync when online
    if (!this.isRegistered) {
      this.startPeriodicSync();
    }
  }

  // Add task to background sync queue
  addTask(task: Omit<BackgroundSyncTask, 'id' | 'timestamp' | 'retries'>): void {
    const syncTask: BackgroundSyncTask = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: task.maxRetries || 3,
    };

    this.tasks.push(syncTask);
    this.saveTasks();

    // Trigger background sync if supported
    if (this.isRegistered) {
      navigator.serviceWorker.ready.then(registration => {
        return registration.sync.register('background-sync');
      }).catch(error => {
        console.error('Failed to trigger background sync:', error);
      });
    }

    console.log('Background sync task added:', syncTask);
  }

  // Process all pending tasks
  async processTasks(): Promise<void> {
    if (this.tasks.length === 0) {
      return;
    }

    console.log(`Processing ${this.tasks.length} background sync tasks`);

    const tasksToProcess = [...this.tasks];
    const completedTasks: string[] = [];
    const failedTasks: BackgroundSyncTask[] = [];

    for (const task of tasksToProcess) {
      try {
        const success = await this.processTask(task);
        if (success) {
          completedTasks.push(task.id);
        } else {
          task.retries++;
          if (task.retries < task.maxRetries) {
            failedTasks.push(task);
          } else {
            console.error('Max retries reached for background sync task:', task);
          }
        }
      } catch (error) {
        console.error('Error processing background sync task:', task, error);
        task.retries++;
        if (task.retries < task.maxRetries) {
          failedTasks.push(task);
        }
      }
    }

    // Update task list
    this.tasks = failedTasks;
    this.saveTasks();

    console.log(`Background sync completed: ${completedTasks.length} successful, ${failedTasks.length} failed`);
  }

  private async processTask(task: BackgroundSyncTask): Promise<boolean> {
    switch (task.type) {
      case 'favourite':
        return await this.processFavouriteTask(task);
      case 'search':
        return await this.processSearchTask(task);
      case 'interaction':
        return await this.processInteractionTask(task);
      case 'settings':
        return await this.processSettingsTask(task);
      default:
        console.warn('Unknown background sync task type:', task.type);
        return false;
    }
  }

  private async processFavouriteTask(task: BackgroundSyncTask): Promise<boolean> {
    try {
      const endpoint = task.action === 'add' 
        ? '/api/favourites/add'
        : '/api/favourites/remove';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task.data),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to process favourite task:', error);
      return false;
    }
  }

  private async processSearchTask(task: BackgroundSyncTask): Promise<boolean> {
    try {
      const response = await fetch('/api/search/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task.data),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to process search task:', error);
      return false;
    }
  }

  private async processInteractionTask(task: BackgroundSyncTask): Promise<boolean> {
    try {
      const response = await fetch('/api/interactions/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task.data),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to process interaction task:', error);
      return false;
    }
  }

  private async processSettingsTask(task: BackgroundSyncTask): Promise<boolean> {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task.data),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to process settings task:', error);
      return false;
    }
  }

  private loadTasks(): void {
    try {
      const saved = localStorage.getItem('background_sync_tasks');
      if (saved) {
        this.tasks = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load background sync tasks:', error);
      this.tasks = [];
    }
  }

  private saveTasks(): void {
    try {
      localStorage.setItem('background_sync_tasks', JSON.stringify(this.tasks));
    } catch (error) {
      console.error('Failed to save background sync tasks:', error);
    }
  }

  private startPeriodicSync(): void {
    // Fallback periodic sync every 2 minutes when online
    setInterval(() => {
      if (navigator.onLine && this.tasks.length > 0) {
        this.processTasks();
      }
    }, 2 * 60 * 1000);
  }

  // Public API
  getPendingTasksCount(): number {
    return this.tasks.length;
  }

  clearTasks(): void {
    this.tasks = [];
    this.saveTasks();
  }

  getTasks(): BackgroundSyncTask[] {
    return [...this.tasks];
  }
}

// Convenience functions for common background sync operations
export const backgroundSync = {
  addFavourite: (politicianId: string, userId: string) => {
    BackgroundSyncService.getInstance().addTask({
      type: 'favourite',
      action: 'add',
      data: { politicianId, userId },
      maxRetries: 3,
    });
  },

  removeFavourite: (politicianId: string, userId: string) => {
    BackgroundSyncService.getInstance().addTask({
      type: 'favourite',
      action: 'remove',
      data: { politicianId, userId },
      maxRetries: 3,
    });
  },

  trackSearch: (query: string, userId?: string) => {
    BackgroundSyncService.getInstance().addTask({
      type: 'search',
      action: 'add',
      data: { query, userId, timestamp: Date.now() },
      maxRetries: 2,
    });
  },

  trackInteraction: (type: string, targetId: string, userId?: string) => {
    BackgroundSyncService.getInstance().addTask({
      type: 'interaction',
      action: 'add',
      data: { type, targetId, userId, timestamp: Date.now() },
      maxRetries: 2,
    });
  },

  updateSettings: (settings: any, userId: string) => {
    BackgroundSyncService.getInstance().addTask({
      type: 'settings',
      action: 'update',
      data: { settings, userId },
      maxRetries: 3,
    });
  },
};

export default BackgroundSyncService;