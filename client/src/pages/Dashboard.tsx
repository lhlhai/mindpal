import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, List } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { EntryCard } from "@/components/EntryCard";
import { QuickAddModal } from "@/components/QuickAddModal";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function Dashboard() {
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // Fetch today's entries
  const todayQuery = trpc.entries.getToday.useQuery();

  // Fetch upcoming entries
  const upcomingQuery = trpc.entries.getUpcoming.useQuery();

  // Fetch recent entries
  const recentQuery = trpc.entries.getRecent.useQuery({ limit: 5 });

  const utils = trpc.useUtils();

  const updateMutation = trpc.entries.update.useMutation({
    onSuccess: (_, variables) => {
      toast.success(
        variables.status === "done"
          ? "Entry marked as done"
          : "Entry marked as pending"
      );
      utils.entries.getToday.invalidate();
      utils.entries.getUpcoming.invalidate();
      utils.entries.getRecent.invalidate();
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

  const handleDelete = async (id: string) => {
    // TODO: Implement delete functionality
    toast.info("Delete functionality coming soon");
  };

  const handleQuickAddSuccess = () => {
    utils.entries.getToday.invalidate();
    utils.entries.getUpcoming.invalidate();
    utils.entries.getRecent.invalidate();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border sticky top-0 z-10 bg-background/95 backdrop-blur">
        <div className="container py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">MindPal</h1>
            <p className="text-sm text-muted-foreground">Your second brain</p>
          </div>
          <div className="flex gap-2">
            <Link href="/entries">
              <Button variant="outline" size="sm" className="gap-2">
                <List className="w-4 h-4" />
                All Entries
              </Button>
            </Link>
            <Link href="/calendar">
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="w-4 h-4" />
                Calendar
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" size="sm" className="gap-2">
                ⚙️
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 space-y-8">
        {/* Today Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Today</h2>
            <span className="text-sm text-muted-foreground">
              {todayQuery.data?.length || 0} items
            </span>
          </div>
          <div className="grid gap-4">
            {todayQuery.isLoading ? (
              <>
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </>
            ) : todayQuery.data && todayQuery.data.length > 0 ? (
              todayQuery.data.map((entry: any) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onToggleDone={handleToggleDone}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No entries for today</p>
                  <Button
                    variant="link"
                    onClick={() => setQuickAddOpen(true)}
                    className="mt-2"
                  >
                    Create one now
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Upcoming Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Upcoming (Next 7 Days)</h2>
            <span className="text-sm text-muted-foreground">
              {upcomingQuery.data?.length || 0} items
            </span>
          </div>
          <div className="grid gap-4">
            {upcomingQuery.isLoading ? (
              <>
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </>
            ) : upcomingQuery.data && upcomingQuery.data.length > 0 ? (
              upcomingQuery.data.map((entry: any) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onToggleDone={handleToggleDone}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No upcoming entries</p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Recently Added Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Recently Added</h2>
            <Link href="/entries">
              <Button variant="link" size="sm">
                View all
              </Button>
            </Link>
          </div>
          <div className="grid gap-4">
            {recentQuery.isLoading ? (
              <>
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </>
            ) : recentQuery.data && recentQuery.data.length > 0 ? (
              recentQuery.data.map((entry: any) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onToggleDone={handleToggleDone}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No entries yet</p>
                  <Button
                    variant="link"
                    onClick={() => setQuickAddOpen(true)}
                    className="mt-2"
                  >
                    Create your first entry
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8">
        <Button
          onClick={() => setQuickAddOpen(true)}
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow gap-2"
        >
          <Plus className="w-5 h-5" />
          Quick Add
        </Button>
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        onSuccess={handleQuickAddSuccess}
      />
    </div>
  );
}
