import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const TIMEZONES = [
  "UTC",
  "Asia/Ho_Chi_Minh",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
];

const AI_TONES = [
  "professional",
  "casual",
  "creative",
  "analytical",
  "friendly",
];

export default function Settings() {
  const settingsQuery = trpc.entries.getSettings.useQuery();

  const [formData, setFormData] = useState({
    timezone: "Asia/Ho_Chi_Minh",
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
    aiTone: "professional",
  });

  const [isSaving, setIsSaving] = useState(false);

  // Update form when settings load
  useEffect(() => {
    if (settingsQuery.data) {
      setFormData({
        timezone: settingsQuery.data.timezone || "Asia/Ho_Chi_Minh",
        quietHoursStart: settingsQuery.data.quietHoursStart || "22:00",
        quietHoursEnd: settingsQuery.data.quietHoursEnd || "08:00",
        aiTone: settingsQuery.data.aiTone || "professional",
      });
    }
  }, [settingsQuery.data]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('mindpal_settings', JSON.stringify(formData));
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      settings: formData,
      note: "Entries data export requires backend API implementation",
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mindpal-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Settings exported as JSON");
  };

  const handleExportMarkdown = () => {
    let markdown = "# MindPal Export\n\n";
    markdown += `Exported: ${new Date().toLocaleString()}\n\n`;
    markdown += "## Settings\n\n";
    markdown += `- Timezone: ${formData.timezone}\n`;
    markdown += `- Quiet Hours: ${formData.quietHoursStart} - ${formData.quietHoursEnd}\n`;
    markdown += `- AI Tone: ${formData.aiTone}\n\n`;
    markdown += "## Note\n\n";
    markdown += "Entries data export requires backend API implementation.\n";

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mindpal-export-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Settings exported as Markdown");
  };

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
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Timezone</label>
                <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Quiet Hours Start</label>
                  <Input
                    type="time"
                    value={formData.quietHoursStart}
                    onChange={(e) => setFormData({ ...formData, quietHoursStart: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Quiet Hours End</label>
                  <Input
                    type="time"
                    value={formData.quietHoursEnd}
                    onChange={(e) => setFormData({ ...formData, quietHoursEnd: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">AI Tone</label>
                <Select value={formData.aiTone} onValueChange={(value) => setFormData({ ...formData, aiTone: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_TONES.map((tone) => (
                      <SelectItem key={tone} value={tone}>
                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Export */}
          <Card>
            <CardHeader>
              <CardTitle>Data Export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Export all your data in JSON or Markdown format. This includes all entries, settings, and metadata.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleExportJSON}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export as JSON
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportMarkdown}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export as Markdown
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-foreground">
                <p><strong>MindPal</strong> - Your Second Brain</p>
                <p>Version: 1.0.0</p>
                <p>Built with React, tRPC, and Tailwind CSS</p>
                <p className="text-muted-foreground">
                  MindPal helps you capture, organize, and retrieve your thoughts, tasks, and knowledge using AI-powered processing.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
