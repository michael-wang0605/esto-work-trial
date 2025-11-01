# Tenant Screening Workflow - Testing Guide

## Quick Test Overview

Test the complete workflow from email receipt to calendar scheduling.

## 1. Prerequisites

### Environment Variables Setup

**Backend (Render or local `.env`):**
```env
AGENTMAIL_API_KEY=your_key
AGENTMAIL_INBOX_ID=your_inbox_id
AGENTMAIL_API_URL=https://api.agentmail.com
HYPERSPELL_API_KEY=your_key
HYPERSPELL_API_URL=https://api.hyperspell.com
LLM_API_KEY=your_gemini_key
DATABASE_URL=your_postgres_url
DEFAULT_USER_ID=your_user_id
```

**Frontend (Vercel or local `.env.local`):**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000  # or your Render URL
DATABASE_URL=your_postgres_url
```

### Start Services

**Backend:**
```bash
cd /Users/michael/prop_ai
python start_backend.py
# Should see: "🚀 Starting Ten8Link Minimal Backend..."
```

**Frontend:**
```bash
cd propai-frontend
npm run dev
# Visit http://localhost:3000
```

## 2. Component Testing

### A. Test Agentmail Inbox Monitoring

**Option 1: Manual Trigger (Recommended for testing)**
```bash
curl -X POST http://localhost:8000/api/agentmail/check-inbox
```

Expected response:
```json
{
  "success": true,
  "message": "Inbox check initiated"
}
```

**Option 2: Send Test Email**
1. Send an email to your Agentmail inbox with:
   - Subject: "Application for Property"
   - Body: "Hi, I'm John Doe (john.doe@email.com, phone: +1234567890). I'm interested in applying."
   - Attachments:
     - Driver's license (image or PDF)
     - Pay stub (image or PDF)
     - Credit score report (image or PDF)

2. Trigger inbox check:
```bash
curl -X POST http://localhost:8000/api/agentmail/check-inbox
```

3. Check backend logs for:
   - "📧 Found X new email(s)"
   - "📄 Processing documents for application..."
   - "✅ Application processed: approved/rejected"

### B. Test Document Processing

**Direct API Test:**
```bash
curl -X POST http://localhost:8000/api/tenant-applications/process-documents \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "test-app-123",
    "driversLicenseUrl": "https://example.com/license.jpg",
    "payStubUrls": ["https://example.com/paystub1.jpg"],
    "creditScoreUrl": "https://example.com/credit.jpg"
  }'
```

Expected response:
```json
{
  "success": true,
  "applicationId": "test-app-123",
  "extractedData": {
    "license": {
      "name": "John Doe",
      "dob": "1990-01-01",
      "expiration": "2025-12-31",
      "number": "DL123456"
    },
    "income": {
      "monthly": 6000,
      "annual": 72000,
      "frequency": "monthly",
      "employer": "ABC Company"
    },
    "credit_score": 720
  }
}
```

### C. Test Screening Score Calculation

```bash
curl -X POST http://localhost:8000/api/tenant-applications/test-app-123/calculate-score \
  -H "Content-Type: application/json" \
  -d '{
    "creditScore": 720,
    "monthlyIncome": 6000,
    "monthlyRent": 2000,
    "licenseExpiration": "2025-12-31",
    "licenseName": "John Doe",
    "applicantName": "John Doe",
    "minCreditScore": 600,
    "incomeMultiplier": 3.0,
    "minIncomeMultiplier": 2.5
  }'
```

Expected response:
```json
{
  "success": true,
  "applicationId": "test-app-123",
  "score": "green",
  "status": "approved",
  "notes": "All criteria met: Excellent credit, sufficient income, valid license",
  "autoApproved": true
}
```

### D. Test Calendar Availability

```bash
curl "http://localhost:8000/api/calendar/availability?userId=test-user&days=14"
```

Expected response:
```json
{
  "success": true,
  "available_slots": [
    {
      "date": "2025-01-15",
      "time": "09:00",
      "duration": 60
    },
    {
      "date": "2025-01-15",
      "time": "14:00",
      "duration": 60
    }
  ]
}
```

### E. Test Scheduling Email

```bash
curl -X POST http://localhost:8000/api/tenant-applications/test-app-123/send-scheduling-email \
  -H "Content-Type: application/json" \
  -d '{
    "applicantName": "John Doe",
    "applicantEmail": "john.doe@email.com",
    "userId": "test-user"
  }'
