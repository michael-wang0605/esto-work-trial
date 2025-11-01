"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Paperclip, X, FileText, Bot, User2, ArrowUp } from "lucide-react";
import type { Context } from "@/lib/types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  image_url?: string;
}

type Upload = {
  file: File;
  dataUrl: string;
  kind: "image" | "pdf" | "other";
};

/** ✅ Backend base URL:
 *  - Direct connection to Render backend
 *  - CORS fixed on backend side
 */
const API_BASE = "https://prop-ai.onrender.com";

interface Lease {
  id: string;
  fileName: string;
  originalName: string;
  summary?: string;
  keyTerms?: string;
  startDate?: string;
  endDate?: string;
  monthlyRent?: number;
  securityDeposit?: number;
  isActive: boolean;
}

/** Props now accept both context and phone */
interface AIChatProps {
  context?: Context;
  phone?: string; // thread/contact phone (Property.phone)
  propertyId?: string; // property ID for fetching lease context
}

export default function AIChat({ context, phone, propertyId }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upload, setUpload] = useState<Upload | null>(null);
  const [leases, setLeases] = useState<Lease[]>([]);

  // Fetch lease context when propertyId is available
  useEffect(() => {
    if (propertyId) {
      fetchLeases();
    }
  }, [propertyId]);

  const fetchLeases = async () => {
    try {
      const response = await fetch(`/api/leases?propertyId=${propertyId}`);
      if (response.ok) {
        const data = await response.json();
        setLeases(data.leases || []);
      }
    } catch (err) {
      console.error('Error fetching leases:', err);
    }
  };

  // Debug logging
  console.log('AIChat received context:', context);
  console.log('AIChat received phone:', phone);
  console.log('AIChat received propertyId:', propertyId);
  console.log('AIChat leases:', leases);
  console.log('AIChat using API_BASE:', API_BASE);

  // Test backend connection
  const testConnection = async () => {
    try {
      console.log('Testing backend connection...');
      const response = await fetch(`${API_BASE}/health`);
      const data = await response.json();
      console.log('Backend health check:', data);
      setError(null);
    } catch (err) {
      console.error('Backend connection failed:', err);
      setError(`Backend connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const extOf = (name: string) => {
    const i = name.lastIndexOf(".");
    return i >= 0 ? name.slice(i) : "";
  };

  const baseName = (name: string) => {
    const i = name.lastIndexOf(".");
    return i >= 0 ? name.slice(0, i) : name;
  };

  const truncateNamePreserveExt = (name: string, maxBaseLen = 12) => {
    const ext = extOf(name);
    const base = baseName(name);
    if (base.length <= maxBaseLen) return base + ext;
    return base.slice(0, maxBaseLen - 1) + "…" + ext;
  };

  const readAsDataURL = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readAsDataURL(file);
      const kind = file.type.startsWith("image/")
        ? "image"
        : file.type === "application/pdf"
        ? "pdf"
        : "other";
      setUpload({ file, dataUrl, kind });
      setError(null);
    } catch (err) {
      setError("Failed to process file");
      console.error("File processing error:", err);
    }
  };

  const clearUpload = () => {
    setUpload(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    if (!input.trim() && !upload) {
      setError("Please enter a message or select a file");
      return;
    }

    if (!context?.tenant_name || !context?.unit || !context?.address) {
      setError("Invalid context: tenant_name, unit, and address are required");
      return;
    }

    console.log('=== AI CHAT DEBUG ===');
    console.log('Context validation passed:', {
      tenant_name: context?.tenant_name,
      unit: context?.unit,
      address: context?.address
    });

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      image_url: upload?.kind === "image" ? upload.dataUrl : undefined,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);

    try {
      setIsLoading(true);

      // 🧠 Ensure the LLM sees a tenant_phone:
      // - prefer context.tenant_phone (new key)
      // - fall back to context.phone (legacy key in your demoData)
      // - finally fall back to prop `phone` from Property
// 🧠 Ensure the LLM sees a tenant_phone
      const tenant_phone: string | undefined =
        context?.tenant_phone ??
        (context as unknown as { phone?: string })?.phone ?? // allow legacy key in demoData
        phone;


      // Build lease context for AI
      const activeLeases = leases.filter(lease => lease.isActive);
      const leaseContext = activeLeases.length > 0 ? {
        leases: activeLeases.map(lease => ({
          summary: lease.summary,
          keyTerms: lease.keyTerms,
          monthlyRent: lease.monthlyRent,
          securityDeposit: lease.securityDeposit,
          startDate: lease.startDate,
          endDate: lease.endDate
        }))
      } : {};

      const payload = {
        message: userMessage.content || "",
        context: {
          tenant_name: context.tenant_name,
          unit: context.unit,
          address: context.address,
          hotline: context.hotline ?? null,
          portal_url: context.portal_url ?? null,
          property_name: context.property_name ?? null,
          tenant_phone, // <-- guaranteed path for LLM
          ...leaseContext, // <-- include lease context
        },
        phone: phone ?? null, // <-- lets backend hydrate from DB if needed
        image_url: upload?.kind === "image" ? upload.dataUrl : null,
        // document_url: could be added if you upload PDFs to storage first
      };

      console.log(`Sending payload to ${API_BASE}/tenant_chat:`, payload);

      const response = await fetch(`${API_BASE}/tenant_chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20000), // 20 second timeout
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(
          errorData.detail ||
            `HTTP ${response.status}: Failed to get AI response from ${API_BASE}`
        );
      }

      const { reply } = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      clearUpload();
    } catch (err: unknown) {
      console.error("AI communication error:", err);
      setError(
        err instanceof Error
          ? `Failed to communicate with AI: ${err.message}`
          : "Failed to communicate with AI: Unknown error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white border rounded-2xl shadow-md p-0">
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-blue-600 text-white grid place-items-center">
          <Bot className="h-4 w-4" />
        </div>
        <h3 className="text-base font-semibold text-gray-900">AI Assistant</h3>
      </div>

      {/* Chat area */}
      <div className="bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="h-[460px] overflow-y-auto space-y-4 pr-1">
            {messages.length === 0 && !isLoading && (
              <div className="text-gray-500 text-sm">
                Ask me anything about this property!
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2 ${
                  m.role === "assistant" ? "justify-start" : "justify-end"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="h-7 w-7 rounded-full bg-blue-600 text-white grid place-items-center mt-0.5">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-[0.94rem] leading-relaxed shadow-sm
                    ${
                      m.role === "assistant"
                        ? "bg-white text-gray-800 rounded-bl-md"
                        : "bg-blue-600 text-white rounded-br-md"
                    }`}
                >
                  {m.image_url && (
                    <Image
                      src={m.image_url}
                      alt="Attachment"
                      width={256}
                      height={256}
                      className="rounded-lg mb-2 max-h-64 object-contain border"
                    />
                  )}
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
                {m.role === "user" && (
                  <div className="h-7 w-7 rounded-full bg-gray-800 text-white grid place-items-center mt-0.5">
                    <User2 className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <div className="h-5 w-5 rounded-full bg-white shadow grid place-items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-pulse" />
                </div>
                Thinking…
              </div>
            )}
            {error && <div className="text-red-500 text-sm">{error}</div>}
          </div>

          {/* Attachment chip */}
          {upload && (
            <div className="mt-3 mb-1 flex justify-center">
              <div className="inline-flex items-center gap-2 border bg-white rounded-xl px-3 py-2 shadow-sm">
                {upload.kind === "image" ? (
                  <div className="h-6 w-6 rounded-md overflow-hidden border">
                    <Image
                      src={upload.dataUrl}
                      alt="preview"
                      width={24}
                      height={24}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-6 w-6 rounded-md bg-gray-100 grid place-items-center border">
                    <FileText className="h-4 w-4 text-gray-600" />
                  </div>
                )}
                <span
                  title={upload.file.name}
                  className="text-sm text-gray-800 font-medium"
                  style={{
                    maxWidth: 120,
                    display: "inline-block",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {truncateNamePreserveExt(upload.file.name)}
                </span>
                <button
                  onClick={clearUpload}
                  className="ml-1 p-1 rounded-md hover:bg-gray-100 text-gray-600"
                  aria-label="Remove attachment"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {/* Input bar */}
          <div className="mt-2 mb-4 flex items-center justify-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 p-2 rounded-xl border bg-white hover:bg-gray-50 transition"
              aria-label="Attach file"
            >
              <Paperclip className="h-4 w-4 text-gray-700" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFilePick}
              className="hidden"
              style={{ display: "none" }}
              title=""
              aria-hidden="true"
            />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message…"
              className="w-[50%] px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 placeholder:text-gray-400"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && !upload)}
              className="shrink-0 p-2 rounded-full bg-black hover:bg-gray-800 text-white transition disabled:bg-gray-300"
              aria-label="Send message"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <button
              onClick={testConnection}
              className="shrink-0 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition text-xs"
              aria-label="Test connection"
              title="Test backend connection"
            >
              Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
