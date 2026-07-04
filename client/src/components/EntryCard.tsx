import { Entry } from "@/types/entry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface EntryCardProps {
  entry: Entry;
  onToggleDone?: (id: string, done: boolean) => void;
  onDelete?: (id: string) => void;
}

const typeColors: Record<string, string> = {
  task: "bg-blue-100 text-blue-800",
  event: "bg-purple-100 text-purple-800",
  knowledge: "bg-green-100 text-green-800",
  note: "bg-gray-100 text-gray-800",
};

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

export function EntryCard({ entry, onToggleDone, onDelete }: EntryCardProps) {
  const isDone = entry.status === "done";
  const formattedDate = entry.datetime
    ? format(new Date(entry.datetime), "PPP p", { locale: vi })
    : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <Link href={`/entries/${entry.id}`}>
              <CardTitle className={`text-base hover:underline cursor-pointer ${isDone ? "line-through text-muted-foreground" : ""}`}>
                {entry.title || "Untitled"}
              </CardTitle>
            </Link>
            {formattedDate && (
              <p className="text-sm text-muted-foreground mt-1">{formattedDate}</p>
            )}
          </div>
          <div className="flex gap-1">
            {onToggleDone && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleDone(entry.id, !isDone)}
                className="h-8 w-8 p-0"
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-foreground line-clamp-2">{entry.summary || entry.rawText}</p>

        <div className="flex flex-wrap gap-2">
          <Badge className={typeColors[entry.type] || typeColors.note}>
            {entry.type}
          </Badge>
          <Badge className={priorityColors[entry.priority] || priorityColors.medium}>
            {entry.priority}
          </Badge>
          {entry.tags && Array.isArray(entry.tags) && entry.tags.length > 0 && (
            <>
              {entry.tags.slice(0, 2).map((tag: any) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {entry.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{entry.tags.length - 2}
                </Badge>
              )}
            </>
          )}
        </div>

        {onDelete && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(entry.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
