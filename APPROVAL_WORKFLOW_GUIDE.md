# Join Request Approval Workflow Guide

## Overview
Complete workflow for user join requests: submission → admin approval → email notification → welcome page verification.

---

## 📋 Complete Workflow Steps

### 1. **User Submits Join Request** 
- URL: `POST /join-us`
- User submits form with: name, email, occupation, company, LinkedIn, website, city, reason to join, source
- Data stored in MongoDB with `status: "pending"`
- Response: `{ ok: true, id: request_id }`

### 2. **Admin Reviews in Dashboard**
- URL: `https://foundersconnect.vercel.app/admin` (Login required)
- Tab: "Forms" → "Join Us Form Submissions"
- Shows all pending requests with user details
- **New Feature**: Approve/Reject buttons for each request

### 3. **Admin Approves Request**
- Click "Approve" button
- Sends: `PATCH /admin/join-requests/{id}/status`
- Body: `{ status: "approved" }`
- **Database Updated**: Status changes from "pending" → "approved"

### 4. **Approval Email Sent Automatically** ✉️
- **To**: User's email address
- **Subject**: "🎉 Welcome to Founders Connect - Your Application is Approved!"
- **Content**: 
  - Personalized greeting
  - Welcome message
  - Link to welcome page with email parameter
  - WhatsApp community invitation
  - Next steps guide
- **Logo**: Founders Connect branded email with logo header

### 5. **User Clicks Welcome Link**
- Email link format: `/welcome?email={user_email}`
- Page loads and checks approval status automatically

### 6. **Database Verification**
- Frontend calls: `GET /join-us/check-status?email={email}`
- Backend looks up join request by email
- Returns:
  ```json
  {
    "ok": true,
    "approved": true,
    "status": "approved",
    "data": {
      "name": "User Name",
      "email": "user@example.com",
      "company": "Company Name",
      "city": "City",
      "createdAt": "2026-05-09T...",
      "status": "approved"
    }
  }
  ```

### 7. **Welcome Page Shows Personalized Content**
- Shows verification banner: "✓ Welcome {name}! Your profile ({company} from {city}) is verified and approved."
- Display benefits, stats, testimonials
- WhatsApp community link
- Event exploration options
- Ad space for monetization

---

## 🔧 Backend API Endpoints

### User-Facing Endpoints

**Submit Join Request**
```
POST /join-us
Content-Type: application/json
Body: {
  name, email, phone, occupation, collegeName, companyName, 
  linkedinProfile, website, city, whyJoin, referralSource, 
  emailVerificationToken
}
Response: { ok: true, id: "..." }
```

**Check Approval Status**
```
GET /join-us/check-status?email={email}
Response: {
  ok: boolean,
  approved: boolean,
  status: "pending" | "approved" | "rejected" | null,
  data: { name, email, company, city, createdAt, status },
  message?: string
}
```

### Admin-Only Endpoints

**List All Join Requests**
```
GET /admin/join-requests
Headers: Authorization: Bearer {token}
Response: { requests: [...] }
```

**Update Join Request Status**
```
PATCH /admin/join-requests/{id}/status
Headers: Authorization: Bearer {token}
Body: { status: "approved" | "rejected" }
Response: { ok: true, request: {...} }
- Triggers email notification on approval
- Logs action with console output
```

---

## 📧 Email Configuration

### Required Environment Variables in `.env`
```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Fallback
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# URLs for email links
FRONTEND_URL=https://foundersconnect.vercel.app
HOST_URL=https://foundersconnect.vercel.app
HOST_DOMAIN=foundersconnect.co.in

NEWSLETTER_FROM_EMAIL="Founders Connect <your-email@gmail.com>"
```

### Gmail Configuration
1. Enable 2-Step Verification in Google Account
2. Generate App Password (16 characters)
3. Use App Password in `SMTP_PASS` (NOT your regular password)
4. Password format: `ehsb ggaj yvwq uagq` (without spaces in actual value)

### Email Debugging
- Check console logs: `✓ Approval email sent to user@email.com`
- If error: `✗ Failed to send approval email to user@email.com: [error details]`
- SMTP not configured: Email send skipped silently (logs warning)

---

## 🔍 Frontend Verification Features

### Welcome Page (`/welcome`)
1. **Query Parameter Support**: `?email={user_email}`
2. **Status Indicators**:
   - ⏳ **Checking**: Verifying with server
   - ✅ **Approved**: Shows personalized welcome banner
   - ⏳ **Pending**: Shows message "Still pending admin review"
   - ❌ **Error**: Shows refresh prompt
3. **User Data Display**: Name, company, city from database
4. **Responsive Design**: Mobile-optimized

### Status Check API Response Handling
```typescript
// In Welcome.tsx
const response = await checkJoinRequestStatusApi(email);
if (response.ok && response.approved) {
  // Show welcome content
  setApprovalStatus("approved");
  setUserData(response.data);
} else if (!response.approved) {
  // Show pending message
  setApprovalStatus("not-approved");
} else {
  // Show error
  setApprovalStatus("error");
}
```

