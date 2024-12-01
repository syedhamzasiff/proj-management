// Priority levels for tasks
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

// Status options for tasks
export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE';

export type TaskType = 'FEATURE' | 'BUG' | 'TASK'

// Base Task interface
export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  progress?: number;
  assignments?: { user: { id: string; name: string; email?: string } }[]; 
}


export interface Column {
  id: TaskStatus;
  title: string;
  tasks: Task[];
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


// types.ts
export interface Workspace {
  id: string
  name: string
  type: 'personal' | 'shared'
  stats: {
    totalProjects: number
    completedProjects: number
    totalTasks: number
    completedTasks: number
  }
  members: Array<{
    id: string
    name: string
    avatar: string | null
    online: boolean
  }>
  projects: Array<{
    id: string
    name: string
    progress: number
    completedTasks: number
    tasks: number
  }>
  activities: Array<{
    id: string
    user: string
    action: string
    project: string
    time: string
  }>
}
