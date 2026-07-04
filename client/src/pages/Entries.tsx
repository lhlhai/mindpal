import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { EntryCard } from "@/components/EntryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function Entries() {
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTag, setFilterTag] = useState<string>("all");

  const entriesQuery = trpc.entries.list.useQuery({
    limit: 100,
    offset: 0,
    type: filterType === "all" ? undefined : (filterType as any),
    status: filterStatus === "all" ? undefined : (filterStatus as any),
    tag: filterTag === "all" ? undefined : filterTag,
  });

  const tagsQuery = trpc.entries.getTags.useQuery();

  const utils = trpc.useUtils();

  const updateMutation = trpc.entries.update.useMutation({
    onSuccess: () => {
      utils.entries.list.invalidate();
    },
    onError: () => {
      toast.error("Failed to update entry");
    },
  });

  const handleToggleDone = (id: string, done: boolean) => {
    updateMutation.mutate({
      id,
      status: done ? "done" : "pending",
    });
  };

  const handleDelete = (id: string) => {
    toast.info("Delete functionality coming soon");
  };

  // Filter entries by search text
  const filteredEntries = entriesQuery.data?.filter((entry) => {
    const searchLower = searchText.toLowerCase();
    return (
      (entry.title?.toLowerCase().includes(searchLower) || false) ||
      entry.rawText.toLowerCase().includes(searchLower)
    );
  }) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border sticky top-0 z-10 bg-background/95 backdrop-blur">
        <div className="container py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">All Entries</h1>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border bg-card/50">
        <div className="container py-4 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search entries..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="task">Tasks</SelectItem>
                <SelectItem value="event">Events</SelectItem>
                <SelectItem value="knowledge">Knowledge</SelectItem>
                <SelectItem value="note">Notes</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {tagsQuery.data?.map((tag) => (
                  <SelectItem key={tag.id} value={tag.name}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        <div className="space-y-4">
          {entriesQuery.isLoading ? (
            <>
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </>
          ) : filteredEntries.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                {filteredEntries.length} entries found
              </p>
              {filteredEntries.map((entry: any) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onToggleDone={handleToggleDone}
                  onDelete={handleDelete}
                />
              ))}
            </>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No entries found</p>
                <Link href="/">
                  <Button>Go back to Dashboard</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
