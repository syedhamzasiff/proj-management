// Priority levels for tasks
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

// Status options for tasks
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

// Base Task interface
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  progress?: number;
  assignedTo?: string;
}

// Tasks overview statistics
export interface TasksOverview {
  dueToday: number;
  dueThisWeek: number;
  overdue: number;
  total: number;
  completed: number;
}

// Main dashboard data interface
export interface DashboardData {
  // User information
  userId: string;
  userName: string;
  avatar_url?: string;
  
  // Task categories
  tasksOverview: TasksOverview;
  pinnedTasks: Task[];
  upcomingDeadlines: Task[];
  inProgressTasks: Task[];
  
  // Optional additional data
  lastUpdated?: string;
  notifications?: number;
}

// Optional: If you need specific response types
export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

// Optional: If you need error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}