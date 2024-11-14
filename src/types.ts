export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'completed';
  dueDate: string;
}

export interface RecentTask {
  id: string;
  title: string;
  updatedAt: string;
}

export interface Deadline {
  id: string;
  title: string;
  dueDate: string;
}

export interface ActivityData {
  day: string;
  tasks: number;
}

export interface DashboardData {
  userName: string;
  tasks: Task[];
  recentTasks: RecentTask[];
  upcomingDeadlines: Deadline[];
  activityData: ActivityData[];
}