---

## 📱 Testing the Complete Workflow

### Manual Testing Steps

1. **Test Database Storage**
   - Submit join request via `/join-us` page
   - Check MongoDB: Should see document in `join_requests` collection
   - Status should be: "pending"

2. **Test Admin Dashboard**
   - Login to admin dashboard
   - Go to "Forms" tab
   - Should see new join request
   - Click "Approve" button
   - Status should change immediately to "approved"
   - Check console for: `✓ Approval email sent to...`

3. **Test Email Sending**
   - Check your email inbox for approval email
   - Should arrive within 2-3 seconds
   - Contains: personalized greeting, welcome link, WhatsApp link
   - Link format: `/welcome?email={encoded_email}`

4. **Test Welcome Page Verification**
   - Click email link or manually visit: `/welcome?email=test@example.com`
   - Page should show verification banner: "✓ Welcome [Name]..."
   - Verify user data displays correctly (name, company, city)
   - All benefits/stats/testimonials should load

5. **Test Status Checking (Manual)**
   ```bash
   curl "https://api.foundersconnect.app/join-us/check-status?email=test@example.com"
   # Response:
   # {
   #   "ok": true,
   #   "approved": true,
   #   "status": "approved",
   #   "data": { ... }
   # }
   ```

---

## 🐛 Troubleshooting

### Email Not Sending

**Problem**: Admin clicks approve but user doesn't receive email

**Solutions**:
1. ✓ Check `.env` has valid SMTP credentials
2. ✓ Verify SMTP_USER/SMTP_PASS are set correctly
3. ✓ Check Gmail App Password (not regular password)
4. ✓ Verify backend logs for `✗ Failed to send...` message
5. ✓ Check user email is valid (no typos)
6. ✓ Check email isn't in spam folder

### Welcome Page Not Verifying

**Problem**: User clicks link but sees "Pending" or "Error" message

**Solutions**:
1. ✓ Verify database has approval status = "approved"
2. ✓ Check email parameter in URL is correctly encoded
3. ✓ Verify network call to `/join-us/check-status` succeeds (DevTools Network tab)
4. ✓ Check API returns correct status and data
5. ✓ Refresh page to retry verification

### Status Not Updating in Admin Dashboard

**Problem**: Clicked approve but status still shows "pending"

**Solutions**:
1. ✓ Check network request succeeded (DevTools Network tab)
2. ✓ Verify PATCH request returned `{ ok: true }`
3. ✓ Check MongoDB for actual status update
4. ✓ Refresh admin page (may need to F5)
5. ✓ Check console for any error messages

---

## 🚀 Production Deployment

### Before Going Live
1. ✓ Set correct `FRONTEND_URL` in .env (production URL)
2. ✓ Verify SMTP credentials with production email service
3. ✓ Test end-to-end approval workflow
4. ✓ Verify email branded header loads (logo URL correct)
5. ✓ Ensure `/welcome` page is accessible publicly
6. ✓ Test on mobile devices (email opens on mobile)

### Monitoring
- Enable logging for email sends: `console.log('✓ Email sent...')`
- Monitor MongoDB for approval status changes
- Track email delivery (Gmail logs, bounce backs)
- Monitor API error rates for both endpoints

---

## 📊 Database Schema

### Join Request Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, lowercase, indexed),
  phone: String (required),
  occupation: String (required),
  collegeName: String (optional),
  companyName: String (required),
  linkedinProfile: String (required),
  website: String (required),
  city: String (required),
  whyJoin: String (required),
  referralSource: String (required),
  status: String (default: "pending", values: "pending", "approved", "rejected"),
  createdAt: DateTime (auto),
  updatedAt: DateTime (auto)
}
```

---

## 📝 Files Modified

Backend:
- `backend/controllers/join.controller.js` - Added email sending + verification
- `backend/routes/admin.routes.js` - Added approve/reject endpoint
- `backend/routes/content.routes.js` - Added status check endpoint
- `backend/.env` - Added FRONTEND_URL, HOST_URL, SMTP settings

Frontend:
- `src/lib/api.ts` - Added checkJoinRequestStatusApi
- `src/pages/Welcome.tsx` - Added email verification + status banner
- `src/pages/AdminDashboard.tsx` - Added approve/reject buttons

---

## ✅ Implementation Checklist

- [x] Backend email sending integrated
- [x] Admin approve/reject endpoints created
- [x] Database schema updated for status
- [x] Email template with personalized content
- [x] Welcome page verification feature
- [x] Status checking API endpoint
- [x] Frontend UI updates
- [x] Error handling and logging
- [x] Mobile responsive design
- [x] Build passes without errors

---

**Last Updated**: May 9, 2026
**Status**: Production Ready ✅
