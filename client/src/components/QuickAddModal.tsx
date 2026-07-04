import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Mic, MicOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function QuickAddModal({ open, onOpenChange, onSuccess }: QuickAddModalProps) {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  const processEntryMutation = trpc.entries.processEntry.useMutation({
    onSuccess: () => {
      toast.success("Entry created successfully!");
      setText("");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create entry");
    },
  });

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSpeechSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "vi-VN"; // Vietnamese

        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              setText((prev) => prev + (prev ? " " : "") + transcript);
            } else {
              interimTranscript += transcript;
            }
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          toast.error("Microphone error: " + event.error);
          setIsListening(false);
        };
      } else {
        setIsSpeechSupported(false);
      }
    } else {
      setIsSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleStartListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text");
      return;
    }

    processEntryMutation.mutate({ rawText: text.trim() });
  };

  const handleClose = () => {
    if (isListening) {
      handleStopListening();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Quick Dump</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            placeholder="Type or speak your thoughts, tasks, events, or knowledge..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[150px] resize-none"
            disabled={processEntryMutation.isPending}
          />

          {isSpeechSupported ? (
            <div className="flex gap-2">
              {!isListening ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartListening}
                  disabled={processEntryMutation.isPending}
                  className="gap-2"
                >
                  <Mic className="w-4 h-4" />
                  Start Recording
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStopListening}
                  className="gap-2 bg-red-50 hover:bg-red-100 text-red-600"
                >
                  <MicOff className="w-4 h-4" />
                  Stop Recording
                </Button>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Voice input not supported in your browser</p>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={processEntryMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={processEntryMutation.isPending || !text.trim()}
              className="gap-2"
            >
              {processEntryMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Entry
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
