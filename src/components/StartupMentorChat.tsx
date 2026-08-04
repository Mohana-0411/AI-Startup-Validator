"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  Lightbulb,
  MessageSquare,
  TrendingUp,
  Target,
  DollarSign,
  Users,
  Compass,
} from "lucide-react";
import { getChatHistoryAction, sendChatMessageAction } from "@/app/actions/chatActions";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface StartupMentorChatProps {
  analysisId?: string;
  startupName?: string;
  overallScore?: number;
}

const SUGGESTED_PROMPTS = [
  { label: "Improve my score", text: "How can I improve my startup validation score?" },
  { label: "Suggest a better business model", text: "Suggest a better business model for my startup idea." },
  { label: "Find competitors", text: "Who are my top competitors and how do I differentiate?" },
  { label: "Generate an investor pitch", text: "Generate a compelling 60-second investor pitch script." },
  { label: "Recommend next steps", text: "Recommend immediate, practical next steps I should take." },
];

export function StartupMentorChat({ analysisId, startupName, overallScore }: StartupMentorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeAnalysis, setActiveAnalysis] = useState<{
    id: string;
    startupName: string;
    overallScore: number;
  } | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, loading]);

  useEffect(() => {
    async function loadHistory() {
      const res = await getChatHistoryAction(analysisId);
      if (res) {
        setMessages(res.messages);
        if (res.activeAnalysis) {
          setActiveAnalysis(res.activeAnalysis);
        }
        setLoaded(true);
      }
    }

    loadHistory();
  }, [analysisId]);

  async function handleSendMessage(textToSend?: string) {
    const msg = textToSend || inputValue;
    if (!msg.trim() || loading) return;

    setInputValue("");
    setLoading(true);

    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: msg,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    const result = await sendChatMessageAction(msg, analysisId || activeAnalysis?.id);

    if (result && result.success && result.messages) {
      setMessages(result.messages);
      if (result.activeAnalysis) {
        setActiveAnalysis(result.activeAnalysis);
      }
    } else if (result && result.error) {
      const tempErrorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `⚠️ ${result.error}`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempErrorMsg]);
    }

    setLoading(false);
  }

  const currentStartupName = startupName || activeAnalysis?.startupName || "Your Startup";
  const currentScore = overallScore ?? activeAnalysis?.overallScore;

  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-0 my-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
            <Bot className="w-6 h-6 text-purple-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight">AI Startup Mentor</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Context
              </span>
            </div>
            <p className="text-xs text-purple-200 mt-1">
              Context: <span className="font-bold text-white">{currentStartupName}</span>
              {currentScore !== undefined && (
                <span className="ml-2 font-semibold bg-white/15 px-2 py-0.5 rounded text-[11px]">
                  Score: {currentScore}/100
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-purple-200 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 self-start md:self-auto">
          <Sparkles className="w-4 h-4 text-purple-300" />
          <span>Tailored YC & VC Advice Engine</span>
        </div>
      </div>

      {/* Suggested Prompts Header Bar */}
      <div className="p-4 bg-purple-50/60 border-b border-slate-200/80">
        <p className="text-xs font-bold text-purple-950 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          Suggested Mentor Actions
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt.text)}
              disabled={loading}
              className="px-3.5 py-2 bg-white hover:bg-purple-600 hover:text-white text-slate-700 text-xs font-semibold rounded-xl border border-slate-200/80 shadow-2xs transition-all hover:scale-[1.02] flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500 group-hover:text-white" />
              {prompt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Thread Container */}
      <div className="p-6 sm:p-8 bg-slate-50/40 min-h-[320px] max-h-[500px] overflow-y-auto space-y-6">
        {messages.length === 0 && (
          <div className="text-center py-10 max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Ask your AI Startup Mentor about &ldquo;{currentStartupName}&rdquo;
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Click a suggested prompt above or type your question below. The mentor uses your startup report as context to deliver direct, tactical advice.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                  isUser
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "bg-purple-100 text-purple-700 border border-purple-200"
                }`}
              >
                {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? "bg-purple-600 text-white rounded-tr-xs shadow-md shadow-purple-600/10 font-medium"
                    : "bg-white text-slate-800 rounded-tl-xs border border-slate-200/90 shadow-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {loading && (
          <div className="flex items-start gap-3.5 flex-row">
            <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-5 h-5 animate-bounce" />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-xs border border-slate-200/90 text-xs text-slate-500 flex items-center gap-2.5 shadow-sm">
              <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
              <span className="font-semibold text-purple-700">Mentor is analyzing your startup context...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Large Input Box & Controls */}
      <div className="p-4 sm:p-6 bg-white border-t border-slate-200/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Ask AI Mentor for advice on ${currentStartupName}...`}
              disabled={loading}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="px-6 py-3.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold rounded-xl shadow-md shadow-purple-600/20 text-sm transition-all flex items-center justify-center gap-2 shrink-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Send to Mentor</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
