"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Copy,
  Check,
  Download,
  Send,
  ImageIcon,
  MessageSquare,
} from "lucide-react";

const PLATFORMS = [
  {
    value: "twitter",
    label: "Twitter / X",
    charLimit: 280,
    description: "Short, punchy, conversational",
  },
  {
    value: "instagram",
    label: "Instagram",
    charLimit: 2200,
    description: "Visual storytelling, lifestyle focused",
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    charLimit: 3000,
    description: "Professional, thought leadership",
  },
  {
    value: "facebook",
    label: "Facebook",
    charLimit: 63206,
    description: "Community-oriented, shareable",
  },
  {
    value: "tiktok",
    label: "TikTok",
    charLimit: 2200,
    description: "Trendy, Gen-Z friendly, fun",
  },
  {
    value: "threads",
    label: "Threads",
    charLimit: 500,
    description: "Conversational, casual",
  },
] as const;

export default function Page() {
  return (
    <main className="min-h-svh bg-background font-sans relative overflow-hidden bg-blobs bg-gradient-premium">
      <div className="mx-auto max-w-4xl px-4 py-8 md:py-12 relative z-10">
        <header className="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center p-2 mb-4 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 backdrop-blur-md">
            <MessageSquare className="h-5 w-5 mr-2" />
            <span className="font-semibold text-sm tracking-wide uppercase">
              AI Assistant
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground/90 font-sans mb-3 drop-shadow-sm">
            Postralum{" "}
            <span className="text-gradient font-bold drop-shadow-sm">S</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto font-medium">
            Your premium AI-powered social media content engine
          </p>
        </header>

        <Tabs
          defaultValue="chat"
          className="w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 fill-mode-both"
        >
          <TabsList className="mb-8 grid w-full grid-cols-2 max-w-md mx-auto p-1 bg-card/50 backdrop-blur-md border border-border/50 rounded-full">
            <TabsTrigger
              value="chat"
              className="flex items-center gap-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
            >
              <MessageSquare className="h-4 w-4" />
              Content Writer
            </TabsTrigger>
            <TabsTrigger
              value="image"
              className="flex items-center gap-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
            >
              <ImageIcon className="h-4 w-4" />
              Image Studio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <ChatSection />
          </TabsContent>

          <TabsContent value="image">
            <ImageSection />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function ChatSection() {
  const [input, setInput] = useState("");
  const [platform, setPlatform] = useState<string>("twitter");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  console.log(
    "[v0] Chat status:",
    status,
    "Messages:",
    messages.length,
    "Error:",
    error,
  );

  const isLoading = status === "streaming" || status === "submitted";
  const selectedPlatform = PLATFORMS.find((p) => p.value === platform);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const platformInfo = selectedPlatform
      ? `[Platform: ${selectedPlatform.label}, Character limit: ${selectedPlatform.charLimit}, Style: ${selectedPlatform.description}]`
      : "";

    sendMessage({ text: `${platformInfo}\n\n${input}` });
    setInput("");
  };

  const getMessageText = (message: (typeof messages)[0]) => {
    return message.parts
      .filter(
        (part): part is { type: "text"; text: string } => part.type === "text",
      )
      .map((part) => part.text)
      .join("");
  };

  const copyToClipboard = async (message: (typeof messages)[0]) => {
    const text = getMessageText(message);
    await navigator.clipboard.writeText(text);
    setCopiedId(message.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Card className="glass-panel border-0 overflow-hidden shadow-2xl transition-all duration-500 rounded-3xl">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/40 via-accent/40 to-primary/40"></div>
      <CardHeader className="pb-4 pt-8 px-6 md:px-8 border-b border-border/30 bg-card/30">
        <CardTitle className="text-2xl font-bold flex items-center gap-2 text-foreground/90">
          Social Media Writer
        </CardTitle>
        <CardDescription className="text-base">
          Craft the perfect message tailored for your audience on any platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6 px-6 md:px-8 bg-card/10">
        <div className="min-h-[400px] max-h-[500px] overflow-y-auto rounded-2xl bg-background/40 backdrop-blur-sm shadow-inner border border-border/40 p-4 custom-scrollbar scroll-smooth">
          {messages.length === 0 ? (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
              <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                Start by describing what you want to post about.
              </p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                Example: "Write an Instagram post announcing our new product
                launch"
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  } animate-in slide-in-from-bottom-2 fade-in duration-300`}
                >
                  <div
                    className={`group relative max-w-[85%] rounded-3xl px-5 py-4 ${
                      message.role === "user"
                        ? "message-bubble-user"
                        : "message-bubble-ai"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {getMessageText(message)}
                    </div>
                    {message.role === "assistant" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(message)}
                        className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-background p-0 opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                      >
                        {copiedId === message.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span className="sr-only">Copy message</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start animate-in fade-in duration-300">
                  <div className="rounded-3xl message-bubble-ai px-5 py-4 flex items-center gap-3">
                    <Spinner size="sm" className="text-primary" />
                    <span className="text-sm font-medium animate-pulse text-muted-foreground">
                      Drafting your post...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 pt-2 pb-2">
          <div className="flex flex-col gap-3 p-3 bg-secondary/30 backdrop-blur-md border border-border rounded-2xl md:flex-row md:items-center shadow-sm">
            <div className="flex-shrink-0 w-full md:w-auto">
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="w-full md:w-[160px] border-border/50 bg-background/80 hover:bg-background transition-colors rounded-xl h-11">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/50 glass-panel">
                  {PLATFORMS.map((p) => (
                    <SelectItem
                      key={p.value}
                      value={p.value}
                      className="rounded-lg cursor-pointer"
                    >
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex bg-background/80 hover:bg-background transition-colors focus-within:bg-background focus-within:ring-1 focus-within:ring-primary/50 border border-border/50 rounded-xl overflow-hidden shadow-sm h-11 flex-1 items-center px-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your post idea..."
                disabled={isLoading}
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent shadow-none"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                size="icon"
                className="h-8 w-8 rounded-lg shadow-md transition-all shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 active:scale-95"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </div>
          {selectedPlatform && (
            <p className="text-xs text-muted-foreground mt-3 text-center md:text-left px-2 flex justify-center md:justify-start gap-1">
              <span className="font-semibold text-primary/80">
                {selectedPlatform.charLimit}
              </span>{" "}
              chars max <span className="text-border mx-1">|</span>{" "}
              {selectedPlatform.description}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function ImageSection() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();

      // Determine the correct mime type. The AI SDK generateImage usually returns png,
      // but our placehold.co API fallback returns an SVG.
      const isSvg = data.image.startsWith("PHN2Zy"); // Basic base64 check for <svg
      const mimeType = isSvg ? "image/svg+xml" : "image/png";

      setImageUrl(`data:${mimeType};base64,${data.image}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `radix-nova-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="glass-panel border-0 overflow-hidden shadow-2xl transition-all duration-500 rounded-3xl">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent/40 via-primary/40 to-accent/40"></div>
      <CardHeader className="pb-4 pt-8 px-6 md:px-8 border-b border-border/30 bg-card/30">
        <CardTitle className="text-2xl font-bold flex items-center gap-2 text-foreground/90">
          Visual Studio
        </CardTitle>
        <CardDescription className="text-base">
          Generate stunning AI artwork for your next viral post.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-6 px-6 md:px-8 bg-card/10">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="bg-background/50 border border-border/60 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-primary/30 transition-all p-1">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your image... (e.g., 'A minimalist product photo of a coffee cup with morning light')"
              rows={3}
              disabled={isLoading}
              className="resize-none border-0 focus-visible:ring-0 bg-transparent px-4 py-3 text-base shadow-none"
            />
            <div className="flex justify-end p-2 border-t border-border/30">
              <Button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="rounded-xl font-medium shadow-md transition-all bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Generate Image
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {error && (
          <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-5 text-sm text-destructive font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="p-2 bg-destructive/20 rounded-full shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-border/40 bg-background/40 backdrop-blur-sm animate-pulse shadow-inner">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse delay-75"></div>
              <ImageIcon className="mb-6 h-14 w-14 text-primary/60 animate-bounce relative z-10" />
            </div>
            <p className="text-primary/80 font-medium tracking-wide">
              Creating your masterpiece...
            </p>
            <p className="text-muted-foreground/60 text-sm mt-3 text-center max-w-xs">
              Applying final visual touches and preparing high resolution
              output.
            </p>
          </div>
        )}

        {imageUrl && !isLoading && (
          <div className="space-y-4 animate-in zoom-in-95 fade-in duration-500">
            <div className="overflow-hidden rounded-2xl border border-border/50 shadow-xl bg-black/5 flex justify-center group relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-end justify-center pb-6">
                <Button
                  onClick={downloadImage}
                  variant="secondary"
                  className="rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Save HD Quality
                </Button>
              </div>
              <img
                src={imageUrl}
                alt="Generated social media image"
                className="h-auto max-h-[500px] w-auto object-contain transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </div>
            <div className="md:hidden">
              <Button
                onClick={downloadImage}
                variant="outline"
                className="w-full rounded-xl h-12 shadow-sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Image
              </Button>
            </div>
          </div>
        )}

        {!imageUrl && !error && !isLoading && (
          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-background/20 backdrop-blur-sm transition-colors hover:bg-background/40 hover:border-border/80 group">
            <div className="p-4 rounded-full bg-secondary/50 mb-5 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300 shadow-sm border border-border/40">
              <ImageIcon className="h-10 w-10 text-muted-foreground/60 group-hover:text-primary/70 transition-colors" />
            </div>
            <p className="text-foreground/80 font-medium">
              Your stunning canvas awaits
            </p>
            <p className="text-muted-foreground/70 text-sm mt-2 text-center max-w-[260px]">
              Enter a prompt above to generate beautiful imagery for your next
              post.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