```

Expected response:
```json
{
  "success": true,
  "applicationId": "test-app-123",
  "availableSlots": [...],
  "emailSent": true
}
```

### F. Test Calendar Event Creation

```bash
curl -X POST http://localhost:8000/api/tenant-applications/test-app-123/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "scheduledDate": "2025-01-15T00:00:00Z",
    "scheduledTime": "14:00",
    "applicantName": "John Doe",
    "applicantEmail": "john.doe@email.com",
    "applicantPhone": "+1234567890",
    "propertyAddress": "123 Main St",
    "monthlyIncome": 6000,
    "creditScore": 720,
    "parkingInstructions": "Park in lot A, spaces 1-10"
  }'
```

Expected response:
```json
{
  "success": true,
  "applicationId": "test-app-123",
  "calendarEventId": "event-id-123",
  "scheduledDate": "2025-01-15T00:00:00Z",
  "scheduledTime": "14:00",
  "emailSent": true
}
```

### G. Test Rejection Email

```bash
curl -X POST http://localhost:8000/api/tenant-applications/test-app-123/send-rejection-email \
  -H "Content-Type: application/json" \
  -d '{
    "applicantName": "John Doe",
    "applicantEmail": "john.doe@email.com",
    "propertyName": "Sunset Apartments"
  }'
```

## 3. Frontend UI Testing

### A. Access Applications Page

1. Start frontend: `cd propai-frontend && npm run dev`
2. Visit: http://localhost:3000/applications
3. Login if required (use your auth system)

### B. Test Applications List

**What to check:**
- ✅ Page loads without errors
- ✅ Applications are displayed (if any exist)
- ✅ Status badges show correctly (pending, approved, rejected, etc.)
- ✅ Search bar works
- ✅ Filter dropdown works (all, pending, approved, rejected)
- ✅ Clicking an application navigates to detail page

### C. Test Application Detail Page

1. Click on an application from the list
2. Verify:
   - ✅ All application details display
   - ✅ Documents section shows (if available)
   - ✅ Screening score badge shows (green/yellow/red)
   - ✅ Action buttons are visible:
     - Process Documents
     - Calculate Score
     - Approve & Send Email
     - Reject
     - Schedule Showing
   - ✅ Background check results display (if run)

### D. Test Frontend API Routes

**List Applications:**
```bash
curl http://localhost:3000/api/applications
```

**Get Application Details:**
```bash
curl http://localhost:3000/api/applications/test-app-123
```

**Process Documents:**
```bash
curl -X POST http://localhost:3000/api/applications/test-app-123/process \
  -H "Content-Type: application/json" \
  -d '{
    "driversLicenseUrl": "https://example.com/license.jpg",
    "payStubUrls": ["https://example.com/paystub.jpg"],
    "creditScoreUrl": "https://example.com/credit.jpg"
  }'
```

**Approve Application:**
```bash
curl -X POST http://localhost:3000/api/applications/test-app-123/approve \
  -H "Content-Type: application/json" \
  -d '{
    "applicantName": "John Doe",
    "applicantEmail": "john.doe@email.com",
    "userId": "test-user"
  }'
```

## 4. End-to-End Workflow Test

### Complete Flow Test

**Step 1: Simulate Email Arrival**
```bash
# Manually create an application via API (or send real email to Agentmail)
curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "applicantName": "Jane Smith",
    "applicantEmail": "jane.smith@email.com",
    "applicantPhone": "+1234567890",
    "emailSubject": "Application for Property",
    "emailBody": "Hi, I am interested in applying.",
    "driversLicenseUrl": "https://example.com/license.jpg",
    "payStubUrls": ["https://example.com/paystub.jpg"],
    "creditScoreUrl": "https://example.com/credit.jpg"
  }'
