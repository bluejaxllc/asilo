"use client";

import { useState } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface CalendarProps {
    tasks: any[];
}

export const StaffCalendar = ({ tasks }: CalendarProps) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const firstDay = startOfMonth(currentMonth);
    const lastDay = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: firstDay, end: lastDay });

    const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const getTasksForDay = (date: Date) => {
        return tasks.filter(task => {
            if (!task.dueDate) return false;
            return isSameDay(new Date(task.dueDate), date);
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold capitalize">
                    {format(currentMonth, "MMMM yyyy", { locale: es })}
                </h3>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={previousMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setCurrentMonth(new Date())}>
                        Hoy
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-slate-200 border rounded-lg overflow-hidden">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                    <div key={day} className="bg-slate-50 p-2 text-center text-sm font-medium text-slate-500">
                        {day}
                    </div>
                ))}

                {/* Add empty cells for start of month padding if needed - simplified for now to just show days */}
                {Array.from({ length: firstDay.getDay() }).map((_, i) => (
                    <div key={`padding-${i}`} className="bg-white min-h-[120px]" />
                ))}

                {days.map((day, dayIdx) => {
                    const dayTasks = getTasksForDay(day);

                    return (
                        <div
                            key={day.toString()}
                            className={cn(
                                "bg-white min-h-[120px] p-2 hover:bg-slate-50 transition-colors relative group",
                                isToday(day) && "bg-blue-50/30"
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={cn(
                                    "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                                    isToday(day) ? "bg-blue-600 text-white" : "text-slate-700"
                                )}>
                                    {format(day, "d")}
                                </span>
                                {dayTasks.length > 0 && (
                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                                        {dayTasks.length}
                                    </Badge>
                                )}
                            </div>

                            <div className="space-y-1">
                                {dayTasks.slice(0, 3).map((task) => (
                                    <TooltipProvider key={task.id}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className={cn(
                                                        "text-xs p-1.5 rounded border truncate cursor-pointer",
                                                        task.status === "COMPLETED"
                                                            ? "bg-slate-100 text-slate-500 line-through border-slate-200"
                                                            : "bg-white border-blue-100 text-blue-700 hover:border-blue-300 shadow-sm"
                                                    )}
                                                >
                                                    {task.title}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                <div className="space-y-1">
                                                    <p className="font-medium">{task.title}</p>
                                                    <div className="text-xs text-muted-foreground grid gap-1">
                                                        {task.patient && (
                                                            <div className="flex items-center gap-1">
                                                                <User className="h-3 w-3" />
                                                                {task.patient.name}
                                                            </div>
                                                        )}
                                                        {task.dueDate && (
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {format(new Date(task.dueDate), "HH:mm")}
                                                            </div>
                                                        )}
                                                        <div>Prioridad: {task.priority}</div>
                                                    </div>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                                {dayTasks.length > 3 && (
                                    <div className="text-[10px] text-muted-foreground pl-1">
                                        + {dayTasks.length - 3} más
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
