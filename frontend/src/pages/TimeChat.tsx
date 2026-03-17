import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

type Mode = "past" | "present" | "future";

type Citation = {
  id: string;
  sourceType: "journal" | "capsule";
  createdAt: string;
  excerpt: string;
  similarity: number;
};

type ChatMsg = {
  role: "user" | "ai";
  content: string;
  citations?: Citation[];
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
      content:
        "Choose Past / Present / Future Self, then ask something you want to reflect on. I’ll answer using your own journals and capsules (with citations).",
    },
  ]);

  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    const arr: number[] = [];
    for (let y = now - 10; y <= now + 5; y++) arr.push(y);
    return arr;
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingAnalytics(true);
    apiClient
      .getAiAnalytics()
      .then((r: any) => setAnalytics(r?.data || null))
      .catch(() => setAnalytics(null))
      .finally(() => setLoadingAnalytics(false));
  }, [isAuthenticated]);

  const makeTimestamp = () => {
    const y = clampYear(year);
    // We use Jan 1 as the anchor for "Past Self from YEAR" filtering on backend.
    return new Date(Date.UTC(y, 0, 1)).toISOString();
  };

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
          citations: data?.citations || [],
        },
      ]);
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        { role: "ai", content: `Sorry—AI service error. ${e?.message || ""}`.trim() },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const sentimentChartData = (analytics?.sentimentOverTime || []).map((d: any) => ({
    month: d.month,
    avgPositivity: Number(d.avgPositivity ?? 0.5),
  }));

  const topicChartData = (analytics?.topicDistribution || []).slice(0, 8).map((d: any) => ({
    topic: d.topic,
    count: d.count,
  }));

  const personality = analytics?.latestPersonality;
  const radarData = personality
    ? [
        { trait: "Optimism", value: personality.optimismScore },
        { trait: "Ambition", value: personality.ambitionScore },
        { trait: "Anxiety", value: personality.anxietyScore },
        { trait: "Reflection", value: personality.reflectionScore },
        { trait: "Social", value: personality.socialFocusScore },
      ]
    : [];

  return (
    <div className="min-h-screen pt-20">
      <Navigation />
      <div className="container mx-auto px-4 py-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Temporal Self Chat Engine</h1>
            <p className="text-muted-foreground mt-1">
              Chat with your Past, Present, or Future Self using your own journals + capsules (embeddings, vector search,
              sentiment/emotion, personality states, and forecasting).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-[180px]">
              <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
                <SelectTrigger className="btn-glass">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="past">Past Self</SelectItem>
                  <SelectItem value="present">Present Self</SelectItem>
                  <SelectItem value="future">Future Self</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-[140px]">
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))} disabled={mode === "present"}>
                <SelectTrigger className="btn-glass">
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
        </div>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="glass-card">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-4">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Conversation</span>
                  <Badge variant="secondary" className="bg-white/10">
                    {mode === "present" ? "Present" : `${mode} @ ${year}`}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-[420px] pr-4">
                  <div className="space-y-3">
                    {messages.map((m, idx) => (
                      <div key={idx} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                        <div
                          className={
                            m.role === "user"
                              ? "max-w-[85%] rounded-2xl px-4 py-3 bg-primary text-primary-foreground"
                              : "max-w-[85%] rounded-2xl px-4 py-3 glass-card border border-white/10"
                          }
                        >
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</div>
                          {m.role === "ai" && m.citations?.length ? (
                            <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                              <div className="text-xs text-muted-foreground">Citations</div>
                              <div className="space-y-2">
                                {m.citations.slice(0, 5).map((c) => (
                                  <div key={c.id} className="text-xs">
                                    <span className="text-muted-foreground">
                                      {new Date(c.createdAt).toLocaleDateString()} · {c.sourceType} · sim{" "}
                                      {c.similarity.toFixed(2)}
                                    </span>
                                    <div className="mt-1 text-foreground/90">{c.excerpt}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="space-y-3">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder='Ask something like: "Did I make the right decision leaving my internship?"'
                    className="glass-card border-white/10"
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button className="btn-glow" onClick={send} disabled={isSending || !input.trim() || !user?._id}>
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Thinking…
                        </>
                      ) : (
                        "Send"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="glass-card border-white/10 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Sentiment Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingAnalytics ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                    </div>
                  ) : (
                    <ChartContainer
                      className="h-[280px] w-full"
                      config={{
                        avgPositivity: { label: "Avg Positivity", color: "hsl(var(--primary))" },
                      }}
                    >
                      <LineChart data={sentimentChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis domain={[0, 1]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="avgPositivity" stroke="var(--color-avgPositivity)" dot={false} />
                      </LineChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle>Personality Radar</CardTitle>
                </CardHeader>
                <CardContent>
                  {personality ? (
                    <ChartContainer
                      className="h-[280px] w-full"
                      config={{ value: { label: "Trait", color: "hsl(var(--primary))" } }}
                    >
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="trait" tick={{ fontSize: 11 }} />
                        <PolarRadiusAxis domain={[0, 1]} tick={{ fontSize: 10 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Radar dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.35} />
                      </RadarChart>
                    </ChartContainer>
                  ) : (
                    <div className="text-sm text-muted-foreground">No personality snapshot yet—create a few journals first.</div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Topic Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer className="h-[260px] w-full" config={{ count: { label: "Count", color: "hsl(var(--primary))" } }}>
                    <BarChart data={topicChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="topic" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TimeChat;


