'use client';

import { useState, useEffect } from 'react';
import { DndContext, closestCenter, UniqueIdentifier } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useParams } from 'next/navigation';

interface Task {
  id: string;
  content: string;
  assignee: string;
  description?: string;
  dueDate?: string;
  priority?: 'Low' | 'Medium' | 'High';
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

interface Columns {
  [key: string]: Column;
}

function KanbanBoard() {
  const [columns, setColumns] = useState<Columns>({
    backlog: { id: 'backlog', title: 'Backlog', tasks: [] },
    inProgress: { id: 'inProgress', title: 'In Progress', tasks: [] },
    done: { id: 'done', title: 'Done', tasks: [] },
  });
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState<Task>({
    id: '',
    content: '',
    assignee: '',
    priority: 'Medium',
  });

  const params = useParams();
  const projectId = params?.projectId;

  useEffect(() => {
    if (!projectId) return;

    const fetchTasks = async () => {
      try {
        const res = await fetch(`/api/project/${projectId}/tasks?view=kanban`);
        if (!res.ok) throw new Error('Failed to fetch tasks');
        const data = await res.json();

        const formattedColumns: Columns = data?.data?.reduce(
          (acc: Columns, { status, tasks }: any) => {
            acc[status] = {
              id: status,
              title: status.replace(/-/g, ' ').toUpperCase(),
              tasks: tasks.map((task: any) => ({
                id: task.id,
                content: task.title,
                assignee: task.assignedUsers
                  .map((user: any) => user.name)
                  .join(', ') || 'Unassigned',
                description: task.description,
                dueDate: task.due_date,
                priority: task.priority,
              })),
            };
            return acc;
          },
          {}
        );

        setColumns(formattedColumns);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [projectId]);

  const openAddTaskModal = (columnId: string) => {
    setActiveColumnId(columnId);
    setIsAddTaskModalOpen(true);
  };

  const closeAddTaskModal = () => {
    setIsAddTaskModalOpen(false);
    setNewTask({
      id: '',
      content: '',
      assignee: '',
      priority: 'Medium',
    });
  };

  const handleAddTask = () => {
    if (!activeColumnId) return;

    const newTaskWithId = { ...newTask, id: `t${Date.now()}` };
    setColumns((prevColumns) => ({
      ...prevColumns,
      [activeColumnId]: {
        ...prevColumns[activeColumnId],
        tasks: [...prevColumns[activeColumnId].tasks, newTaskWithId],
      },
    }));

    closeAddTaskModal();
  };

  const moveTask = (
    dragIndex: number,
    hoverIndex: number,
    dragColumnId: string,
    targetColumnId: string
  ) => {
    const sourceColumn = columns[dragColumnId];
    const targetColumn = columns[targetColumnId];

    const updatedSourceTasks = [...sourceColumn.tasks];
    const [movedTask] = updatedSourceTasks.splice(dragIndex, 1);

    const updatedTargetTasks = [...targetColumn.tasks];
    if (dragColumnId === targetColumnId) {
      arrayMove(updatedTargetTasks, dragIndex, hoverIndex);
    } else {
      updatedTargetTasks.splice(hoverIndex, 0, movedTask);
    }

    setColumns((prevColumns) => ({
      ...prevColumns,
      [dragColumnId]: {
        ...sourceColumn,
        tasks: updatedSourceTasks,
      },
      [targetColumnId]: {
        ...targetColumn,
        tasks: updatedTargetTasks,
      },
    }));
  };

  const TaskCard = ({ task, index, columnId }: { task: Task; index: number; columnId: string }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: task.id,
      data: { columnId, index },
    });

    const style = {
      transform: `translate3d(${transform?.x ?? 0}px, ${transform?.y ?? 0}px, 0)`,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
        <Card className="mb-2 bg-white">
          <CardContent className="p-4">
            <p>{task.content}</p>
            <div className="text-sm text-gray-500 mt-2">{task.assignee}</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const Column = ({ column }: { column: Column }) => {
    const { isOver, setNodeRef } = useDroppable({ id: column.id });
    const style = { backgroundColor: isOver ? '#f0f4f8' : 'inherit' };

    return (
      <div ref={setNodeRef} className="flex-1 min-w-[250px]" style={style}>
        <h2 className="text-lg font-semibold mb-2">{column.title}</h2>
        <div>
          {column.tasks.map((task, index) => (
            <TaskCard key={task.id} task={task} index={index} columnId={column.id} />
          ))}
        </div>
        <Button className="mt-2" onClick={() => openAddTaskModal(column.id)}>
          Add Task
        </Button>
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Kanban Board</h1>
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (!active || !over) return;
          const dragColumnId = active.data.current?.columnId as string;
          const targetColumnId = over.id as string;

          if (dragColumnId && targetColumnId) {
            moveTask(
              active.data.current?.index,
              0,
              dragColumnId,
              targetColumnId
            );
          }
        }}
      >
        <div className="flex space-x-4">
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
          <div>
            <Label>Task Title</Label>
            <Input
              value={newTask.content}
              onChange={(e) => setNewTask((prev) => ({ ...prev, content: e.target.value }))}
            />
            <Label>Assignee</Label>
            <Input
              value={newTask.assignee}
              onChange={(e) => setNewTask((prev) => ({ ...prev, assignee: e.target.value }))}
            />
            <Label>Priority</Label>
            <Select
              value={newTask.priority}
              onValueChange={(value) => setNewTask((prev) => ({ ...prev, priority: value as Task['priority'] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
            <Button className="mt-4" onClick={handleAddTask}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default KanbanBoard;
