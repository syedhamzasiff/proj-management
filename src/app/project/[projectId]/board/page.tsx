'use client';

import { useState, useEffect } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useParams } from 'next/navigation';
import { Loader2, Plus } from 'lucide-react';

interface Task {
  id: string;
  content: string;
  assignee: string;
  status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'Low' | 'Medium' | 'High';
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

interface Columns {
  [key: string]: Column;
}

const initialColumns: Columns = {
  backlog: { id: 'backlog', title: 'Backlog', tasks: [] },
  todo: { id: 'todo', title: 'To Do', tasks: [] },
  inProgress: { id: 'inProgress', title: 'In Progress', tasks: [] },
  done: { id: 'done', title: 'Done', tasks: [] },
};

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Columns>(initialColumns);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<{ taskId: string; newStatus: string }[]>([]);
  const [newTask, setNewTask] = useState<Task>({
    id: '',
    content: '',
    assignee: '',
    status: 'BACKLOG',
    priority: 'Medium',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  const params = useParams();
  const projectId = params?.projectId as string;

  useEffect(() => {
    if (!projectId) return;

    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(`/api/project/${projectId}/tasks?view=kanban`);
        if (!res.ok) throw new Error('Failed to fetch tasks');
        const data = await res.json();

        if (!data || !data.data) {
          throw new Error('Invalid response from server');
        }

        const formattedColumns: Columns = { ...initialColumns };
        data.data.forEach(({ status, tasks }: any) => {
          const columnId = status.toLowerCase();
          if (formattedColumns[columnId]) {
            formattedColumns[columnId].tasks = (tasks || []).map((task: any) => ({
              id: task.id,
              content: task.title,
              assignee: task.assignedUsers
                ?.map((user: any) => user.name)
                .join(', ') || 'Unassigned',
              status: status.toUpperCase() as Task['status'],
              priority: task.priority || 'Medium',
            }));
          }
        });

        setColumns(formattedColumns);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  const openAddTaskModal = () => {
    setIsAddTaskModalOpen(true);
  };

  const closeAddTaskModal = () => {
    setIsAddTaskModalOpen(false);
    setNewTask({
      id: '',
      content: '',
      assignee: '',
      status: 'BACKLOG',
      priority: 'Medium',
    });
  };

  const handleAddTask = async () => {
    if (!newTask.content) return;

    const newTaskWithId = { ...newTask, id: `t${Date.now()}` };

    try {
      const response = await fetch(`/api/project/${projectId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTaskWithId),
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      setColumns((prevColumns) => ({
        ...prevColumns,
        [newTaskWithId.status.toLowerCase()]: {
          ...prevColumns[newTaskWithId.status.toLowerCase()],
          tasks: [...prevColumns[newTaskWithId.status.toLowerCase()].tasks, newTaskWithId],
        },
      }));

      closeAddTaskModal();
    } catch (error) {
      console.error('Error adding task:', error);
      setError('Failed to add task. Please try again.');
    }
  };

  // const sendBatchUpdates = async () => {
  //   if (pendingUpdates.length === 0) return;

  //   try {
  //     const response = await fetch(`/api/project/${projectId}/tasks/update-status`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ updates: pendingUpdates }),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to update tasks');
  //     }

  //     // Clear pending updates after a successful request
  //     setPendingUpdates([]);
  //   } catch (error) {
  //     console.error('Error updating tasks:', error);
  //     setError('Failed to update tasks. Please try again.');
  //   }
  // };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) return;
  
    const dragColumnId = active.data.current?.columnId as string;
    const targetColumnId = String(over.id).toLowerCase();
  
    if (dragColumnId && targetColumnId && dragColumnId !== targetColumnId) {
      const draggedTask = active.data.current?.task as Task;
  
      // Optimistically update the UI
      setColumns((prevColumns) => {
        const sourceColumn = prevColumns[dragColumnId];
        const targetColumn = prevColumns[targetColumnId];
  
        return {
          ...prevColumns,
          [dragColumnId]: {
            ...sourceColumn,
            tasks: sourceColumn.tasks.filter((t) => t.id !== draggedTask.id),
          },
          [targetColumnId]: {
            ...targetColumn,
            tasks: [
              ...targetColumn.tasks,
              { ...draggedTask, status: targetColumnId.toUpperCase() as Task['status'] },
            ],
          },
        };
      });
  
      // Make an immediate API call to update the task
      try {
        await fetch(`/api/project/${projectId}/tasks/update-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            updates: [
              { taskId: draggedTask.id, newStatus: targetColumnId.toUpperCase() },
            ],
          }),
        });
      } catch (error) {
        console.error('Error updating task:', error);
        setError('Failed to update task. Please try again.');
      }
    }
  };
  

  const TaskCard = ({ task, columnId }: { task: Task; columnId: string }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: task.id,
      data: { columnId, task },
    });

    const style = {
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
        <Card className="mb-2 bg-white">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">{task.content}</h3>
            <div className="text-sm text-gray-500 mb-2">Assignee: {task.assignee}</div>
            <div className="text-sm">
              Priority:
              <span
                className={`ml-1 px-2 py-1 rounded-full text-xs ${
                  task.priority === 'High'
                    ? 'bg-red-100 text-red-800'
                    : task.priority === 'Medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {task.priority}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const Column = ({ column }: { column: Column }) => {
    const { isOver, setNodeRef } = useDroppable({ id: column.id });
    const style = isOver ? 'bg-gray-100' : 'bg-white';

    return (
      <div ref={setNodeRef} className={`flex-shrink-0 w-80 p-4 rounded-lg ${style}`}>
        <h2 className="text-lg font-semibold mb-4">{column.title}</h2>
        <div className="space-y-2 min-h-[200px]">
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} columnId={column.id} />
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 overflow-x-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kanban Board</h1>
        <Button onClick={openAddTaskModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex space-x-4 pb-4 min-w-max">
          {Object.values(columns).map((column) => (
            <Column key={column.id} column={column} />
          ))}
        </div>
      </DndContext>

      <Dialog open={isAddTaskModalOpen} onOpenChange={closeAddTaskModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="taskTitle">Title</Label>
              <Input
                id="taskTitle"
                value={newTask.content}
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, content: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="taskAssignee">Assignee</Label>
              <Input
                id="taskAssignee"
                value={newTask.assignee}
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, assignee: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="taskStatus">Status</Label>
              <Select
                value={newTask.status}
                onValueChange={(value) =>
                  setNewTask((prev) => ({ ...prev, status: value as Task['status'] }))
                }
              >
                <SelectTrigger id="taskStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BACKLOG">Backlog</SelectItem>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="taskPriority">Priority</Label>
              <Select
                value={newTask.priority}
                onValueChange={(value) =>
                  setNewTask((prev) => ({ ...prev, priority: value as Task['priority'] }))
                }
              >
                <SelectTrigger id="taskPriority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddTask} className="w-full">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
