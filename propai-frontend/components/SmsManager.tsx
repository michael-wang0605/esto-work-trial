"use client";

import { useState, useEffect } from "react";
import { sendSms, getPropertySettings, updatePropertySettings } from "@/lib/api";
import type { PropertySettings, SmsMsg } from "@/lib/types";

interface SmsManagerProps {
  propertyId: string;
  tenantPhone: string;
  onMessageSent?: () => void;
}

export default function SmsManager({ propertyId, tenantPhone, onMessageSent }: SmsManagerProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [settings, setSettings] = useState<PropertySettings>({
    ai_enabled: true,
    auto_reply: true,
    verification_sent: false
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    loadSettings();
  }, [propertyId]);

  async function loadSettings() {
    try {
      const settingsData = await getPropertySettings(propertyId);
      setSettings(settingsData);
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsLoadingSettings(false);
    }
  }

  async function updateSettings(newSettings: Partial<PropertySettings>) {
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
    if (!message.trim()) return;
    
    setIsSending(true);
    try {
      const result = await sendSms(tenantPhone, message.trim(), propertyId);
      if (result.success) {
        setMessage("");
        onMessageSent?.();
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

  if (isLoadingSettings) {
    return <div className="text-sm text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-4">
      {/* AI Settings */}
      <div className="border rounded-xl p-4">
        <h3 className="font-semibold mb-3">AI Communication Settings</h3>
        
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.ai_enabled}
              onChange={(e) => updateSettings({ ai_enabled: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Enable AI responses to tenant messages</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.auto_reply}
              onChange={(e) => updateSettings({ auto_reply: e.target.checked })}
              className="rounded"
              disabled={!settings.ai_enabled}
            />
            <span className="text-sm">Auto-reply to tenant messages</span>
          </label>
        </div>
      </div>

      {/* Manual SMS */}
      <div className="border rounded-xl p-4">
        <h3 className="font-semibold mb-3">Send Message to Tenant</h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm block mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full border rounded-xl p-3 h-20 resize-none"
              disabled={isSending}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              To: {tenantPhone}
            </span>
            <button
              onClick={sendMessage}
              disabled={!message.trim() || isSending}
              className="px-4 py-2 bg-black text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="text-xs text-gray-500">
        {settings.ai_enabled ? (
          <span className="text-green-600">✓ AI is responding to tenant messages</span>
        ) : (
          <span className="text-orange-600">⚠ AI is disabled - manual responses only</span>
        )}
      </div>
    </div>
  );
}
