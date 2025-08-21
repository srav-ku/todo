export type TaskStatus = 'all' | 'completed' | 'in-progress' | 'pending';

export interface TaskFilterState {
  status: TaskStatus;
}
