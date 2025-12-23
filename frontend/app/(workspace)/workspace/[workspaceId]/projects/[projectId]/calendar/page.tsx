"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { getCalendarTasks } from "@/redux/slices/taskSlice";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Task } from "@/redux/slices/taskSlice";

export default function CalendarPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useAppDispatch();
  const { calendarTasks, calendarLoading } = useAppSelector((state) => state.task);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (projectId) {
      dispatch(getCalendarTasks({ projectId }));
    }
  }, [projectId, dispatch]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }
    
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return calendarTasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === dateStr;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'todo': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (calendarLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button onClick={goToToday} variant="outline" size="sm">
            Today
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
            {formatMonthYear(currentDate)}
          </h2>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {/* Week Headers */}
          <div className="grid grid-cols-7 border-b">
            {weekDays.map((day) => (
              <div
                key={day}
                className="p-4 text-center text-sm font-medium text-gray-500 bg-gray-50"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dayTasks = getTasksForDate(day.date);
              const isToday = day.date.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-[120px] p-2 border-r border-b relative",
                    !day.isCurrentMonth && "bg-gray-50",
                    isToday && "bg-blue-50"
                  )}
                >
                  <div className={cn(
                    "text-sm font-medium mb-2",
                    !day.isCurrentMonth ? "text-gray-400" : "text-gray-900",
                    isToday && "text-blue-600"
                  )}>
                    {day.date.getDate()}
                  </div>
                  
                  {/* Tasks for this date */}
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="flex items-center gap-1 p-1 rounded text-xs bg-white border hover:shadow-sm transition-shadow">
                          <div className={cn("w-2 h-2 rounded-full", getPriorityColor(task.priority))} />
                          <span className="truncate flex-1">{task.title}</span>
                        </div>
                      </div>
                    ))}
                    
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-gray-500 pl-1">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md relative">
            <CardContent className="p-6">
              {/* Close Button - Positioned Absolute */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedTask(null)}
                className="absolute top-3 right-3 h-8 w-8 text-gray-600 hover:text-gray-700 hover:bg-gray-200 rounded-full"
              >
                ×
              </Button>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pr-8">
                {selectedTask.title}
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status:</span>
                  <Badge className={getStatusColor(selectedTask.status)}>
                    {selectedTask.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Priority:</span>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", getPriorityColor(selectedTask.priority))} />
                    <span className="text-sm capitalize">{selectedTask.priority}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Due:</span>
                  <span className="text-sm">
                    {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'No due date'}
                  </span>
                </div>
                
                {selectedTask.assignedTo && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Assigned to:</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {selectedTask.assignedTo.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{selectedTask.assignedTo.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}