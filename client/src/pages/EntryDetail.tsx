import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, CheckCircle2, Circle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function EntryDetail() {
  const [, params] = useRoute("/entries/:id");
  const entryId = params?.id;

  const entryQuery = trpc.entries.get.useQuery({ id: entryId || "" }, { enabled: !!entryId });
  const updateMutation = trpc.entries.update.useMutation({
    onSuccess: () => {
      toast.success("Entry updated successfully");
      entryQuery.refetch();
    },
    onError: () => {
      toast.error("Failed to update entry");
    },
  });

  const [formData, setFormData] = useState<{
    title: string;
    type: "task" | "event" | "knowledge" | "note";
    status: "pending" | "done" | "archived";
    priority: "high" | "medium" | "low";
    datetime: string;
    endDatetime: string;
    tags: string[];
    people: string[];
    notes: string;
  }>({
    title: "",
    type: "note",
    status: "pending",
    priority: "medium",
    datetime: "",
    endDatetime: "",
    tags: [],
    people: [],
    notes: "",
  });

  // Update form when entry loads
  useEffect(() => {
    if (entryQuery.data) {
      setFormData({
        title: entryQuery.data.title || "",
        type: entryQuery.data.type,
        status: entryQuery.data.status,
        priority: entryQuery.data.priority,
        datetime: entryQuery.data.datetime ? format(new Date(entryQuery.data.datetime), "yyyy-MM-dd'T'HH:mm") : "",
        endDatetime: entryQuery.data.endDatetime ? format(new Date(entryQuery.data.endDatetime), "yyyy-MM-dd'T'HH:mm") : "",
        tags: (entryQuery.data.tags as string[]) || [],
        people: (entryQuery.data.people as string[]) || [],
        notes: entryQuery.data.notes || "",
      });
    }
  }, [entryQuery.data]);

  const handleSubmit = () => {
    if (!entryId) return;

    updateMutation.mutate({
      id: entryId,
      title: formData.title,
      type: formData.type,
      status: formData.status,
      priority: formData.priority,
      datetime: formData.datetime || undefined,
      endDatetime: formData.endDatetime || undefined,
      tags: formData.tags,
      people: formData.people,
      notes: formData.notes,
    });
  };

  const handleToggleDone = () => {
    if (!entryId) return;
    updateMutation.mutate({
      id: entryId,
      status: (formData.status as any) === "done" ? "pending" : "done",
    });
  };

  if (!entryId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Entry not found</p>
      </div>
    );
  }

  if (entryQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!entryQuery.data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Entry not found</p>
      </div>
    );
  }

  const isDone = formData.status === ("done" as any);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border sticky top-0 z-10 bg-background/95 backdrop-blur">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/entries">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <Button
            onClick={handleToggleDone}
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            {isDone ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Mark as Pending
              </>
            ) : (
              <>
                <Circle className="w-5 h-5 text-muted-foreground" />
                Mark as Done
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Raw Text */}
          <Card>
            <CardHeader>
              <CardTitle>Original Text</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground whitespace-pre-wrap">{entryQuery.data.rawText}</p>
            </CardContent>
          </Card>

          {/* Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle>Edit Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Entry title"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Type</label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="knowledge">Knowledge</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Priority</label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Date & Time</label>
                  <Input
                    type="datetime-local"
                    value={formData.datetime}
                    onChange={(e) => setFormData({ ...formData, datetime: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">End Date & Time</label>
                  <Input
                    type="datetime-local"
                    value={formData.endDatetime}
                    onChange={(e) => setFormData({ ...formData, endDatetime: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Tags</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            tags: formData.tags.filter((t) => t !== tag),
                          })
                        }
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">People</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.people.map((person) => (
                    <Badge key={person} variant="outline">
                      {person}
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            people: formData.people.filter((p) => p !== person),
                          })
                        }
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes"
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Link href="/entries">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button
                  onClick={handleSubmit}
                  disabled={updateMutation.isPending}
                  className="gap-2"
                >
                  {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
