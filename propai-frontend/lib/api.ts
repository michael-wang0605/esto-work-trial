import type { ClassifyResult, Context, SmsMsg } from "@/lib/types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://prop-ai.onrender.com";

export async function getThread(phone: string): Promise<SmsMsg[]> {
  const res = await fetch(
    `${BACKEND_URL}/threads/${encodeURIComponent(phone)}`
  );
  if (!res.ok) return [];
  return res.json();
}

export async function getChatHistory(phone: string): Promise<any[]> {
  const res = await fetch(
    `${BACKEND_URL}/chat/${encodeURIComponent(phone)}`
  );
  if (!res.ok) return [];
  return res.json();
}

export async function classify(
  thread: string[],
  context: Context
): Promise<ClassifyResult> {
  const res = await fetch(`${BACKEND_URL}/classify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ thread, context }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function tenantChat(
  message: string,
  context: Context,
  phone?: string,
  imageUrl?: string
): Promise<{ reply: string }> {
  const res = await fetch(`${BACKEND_URL}/tenant_chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      context,
      phone,
      image_url: imageUrl,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function pmChat(
  message: string,
  context: Context,
  phone?: string,
  imageUrl?: string
): Promise<{ reply: string }> {
  const res = await fetch(`${BACKEND_URL}/pm_chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      context,
      phone,
      image_url: imageUrl,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function upsertContact(phone: string, context: Context): Promise<{ ok: boolean }> {
  const res = await fetch(`${BACKEND_URL}/contacts/upsert?phone=${encodeURIComponent(phone)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(context),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getContact(phone: string): Promise<Context> {
  const res = await fetch(`${BACKEND_URL}/contacts/${encodeURIComponent(phone)}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// SMS Functions
export async function sendSms(to: string, message: string, propertyId?: string): Promise<{ success: boolean; message_sid?: string; error?: string }> {
  const res = await fetch(`${BACKEND_URL}/sms/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, message, property_id: propertyId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function sendVerificationSms(phone: string, context: Context): Promise<{ success: boolean; message_sid?: string; error?: string }> {
  const res = await fetch(`${BACKEND_URL}/sms/verification/${encodeURIComponent(phone)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(context),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function upsertContactWithVerification(phone: string, context: Context, sendVerification: boolean = false, propertyId?: string): Promise<{ ok: boolean; verification_sent?: boolean; verification_error?: string }> {
  const params = new URLSearchParams({
    phone,
    send_verification: sendVerification.toString()
  });
  if (propertyId) {
    params.append('property_id', propertyId);
  }
  
  const res = await fetch(`${BACKEND_URL}/contacts/upsert?${params}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(context),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Property Settings
export async function getPropertySettings(propertyId: string): Promise<{ ai_enabled: boolean; auto_reply: boolean; verification_sent: boolean }> {
  const res = await fetch(`${BACKEND_URL}/properties/${encodeURIComponent(propertyId)}/settings`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updatePropertySettings(propertyId: string, settings: { ai_enabled: boolean; auto_reply: boolean; verification_sent: boolean }): Promise<{ success: boolean; settings: any }> {
  const res = await fetch(`${BACKEND_URL}/properties/${encodeURIComponent(propertyId)}/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Maintenance Tickets
export async function getMaintenanceTickets(): Promise<{ tickets: any[] }> {
  // Use Next.js API route to avoid CORS issues and handle authentication
  const res = await fetch('/api/maintenance-tickets');
  if (!res.ok) {
    const errorText = await res.text();
    console.error('[getMaintenanceTickets] Error response:', errorText);
    throw new Error(errorText || `Failed to fetch maintenance tickets: ${res.status}`);
  }
  return res.json();
}

export async function getMaintenanceTicket(ticketId: string): Promise<any> {
  const res = await fetch(`${BACKEND_URL}/maintenance_tickets/${encodeURIComponent(ticketId)}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateTicketStatus(ticketId: string, status: string): Promise<{ success: boolean; ticket_id: string; status: string }> {
  const res = await fetch(`${BACKEND_URL}/maintenance_tickets/${encodeURIComponent(ticketId)}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Property Context for AI Assistant
export async function getPropertyContext(phone: string): Promise<{
  context: Context;
  maintenance_tickets: any[];
  sms_history: any[];
  total_tickets: number;
  open_tickets: number;
}> {
  const res = await fetch(`${BACKEND_URL}/property_context/${encodeURIComponent(phone)}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Tenant SMS Processing
export async function processTenantSms(
  message: string,
  context: Context,
  phone: string,
  mediaUrls?: string[]
): Promise<{ reply: string; maintenance_ticket_created: boolean; ticket_id?: string }> {
  const res = await fetch(`${BACKEND_URL}/tenant_sms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      context,
      phone,
      media_urls: mediaUrls,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Sync properties to backend
export async function syncPropertiesToBackend(properties: any[]): Promise<{ success: boolean; synced?: number; error?: string }> {
  const res = await fetch(`${BACKEND_URL}/sync/properties`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(properties),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Debug maintenance
export async function debugMaintenance(): Promise<any> {
  const res = await fetch(`${BACKEND_URL}/debug/maintenance`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}