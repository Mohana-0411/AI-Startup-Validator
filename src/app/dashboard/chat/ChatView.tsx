"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bot,
  User,
  Send,
  Loader2,
  Sparkles,
  Search,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Copy,
  Check,
  Clock,
  AlertCircle,
  MessageSquare,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import {
  getChatHistoryAction,
  sendChatMessageAction,
  clearChatHistoryAction,
  renameStartupChatTitleAction,
  regenerateLastMentorResponseAction,
} from "@/app/actions/chatActions";
import { ScoreBadge } from "@/components/ScoreBadge";

interface AnalysisOption {
  id: string;
  startupName: string;
  overallScore: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

const SUGGESTED_PROMPTS = [
  { label: "Improve my startup", text: "How can I improve my startup idea and validation score?" },
  { label: "Validate my business model", text: "Validate my current business model and suggest improvements." },
  { label: "Suggest pricing", text: "Suggest optimal pricing tiers and monetization strategies." },
  { label: "Find competitors", text: "Who are my top competitors and how do I differentiate?" },
  { label: "Improve go-to-market strategy", text: "How should I improve my go-to-market customer acquisition strategy?" },
];

export function ChatView({ analyses }: { analyses: AnalysisOption[] }) {
  const [analysisList, setAnalysisList] = useState<AnalysisOption[]>(analyses);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>(
    analyses.length > 0 ? analyses[0].id : ""
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentAnalysis = analysisList.find((a) => a.id === selectedAnalysisId) || analysisList[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, regenerating]);

  useEffect(() => {
    async function loadHistory() {
      if (!selectedAnalysisId) return;
      setLoading(true);
      setErrorMsg(null);
      const res = await getChatHistoryAction(selectedAnalysisId);
      if (res) {
        setMessages(res.messages);
      }
      setLoading(false);
    }

    loadHistory();
  }, [selectedAnalysisId]);

  async function handleSend(textToSend?: string) {
    const msg = textToSend || inputValue;
    if (!msg.trim() || loading || !selectedAnalysisId) return;

    setInputValue("");
    setErrorMsg(null);
    setLoading(true);

    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: msg,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    const result = await sendChatMessageAction(msg, selectedAnalysisId);

    if (result && result.success && result.messages) {
      setMessages(result.messages);
    } else if (result && result.error) {
      setErrorMsg(result.error);
    }

    setLoading(false);
  }

  async function handleClearConversation(id: string) {
    if (confirm(`Clear all conversation history for "${currentAnalysis?.startupName}"?`)) {
      setMessages([]);
      await clearChatHistoryAction(id);
    }
  }

  async function handleSaveRename(id: string) {
    if (!editingTitle.trim()) return;
    setAnalysisList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, startupName: editingTitle.trim() } : a))
    );
    await renameStartupChatTitleAction(id, editingTitle.trim());
    setEditingId(null);
  }

  async function handleRegenerateResponse() {
    if (!selectedAnalysisId || regenerating || loading) return;
    setRegenerating(true);
    setErrorMsg(null);

    const result = await regenerateLastMentorResponseAction(selectedAnalysisId);
    if (result && result.success && result.messages) {
      setMessages(result.messages);
    } else if (result && result.error) {
      setErrorMsg(result.error);
    }
    setRegenerating(false);
  }

  function handleCopyText(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const filteredAnalyses = analysisList.filter((a) =>
    a.startupName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] md:h-screen flex bg-white overflow-hidden">
      {/* Left-Side ChatGPT Conversation Panel */}
      <aside
        className={`${
          panelOpen ? "w-72" : "w-0 hidden md:flex md:w-16"
        } bg-slate-900 text-white border-r border-slate-800 flex flex-col justify-between transition-all duration-300 shrink-0 z-20`}
      >
        <div className="p-4 space-y-4 flex-1 flex flex-col min-h-0">
          {/* New Chat Button */}
          {panelOpen ? (
            <Link
              href="/dashboard/new"
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-purple-600/30 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Analysis Chat</span>
            </Link>
          ) : (
            <Link
              href="/dashboard/new"
              className="w-10 h-10 mx-auto bg-purple-600 text-white rounded-xl flex items-center justify-center shadow-md"
              title="New Chat"
            >
              <Plus className="w-5 h-5" />
            </Link>
          )}

          {/* Search Conversations Input */}
          {panelOpen && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          )}

          {/* Recent Conversations List */}
          {panelOpen && (
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 no-scrollbar min-h-0">
              <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Recent Conversations
              </p>
              {filteredAnalyses.length === 0 ? (
                <p className="text-xs text-slate-500 px-2 py-4 italic">No matching chat threads.</p>
              ) : (
                filteredAnalyses.map((item) => {
                  const isSelected = item.id === selectedAnalysisId;
                  const isEditing = editingId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                      onClick={() => {
                        if (!isEditing) setSelectedAnalysisId(item.id);
                      }}
                    >
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRename(item.id);
                          }}
                          onBlur={() => handleSaveRename(item.id)}
                          autoFocus
                          className="w-full bg-slate-800 border border-purple-500 rounded px-2 py-1 text-xs text-white focus:outline-none"
                        />
                      ) : (
                        <div className="flex items-center gap-2.5 truncate">
                          <MessageSquare className={`w-4 h-4 shrink-0 ${isSelected ? "text-purple-400" : "text-slate-400"}`} />
                          <span className="truncate">{item.startupName}</span>
                        </div>
                      )}

                      {!isEditing && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(item.id);
                              setEditingTitle(item.startupName);
                            }}
                            className="p-1 text-slate-400 hover:text-white"
                            title="Rename"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClearConversation(item.id);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Panel Collapse Toggle Footer */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={() => setPanelOpen(!panelOpen)}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 mx-auto md:mx-0"
            title={panelOpen ? "Collapse Panel" : "Expand Panel"}
          >
            <Menu className="w-4 h-4" />
            {panelOpen && <span>Sidebar Panel</span>}
          </button>
        </div>
      </aside>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Main Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPanelOpen(!panelOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                {currentAnalysis?.startupName || "AI Startup Mentor"}
                {currentAnalysis && <ScoreBadge score={currentAnalysis.overallScore} size="sm" />}
              </h2>
              <p className="text-[11px] text-slate-500">Startup-focused conversational advisor</p>
            </div>
          </div>

          {messages.length > 0 && currentAnalysis && (
            <button
              onClick={() => handleClearConversation(currentAnalysis.id)}
              className="px-3 py-1.5 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Chat</span>
            </button>
          )}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="px-6 py-3 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-rose-600 hover:text-rose-900">
              Dismiss
            </button>
          </div>
        )}

        {/* Conversation Thread Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50/40">
          {analysisList.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Startup Context Available</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Run your first startup analysis to activate the AI Mentor conversation workspace.
              </p>
              <Link
                href="/dashboard/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-xl text-xs shadow-md"
              >
                <Plus className="w-4 h-4" />
                Analyze Startup Now
              </Link>
            </div>
          ) : messages.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center py-12 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-600/30">
                <Bot className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  How can I help with {currentAnalysis?.startupName}?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                  Select a suggested prompt below or type your startup-focused question.
                </p>
              </div>

              {/* 5 Suggested Startup Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto pt-4">
                {SUGGESTED_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p.text)}
                    className="p-4 bg-white hover:bg-purple-50 border border-slate-200/80 hover:border-purple-200 rounded-2xl text-left transition-all group shadow-2xs"
                  >
                    <p className="text-xs font-bold text-slate-900 group-hover:text-purple-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      {p.label}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{p.text}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, index) => {
                const isUser = msg.role === "user";
                const isLastAssistant = !isUser && index === messages.length - 1;
                const isCopied = copiedId === msg.id;

                return (
                  <div key={msg.id} className="space-y-2">
                    <div
                      className={`flex items-start gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
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

                      <div className={`space-y-1 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
                        <div
                          className={`p-5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                            isUser
                              ? "bg-purple-600 text-white rounded-tr-xs shadow-md shadow-purple-600/10 font-medium"
                              : "bg-white text-slate-800 rounded-tl-xs border border-slate-200/80 shadow-xs"
                          }`}
                        >
                          {msg.content}
                        </div>

                        {/* Timestamp & Copy Button Actions */}
                        <div
                          className={`flex items-center gap-2 text-[10px] text-slate-400 font-semibold px-1 ${
                            isUser ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-300" />
                            {formatTime(msg.createdAt)}
                          </span>

                          {!isUser && (
                            <button
                              onClick={() => handleCopyText(msg.content, msg.id)}
                              className="text-slate-400 hover:text-purple-600 flex items-center gap-1 transition-colors"
                              title="Copy AI Response"
                            >
                              {isCopied ? (
                                <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                                  <Check className="w-3 h-3" /> Copied
                                </span>
                              ) : (
                                <span className="flex items-center gap-0.5">
                                  <Copy className="w-3 h-3" /> Copy
                                </span>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Regenerate Option for Last AI Response */}
                    {isLastAssistant && !loading && !regenerating && (
                      <div className="flex justify-start pl-13">
                        <button
                          onClick={handleRegenerateResponse}
                          className="px-3 py-1.5 bg-white hover:bg-purple-50 text-slate-600 hover:text-purple-700 rounded-xl border border-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Regenerate Response
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing Animation */}
              {(loading || regenerating) && (
                <div className="flex items-start gap-4 flex-row">
                  <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-5 h-5 animate-bounce text-purple-600" />
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-xs border border-slate-200 text-xs text-slate-500 flex items-center gap-3 shadow-xs">
                    <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                    <span className="font-semibold text-purple-700">
                      {regenerating ? "Regenerating mentor response..." : "AI Mentor is typing response..."}
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        {analysisList.length > 0 && (
          <div className="p-4 sm:p-6 bg-white border-t border-slate-200/80 shrink-0">
            <div className="max-w-3xl mx-auto space-y-3">
              {/* Quick Action Prompt Chips */}
              <div className="flex items-center gap-2 overflow-x-auto text-[11px] pb-1 no-scrollbar">
                <span className="text-slate-400 font-bold shrink-0">Prompts:</span>
                {SUGGESTED_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p.text)}
                    disabled={loading || regenerating}
                    className="px-3 py-1 bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 rounded-full border border-slate-200 shrink-0 font-medium transition-colors disabled:opacity-50"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Shift + Enter Textarea Input */}
              <div className="relative flex items-center bg-slate-50 border border-slate-200 focus-within:border-purple-600 focus-within:bg-white rounded-2xl p-2 transition-all shadow-inner">
                <textarea
                  rows={2}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask AI Mentor about ${currentAnalysis?.startupName || "your startup"}... (Press Enter to send, Shift + Enter for new line)`}
                  disabled={loading || regenerating}
                  className="w-full px-3 py-1.5 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || loading || regenerating}
                  className="p-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold rounded-xl shadow-md shadow-purple-600/20 text-xs transition-all shrink-0 self-end mb-1"
                  title="Send Message (Enter)"
                >
                  {loading || regenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
