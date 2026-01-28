# Contact Information & OTP Verification Features

## ✅ Features Implemented

### 1. Contact Information Added

**Location**: Footer on Home Page

- **Phone Number**: +91 9935175081 (clickable link)
- **Email**: tanusng2727@gmail.com (clickable link)
- **Customer Support Section**: Displayed prominently in footer

**How to Access**:
- Scroll to bottom of home page
- Contact info is displayed in footer

### 2. Review Link Added

**Location**: Footer next to "All rights reserved"

- Added "Review" link in footer
- Links to Google Form (you need to create the form)
- Opens in new tab

**To Set Up**:
1. Create a Google Form (see `GOOGLE_FORM_SETUP.md`)
2. Get the form URL (e.g., `https://forms.gle/XXXXXXXXXX`)
3. Update `src/pages/Index.tsx` line with your form URL:
   ```tsx
   href="https://forms.gle/YOUR_FORM_ID_HERE"
   ```

### 3. OTP Phone Verification

**Location**: Sign Up Page

**Features**:
- ✅ Phone number validation (Indian format)
- ✅ Send OTP button
- ✅ 6-digit OTP input
- ✅ OTP verification before account creation
- ✅ OTP expires in 10 minutes
- ✅ Maximum 5 verification attempts
- ✅ Visual feedback (verified badge)

**How It Works**:
1. User enters phone number
2. Clicks "Send OTP"
3. OTP is generated and sent (currently logged to console in dev)
4. User enters 6-digit OTP
5. Clicks "Verify"
6. Phone verified before signup can proceed

**Current Status**:
- ✅ Backend OTP generation working
- ✅ OTP verification working
- ⏳ SMS sending (needs integration - see `OTP_SETUP.md`)

**For Production**:
- Integrate with SMS service (Twilio, MSG91, TextLocal, etc.)
- See `OTP_SETUP.md` for detailed instructions

## Files Modified

1. **src/pages/Index.tsx**
   - Added contact information in footer
   - Added Review link
   - Added icons for phone and email

2. **src/pages/SignUp.tsx**
   - Added OTP verification flow
   - Added OTP input component
   - Added phone verification requirement

3. **server/routes/otp.js** (NEW)
   - OTP generation and verification endpoints
   - Phone number validation
   - OTP expiration and attempt limiting

4. **server/server.js**
   - Added OTP routes

5. **src/lib/api.ts**
   - Added `sendOTP()` and `verifyOTP()` methods

## Testing

### Test Contact Info:
1. Go to home page
2. Scroll to footer
3. Click phone number (should open dialer)
4. Click email (should open email client)
5. Click "Review" link (should open Google Form)

### Test OTP Verification:
1. Go to Sign Up page
2. Enter phone number (e.g., 9935175081)
3. Click "Send OTP"
4. Check backend console for OTP (in dev mode)
5. Enter OTP
6. Click "Verify"
7. Should see "Phone number verified" message
8. Complete signup form
9. Account creation should proceed

## Next Steps

1. **Create Google Form**:
   - Follow `GOOGLE_FORM_SETUP.md`
   - Update the form URL in `src/pages/Index.tsx`

2. **Set Up SMS Service** (for production):
   - Choose SMS provider (Twilio, MSG91, etc.)
   - Follow `OTP_SETUP.md`
   - Update `server/routes/otp.js` with SMS integration

3. **Test Everything**:
   - Test contact links work
   - Test OTP flow end-to-end
   - Test review form link

## Important Notes

- **OTP in Development**: Currently OTPs are logged to console. For production, integrate SMS service.
- **Google Form**: You need to create the form and update the URL in code.
- **Phone Format**: Accepts Indian phone numbers (10 digits, with or without country code).
- **OTP Security**: OTPs expire in 10 minutes, max 5 attempts per OTP.