```

**Step 2: Process Documents**
- Open the application in the UI
- Click "Process Documents"
- Wait for extraction to complete
- Verify extracted data appears

**Step 3: Calculate Screening Score**
- Click "Calculate Score"
- Verify score appears (green/yellow/red)
- Check screening notes

**Step 4: Approve & Send Scheduling Email**
- If score is green/yellow, click "Approve & Send Email"
- Verify email sent (check Agentmail or logs)
- Verify available time slots are in the email

**Step 5: Schedule Showing**
- Simulate tenant reply or manually schedule
- Click "Schedule Showing"
- Enter date/time
- Verify calendar event created
- Verify confirmation email sent

**Step 6: Verify in Calendar**
- Check your Google Calendar via Hyperspell
- Verify event exists with correct details

## 5. Error Testing

### Test Missing Documents

Create application with missing documents:
```bash
curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "applicantName": "Test User",
    "applicantEmail": "test@email.com",
    "driversLicenseUrl": null,
    "payStubUrls": [],
    "creditScoreUrl": null
  }'
```

**Expected:**
- System should send "Missing Documents" email
- Application status should remain "pending"

### Test Invalid Credit Score

```bash
curl -X POST http://localhost:8000/api/tenant-applications/test/calculate-score \
  -H "Content-Type: application/json" \
  -d '{
    "creditScore": 550,
    "monthlyIncome": 4000,
    "monthlyRent": 2000,
    "licenseExpiration": "2025-12-31"
  }'
```

**Expected:**
- Score: "red"
- Status: "rejected"
- Rejection email sent

### Test Invalid License

```bash
curl -X POST http://localhost:8000/api/tenant-applications/test/calculate-score \
  -H "Content-Type: application/json" \
  -d '{
    "creditScore": 720,
    "monthlyIncome": 6000,
    "monthlyRent": 2000,
    "licenseExpiration": "2024-01-01"  # Expired
  }'
```

**Expected:**
- License validation fails
- Score: "yellow" or "red"

## 6. Database Verification

### Check Application in Database

```sql
-- Connect to your PostgreSQL database
SELECT * FROM "TenantApplication" ORDER BY "createdAt" DESC LIMIT 10;
```

**Verify:**
- ✅ Application records exist
- ✅ Extracted data populated
- ✅ Status updated correctly
- ✅ Screening score set
- ✅ Calendar event ID stored (if scheduled)

### Check Property Settings

```sql
SELECT * FROM "PropertySettings";
```

**Verify:**
- ✅ Settings exist for properties
- ✅ Screening criteria configured
- ✅ Business hours set
- ✅ Parking instructions stored

## 7. Monitoring & Logs

### Backend Logs

Watch for these log messages:
```
📬 Checking Agentmail inbox...
📧 Found X new email(s)
📄 Processing documents for application...
✅ Application processed: approved (green)
📧 Sent scheduling email to...
📅 Calendar event created: event-id-123
```

### Error Logs

Check for:
- ❌ "Error checking Agentmail inbox"
- ❌ "Error processing documents"
- ❌ "Error calculating screening score"
- ❌ "Error creating calendar event"

## 8. Quick Test Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads applications page
- [ ] Can create new application
- [ ] Can process documents
- [ ] Screening score calculates correctly
- [ ] Approve button sends scheduling email
- [ ] Calendar availability returns slots
- [ ] Calendar event creates successfully
- [ ] Rejection email sends
- [ ] Database records persist correctly

## 9. Production Testing

After deployment:

1. **Test with Real Email:**
   - Send test email to Agentmail inbox
   - Include real document attachments
   - Verify full workflow completes

2. **Test Calendar Integration:**
   - Verify events appear in Google Calendar
   - Test event updates/cancellations

3. **Monitor Error Rates:**
   - Check Render logs for errors
   - Check Vercel logs for frontend errors
   - Monitor Agentmail/Hyperspell API usage

4. **Performance:**
   - Document processing time (< 30 seconds)
   - Email delivery time (< 10 seconds)
   - Calendar event creation (< 5 seconds)

## Troubleshooting

### Backend won't start
- Check environment variables
- Verify all dependencies installed
- Check Python version (3.11+)

### Documents not processing
- Verify Gemini API key is valid
- Check document URLs are accessible
- Review backend logs for errors

### Emails not sending
- Verify Agentmail credentials
- Check inbox ID is correct
- Review Agentmail API logs

### Calendar events not creating
- Verify Hyperspell API key
- Check user_id is valid
- Review Hyperspell API logs

### Frontend errors
- Check browser console
- Verify `NEXT_PUBLIC_BACKEND_URL` is set
- Check network requests in DevTools

