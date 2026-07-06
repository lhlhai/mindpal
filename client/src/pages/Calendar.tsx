import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const entriesQuery = trpc.entries.list.useQuery({
    limit: 1000,
    offset: 0,
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Get the first day of the week for the month (0 = Sunday)
  const firstDayOfWeek = monthStart.getDay();
  
  // Create array with leading empty cells
  const leadingEmptyCells = Array(firstDayOfWeek).fill(null);
  
  // Get all days in month
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Calculate trailing empty cells to complete the grid
  const totalCells = leadingEmptyCells.length + daysInMonth.length;
  const trailingEmptyCells = Array(Math.ceil(totalCells / 7) * 7 - totalCells).fill(null);
  
  // Combine all cells
  const calendarCells = [...leadingEmptyCells, ...daysInMonth, ...trailingEmptyCells];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEntriesForDay = (day: Date) => {
    if (!entriesQuery.data) return [];
    return entriesQuery.data.filter((entry: any) => {
      if (!entry.datetime) return false;
      const entryDate = new Date(entry.datetime);
      return isSameDay(entryDate, day);
    });
  };

  const typeColors: Record<string, string> = {
    task: "bg-blue-100 text-blue-800",
    event: "bg-purple-100 text-purple-800",
    knowledge: "bg-green-100 text-green-800",
    note: "bg-gray-100 text-gray-800",
  };

  const renderCalendarCell = (day: Date | null, index: number) => {
    if (!day) {
      return <div key={`empty-${index}`} className="bg-muted/10 rounded-lg" />;
    }

    const dayEntries = getEntriesForDay(day);
    const isCurrentMonth = isSameMonth(day, currentDate);
    const isToday = isSameDay(day, new Date());

    return (
      <div
        key={day.toISOString()}
        className={`border rounded-lg p-2 overflow-hidden ${
          isCurrentMonth ? "bg-card" : "bg-muted/30"
        } ${isToday ? "border-accent border-2" : "border-border"}`}
      >
        <div className="text-xs font-semibold text-foreground mb-1">
          {format(day, "d")}
        </div>
        <div className="space-y-1">
          {dayEntries.slice(0, 2).map((entry: any) => (
            <Link key={entry.id} href={`/entries/${entry.id}`}>
              <Badge
                className={`text-xs cursor-pointer line-clamp-1 ${
                  typeColors[entry.type] || typeColors.note
                }`}
              >
                {entry.title || "Untitled"}
              </Badge>
            </Link>
          ))}
          {dayEntries.length > 2 && (
            <p className="text-xs text-muted-foreground">
              +{dayEntries.length - 2} more
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border sticky top-0 z-10 bg-background/95 backdrop-blur">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
          <div className="w-24" />
        </div>
      </div>

      {/* Calendar */}
      <div className="container py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevMonth}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <h2 className="text-xl font-semibold text-foreground">
                {format(currentDate, "MMMM yyyy", { locale: vi })}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                className="gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-sm text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 auto-rows-[120px]">
              {calendarCells.map((day, index) => renderCalendarCell(day, index))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
