"use client";

import { useEffect, useState } from "react";
import { getThread, sendSms, getPropertySettings, updatePropertySettings } from "@/lib/api";
import type { SmsMsg, PropertySettings } from "@/lib/types";
import ToggleSwitch from "@/components/ToggleSwitch";

interface TextHistoryProps {
  phone: string;
  propertyId?: string;
}

export default function TextHistory({ phone, propertyId }: TextHistoryProps) {
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState<SmsMsg[]>([]);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [settings, setSettings] = useState<PropertySettings>({
    ai_enabled: true,
    auto_reply: true,
    verification_sent: false
  });

  async function load() {
    setLoading(true);
    try {
      setMsgs(await getThread(phone));
    } finally {
      setLoading(false);
    }
  }

  async function loadSettings() {
    if (!propertyId) return;
    try {
      const settingsData = await getPropertySettings(propertyId);
      setSettings(settingsData);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }

  async function updateSettings(newSettings: Partial<PropertySettings>) {
    if (!propertyId) return;
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await updatePropertySettings(propertyId, updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Failed to update settings. Please try again.");
    }
  }

  async function sendMessage() {
    if (!message.trim() || !propertyId) return;
    
    setIsSending(true);
    try {
      const result = await sendSms(phone, message.trim(), propertyId);
      if (result.success) {
        setMessage("");
        load(); // Refresh messages
        alert("Message sent successfully!");
      } else {
        alert(`Failed to send message: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  function formatTime(timestamp: string) {
    try {
      // Ensure the timestamp is properly parsed
      let date: Date;
      if (timestamp.includes('Z')) {
        // Already has timezone info
        date = new Date(timestamp);
      } else {
        // Assume UTC if no timezone info
        date = new Date(timestamp + 'Z');
      }
      
      const now = new Date();
      const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
      const diffInHours = diffInMinutes / 60;
      const diffInDays = diffInHours / 24;
      
      // Get user's timezone
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Show relative time for very recent messages
      if (diffInMinutes < 1) {
        return "Just now";
      } else if (diffInMinutes < 60) {
        return `${Math.floor(diffInMinutes)}m ago`;
      } else if (diffInHours < 24) {
        return date.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: timeZone
        });
      } else if (diffInDays < 7) {
        return date.toLocaleDateString([], { 
          weekday: 'short', 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: timeZone
        });
      } else {
        return date.toLocaleDateString([], { 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: timeZone
        });
      }
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid time';
    }
  }

  useEffect(() => {
    if (phone) {
      load();
      loadSettings();
    }
  }, [phone, propertyId]);

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {phone.slice(-2)}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">Tenant</div>
            <div className="text-xs text-gray-500">{phone}</div>
            <div className="text-xs text-primary">SMS to tenant via Esto</div>
            <div className="text-xs text-gray-400">
              Times in {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </div>
          </div>
        </div>
        <button
          onClick={load}
          className="text-xs px-2 py-1 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center items-center h-full text-sm text-gray-500">
            Loading messages...
          </div>
        ) : msgs.length === 0 ? (
          <div className="flex justify-center items-center h-full text-sm text-gray-500">
            No messages yet. Start a conversation!
          </div>
        ) : (
          msgs.map((msg, index) => {
            const isInbound = msg.direction === "inbound";
            const showTime = index === 0 || 
              new Date(msg.created_at).getTime() - new Date(msgs[index - 1].created_at).getTime() > 10 * 60 * 1000; // 10 minutes
            
            return (
              <div key={msg.sid}>
                {showTime && (
                  <div className="flex justify-center my-2">
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                )}
                
                <div className={`flex ${isInbound ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl ${
                      isInbound
                        ? 'bg-gray-100 text-gray-900 rounded-bl-md'
                        : 'bg-blue-500 text-white rounded-br-md'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{msg.body}</div>
                    {msg.ai_reply && (
                      <div className={`mt-1 text-xs ${isInbound ? 'text-gray-600' : 'text-blue-100'}`}>
                        AI: {msg.ai_reply}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SMS Settings */}
      {propertyId && (
        <div className="border-t bg-gray-50 p-4">
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700 mb-2">AI Settings</div>
            
            <ToggleSwitch
              checked={settings.ai_enabled}
              onChange={(checked) => updateSettings({ ai_enabled: checked })}
              label="Enable AI responses"
              size="sm"
            />
            
            <ToggleSwitch
              checked={settings.auto_reply}
              onChange={(checked) => updateSettings({ auto_reply: checked })}
              disabled={!settings.ai_enabled}
              label="Auto-reply to messages"
              size="sm"
            />
          </div>
        </div>
      )}

      {/* Message Input */}
      {propertyId && (
        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSending}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim() || isSending}
              className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
            >
              {isSending ? "..." : "Send"}
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            {settings.ai_enabled ? (
              <span className="text-green-600">✓ Esto AI is responding to tenant messages</span>
            ) : (
              <span className="text-orange-600">⚠ AI disabled - manual responses only</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
