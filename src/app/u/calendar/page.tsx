'use client';

import { useEffect, useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isSameDay, startOfDay, endOfDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser } from '@/context/UserContext';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  due_date: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  project: {
    name: string;
  };
  assignments: Array<{
    userId: string;
  }>;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  project: string;
  task: Task;
}

const priorityColors = {
  LOW: 'bg-green-100 text-green-800 hover:bg-green-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  HIGH: 'bg-red-100 text-red-800 hover:bg-red-200',
};

export default function UserCalendar() {
  const { userId } = useUser();  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  //console.log("userId: ", userId)

  useEffect(() => {
    if (!userId) return;

    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/user/${userId}/calendar`);
        if (!response.ok) throw new Error('Failed to fetch tasks');

        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [userId]);

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedTask(event.task);
  };

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      start: startOfDay(new Date(task.due_date)),
      end: endOfDay(new Date(task.due_date)),
      priority: task.priority,
      project: task.project.name,
      task: task,
    }));
  }, [tasks]);

  const TaskDetails = ({ task }: { task: Task }) => (
    <div>
      <p className="text-sm text-gray-500 mb-2">{task.project.name}</p>
      <p className="mb-2">{task.description}</p>
      <p className="text-sm mb-2">
        <strong>Due Date:</strong> {format(new Date(task.due_date), 'PPp')}
      </p>
      <Badge className={`mb-4 ${priorityColors[task.priority]}`}>
        {task.priority} Priority
      </Badge>
      <p className="text-sm mb-1">
        <strong>Status:</strong> {task.status}
      </p>
    </div>
  );

  const dayPropGetter = (date: Date) => {
    const tasksForDay = calendarEvents.filter(event => isSameDay(event.start, date));
    if (tasksForDay.length > 0) {
      return {
        className: 'has-tasks',
        style: {
          backgroundColor: '#f0f9ff',
          borderRadius: '4px',
        },
      };
    }
    return {};
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
    <div className="w-full min-h-screen flex flex-col p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Your Calendar</h1>
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 flex-grow">
          <Card className="h-full">
            <CardContent className="h-full p-4">
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 'calc(100vh - 12rem)' }}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={(event) => ({
                  className: `${priorityColors[event.priority]} cursor-pointer`,
                })}
                dayPropGetter={dayPropGetter}
                views={{
                  month: true,
                  week: true,
                  day: true,
                }}
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                components={{
                  toolbar: CustomToolbar,
                  day: {
                    event: (props) => (
                      <div className="text-sm p-1">
                        <strong>{props.event.title}</strong>
                        <p>{props.event.project}</p>
                      </div>
                    ),
                  },
                }}
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Task List</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-16rem)]">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="mb-4 last:mb-0 cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-colors"
                    onClick={() => setSelectedTask(task)}
                  >
                    <h3 className="font-semibold text-sm">{task.title}</h3>
                    <p className="text-xs text-gray-500">
                      Due: {format(new Date(task.due_date), 'PP')}
                    </p>
                    <Badge
                      className={`mt-1 text-xs ${priorityColors[task.priority]}`}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
          </DialogHeader>
          {selectedTask && <TaskDetails task={selectedTask} />}
          <DialogFooter>
            <Button onClick={() => setSelectedTask(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const CustomToolbar = ({ onNavigate, label, onView, view }: any) => (
  <div className="flex justify-between items-center mb-4">
    <div>
      <Button variant="outline" onClick={() => onNavigate('PREV')}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" onClick={() => onNavigate('NEXT')} className="ml-2">
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button variant="outline" onClick={() => onNavigate('TODAY')} className="ml-2">
        Today
      </Button>
    </div>
    <h2 className="text-xl font-semibold">{label}</h2>
    <div>
      <Button
        variant={view === Views.MONTH ? "default" : "outline"}
        onClick={() => onView(Views.MONTH)}
        className="mr-2"
      >
        Month
      </Button>
      <Button
        variant={view === Views.WEEK ? "default" : "outline"}
        onClick={() => onView(Views.WEEK)}
        className="mr-2"
      >
        Week
      </Button>
      <Button
        variant={view === Views.DAY ? "default" : "outline"}
        onClick={() => onView(Views.DAY)}
      >
        Day
      </Button>
    </div>
  </div>
);