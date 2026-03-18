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
import PageTitle from "@/components/ui/PageTitle";
import { Clock3, Loader2, Sparkles, WandSparkles, MessageSquareText } from "lucide-react";
import { motion } from "framer-motion";

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

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isSending && input.trim() && user?._id && isAuthenticated) {
        void send();
      }
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-24 pb-12 relative overflow-hidden">
        <div className="absolute -top-24 -left-12 w-72 h-72 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-12 w-80 h-80 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl space-y-6 relative">
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
              <PageTitle
                title="Time Chat"
                subtitle="Talk with your past, present, or future perspective with thoughtful guidance."
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
              className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6"
            >
              <Card className="glass-card-enhanced border-white/10 h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <WandSparkles className="w-4 h-4 text-primary" />
                    Reflection Setup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Mode</p>
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

                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Year</p>
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

                  <div className="rounded-xl border border-white/10 bg-black/20 p-3 space-y-2">
                    <Badge variant="secondary" className="bg-white/10 border border-white/20">
                      <Clock3 className="w-3.5 h-3.5 mr-1.5" />
                      {modeLabel} Mode
                    </Badge>
                    <p className="text-xs text-muted-foreground">{modeDescription}</p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Sparkles className="w-4 h-4 text-accent" />
                      Private Reflection
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your prompts stay personal and are crafted for calm, honest self-check-ins.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card-enhanced border border-white/10 overflow-hidden">
                <CardHeader className="border-b border-white/10 bg-black/30">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquareText className="w-5 h-5 text-primary" />
                    Conversation
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[420px] px-4 py-4 md:px-6 bg-gradient-to-b from-black/10 to-transparent">
                    <div className="space-y-3">
                      {messages.map((m, idx) => (
                        <div key={idx} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                          <div className={m.role === "user" ? "max-w-[88%]" : "max-w-[88%]"}>
                            <div className={m.role === "user" ? "mb-1 text-[11px] text-right text-primary/90" : "mb-1 text-[11px] text-muted-foreground"}>
                              {m.role === "user" ? "You" : "PastPort Guide"}
                            </div>
                            <div
                              className={
                                m.role === "user"
                                  ? "rounded-2xl rounded-br-md px-4 py-3 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-[0_8px_25px_rgba(120,60,255,0.35)]"
                                  : "rounded-2xl rounded-bl-md px-4 py-3 bg-white/5 border border-white/15 backdrop-blur-sm"
                              }
                            >
                              <div className="whitespace-pre-wrap text-[15px] leading-relaxed">{m.content}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="px-4 pb-4 md:px-6 md:pb-6 space-y-3 border-t border-white/10 bg-black/25">
                    <div className="pt-4 flex flex-wrap gap-2">
                      {promptSuggestions.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => setInput(prompt)}
                          className="text-xs px-3 py-1.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/12 hover:border-white/30 transition-colors"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>

                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleInputKeyDown}
                      placeholder="Ask anything you want to reflect on..."
                      className="glass-card border-white/15 min-h-[108px] rounded-xl text-[15px] leading-relaxed"
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
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeChat;


