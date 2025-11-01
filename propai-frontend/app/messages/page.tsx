"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import AuthWrapper from "@/components/AuthWrapper";
import TextHistory from "@/components/TextHistory";
import Modal from "@/components/Modal";
import SmsManager from "@/components/SmsManager";
import { MessageSquare, Plus, Search, Inbox, Users } from "lucide-react";

interface Thread {
  phone: string;
  tenantName: string;
  propertyName: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

export default function MessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewContact, setShowNewContact] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    try {
      const response = await fetch('/api/sms/threads');
      if (response.ok) {
        const data = await response.json();
        setThreads(data.threads || []);
      }
    } catch (error) {
      console.error('Failed to load threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredThreads = threads.filter(thread =>
    thread.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.phone?.includes(searchTerm) ||
    thread.propertyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AuthWrapper>
        <div className="min-h-screen bg-background">
          <AnimatedBackground />
          <div className="relative z-10">
            <Topbar />
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-primary/40 border-t-primary rounded-full animate-spin"></div>
                <p className="text-foreground/70">Loading messages...</p>
              </div>
            </div>
          </div>
        </div>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-background">
        <AnimatedBackground />
        <div className="relative z-10">
          <Topbar />
          
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent mb-2">
                    Messages
                  </h1>
                  <p className="text-foreground/70">Manage tenant conversations and communications</p>
                </div>
                <button
                  onClick={() => setShowNewContact(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-[19px] bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  New Message
                </button>
              </div>
            </div>

            {/* Messages Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Threads List */}
              <div className="lg:col-span-1">
                <div className="glass-strong rounded-xl p-4 h-[calc(100vh-250px)] flex flex-col">
                  {/* Search */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search conversations..."
                        className="w-full pl-10 pr-3 py-2 glass rounded-[12px] bg-input border border-border/50 text-sm text-gray-900 placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>

                  {/* Threads */}
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {filteredThreads.length > 0 ? (
                      filteredThreads.map((thread) => (
                        <button
                          key={thread.phone}
                          onClick={() => setSelectedThread(thread)}
                          className={`w-full p-3 rounded-xl text-left transition-all ${
                            selectedThread?.phone === thread.phone
                              ? 'bg-primary/20 border border-primary/50'
                              : 'glass hover:bg-card/60 border border-transparent'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-semibold text-foreground text-sm">{thread.tenantName}</h3>
                            {thread.unread > 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                                {thread.unread}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-foreground/60 mb-1">{thread.propertyName}</p>
                          <p className="text-xs text-foreground/50 truncate">{thread.lastMessage}</p>
                        </button>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <Inbox className="w-12 h-12 text-foreground/20 mb-3" />
                        <p className="text-sm text-foreground/60">
                          {searchTerm ? 'No conversations found' : 'No messages yet'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Conversation View */}
              <div className="lg:col-span-2">
                {selectedThread ? (
                  <div className="glass-strong rounded-xl p-6 h-[calc(100vh-250px)]">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/50">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-foreground">{selectedThread.tenantName}</h2>
                        <p className="text-sm text-foreground/60">{selectedThread.propertyName}</p>
                      </div>
                    </div>
                    <TextHistory phone={selectedThread.phone} />
                  </div>
                ) : (
                  <div className="glass-strong rounded-xl p-12 h-[calc(100vh-250px)] flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">Select a conversation</h3>
                      <p className="text-foreground/60">
                        Choose a conversation from the list to view messages
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* New Contact Modal */}
      <Modal isOpen={showNewContact} onClose={() => setShowNewContact(false)} title="New Message">
        <SmsManager onClose={() => setShowNewContact(false)} />
      </Modal>
    </AuthWrapper>
  );
}
