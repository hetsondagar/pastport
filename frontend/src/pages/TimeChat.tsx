import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Clock3, Loader2, Sparkles } from "lucide-react";

type Mode = "past" | "present" | "future";

type ChatMsg = {
  role: "user" | "ai";
  content: string;
};

const clampYear = (y: number) => Math.max(2000, Math.min(new Date().getFullYear() + 5, y));

const TimeChat = () => {
  const { user, isAuthenticated } = useAuth();
  const [mode, setMode] = useState<Mode>("present");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "ai",
      content: "Pick a time mode and ask what is on your mind. I am here to help you reflect with warmth and clarity.",
    },
  ]);

  useEffect(() => {
    const prev = document.title;
    document.title = "Time Chat | PastPort";
    return () => {
      document.title = prev;
    };
  }, []);

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    const arr: number[] = [];
    for (let y = now - 10; y <= now + 5; y++) arr.push(y);
    return arr;
  }, []);

  const makeTimestamp = () => {
    const y = clampYear(year);
    return new Date(Date.UTC(y, 0, 1)).toISOString();
  };

  const modeLabel = mode === "past" ? "Past" : mode === "future" ? "Future" : "Present";
  const modeDescription =
    mode === "past"
      ? `Reflecting with your past perspective (${year}).`
      : mode === "future"
        ? `Imagining your future perspective (${year}).`
        : "Grounded in your present perspective.";

  const promptSuggestions = [
    "What should I focus on this week?",
    "How far have I come this year?",
    "What habit should I improve next?",
  ];

  const send = async () => {
    const text = input.trim();
    if (!text || !user?._id) return;

    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setIsSending(true);
    try {
      const payload = {
        userId: user._id,
        mode,
        timestamp: mode === "present" ? new Date().toISOString() : makeTimestamp(),
        message: text,
      };
      const resp: any = await apiClient.aiChat(payload);
      const data = resp?.data;
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          content: data?.response || "(no response)",
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "ai", content: "I could not respond right now. Please try again in a moment." },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen pt-20">
      <Navigation />
      <div className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="glass-card border border-white/10 p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Time Chat</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                  Talk with your past, present, or future perspective. Keep it simple, honest, and personal.
                </p>
              </div>
              <Badge variant="secondary" className="bg-white/10 border border-white/20">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Private Reflection
              </Badge>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
              <div className="flex items-center gap-3">
                <div className="w-full sm:w-[190px]">
                  <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
                    <SelectTrigger className="btn-glass border-white/10">
                      <SelectValue placeholder="Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="past">Past</SelectItem>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="future">Future</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full sm:w-[140px]">
                  <Select value={String(year)} onValueChange={(v) => setYear(Number(v))} disabled={mode === "present"}>
                    <SelectTrigger className="btn-glass border-white/10">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Badge variant="secondary" className="justify-center sm:justify-start bg-white/10 border border-white/20 py-2 px-3">
                <Clock3 className="w-3.5 h-3.5 mr-1.5" />
                {modeLabel} Mode
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground mt-3">{modeDescription}</p>
          </div>

          <Card className="glass-card border border-white/10 overflow-hidden">
            <CardHeader className="border-b border-white/10 bg-black/20">
              <CardTitle className="text-lg">Conversation</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[420px] px-4 py-4 md:px-6">
                <div className="space-y-3">
                  {messages.map((m, idx) => (
                    <div key={idx} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                      <div
                        className={
                          m.role === "user"
                            ? "max-w-[88%] rounded-2xl px-4 py-3 bg-primary text-primary-foreground shadow-lg"
                            : "max-w-[88%] rounded-2xl px-4 py-3 bg-black/40 border border-white/10 backdrop-blur-sm"
                        }
                      >
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="px-4 pb-4 md:px-6 md:pb-6 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {promptSuggestions.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setInput(prompt)}
                      className="text-xs px-3 py-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything you want to reflect on..."
                  className="glass-card border-white/10 min-h-[108px]"
                  rows={4}
                />

                <div className="flex justify-end">
                  <Button className="btn-glow min-w-[120px]" onClick={send} disabled={isSending || !input.trim() || !user?._id || !isAuthenticated}>
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Thinking...
                      </>
                    ) : (
                      "Send"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TimeChat;


