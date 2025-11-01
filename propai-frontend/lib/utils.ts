export function clsx(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export const pretty = (x: unknown) => {
  try {
    return JSON.stringify(x, null, 2);
  } catch {
    return String(x);
  }
};

/**
 * Generate a Google Calendar link for a scheduled showing
 * @param scheduledDate - Date string or Date object
 * @param scheduledTime - Time string in format "HH:MM" or "HH:MM:SS"
 * @param applicantName - Name of the applicant
 * @param propertyAddress - Address of the property (optional)
 * @returns Google Calendar URL
 */
export function generateGoogleCalendarLink(
  scheduledDate: string | Date,
  scheduledTime: string,
  applicantName: string,
  propertyAddress?: string
): string {
  // Parse the date
  const date = typeof scheduledDate === "string" ? new Date(scheduledDate) : scheduledDate;
  
  // Extract date components (YYYY-MM-DD)
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // Parse time (format: "HH:MM" or "HH:MM:SS")
  const timeParts = scheduledTime.split(":");
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1] || "0", 10);
  
  // Create start datetime in local timezone
  const startDateTime = new Date(year, month, day, hours, minutes, 0);
  
  // End time is 1 hour later
  const endDateTime = new Date(startDateTime);
  endDateTime.setHours(endDateTime.getHours() + 1);
  
  // Format dates for Google Calendar (YYYYMMDDTHHMMSS)
  // Using local time format (no Z) - Google Calendar will interpret based on user's timezone
  const formatGoogleDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dDay = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");
    return `${y}${m}${dDay}T${h}${min}${s}`;
  };
  
  const startDateStr = formatGoogleDate(startDateTime);
  const endDateStr = formatGoogleDate(endDateTime);
  
  // Build the Google Calendar URL
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${applicantName} - Property Showing`,
    dates: `${startDateStr}/${endDateStr}`,
    details: `Property showing for ${applicantName}${propertyAddress ? `\n\nProperty Address: ${propertyAddress}` : ""}`,
  });
  
  if (propertyAddress) {
    params.append("location", propertyAddress);
  }
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}