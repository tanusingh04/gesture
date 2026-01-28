# OTP Verification Setup

## Current Implementation

The OTP system is currently set up for development/testing. In development mode, OTPs are logged to the console.

## How It Works

1. **User enters phone number** in Sign Up form
2. **Clicks "Send OTP"** button
3. **OTP is generated** (6-digit code)
4. **OTP is sent** (currently logged to console in dev mode)
5. **User enters OTP** in the form
6. **OTP is verified** before account creation

## For Production - SMS Integration

To send real SMS OTPs, you need to integrate with an SMS service provider:

### Option 1: Twilio (Recommended)
1. Sign up at https://www.twilio.com
2. Get your Account SID and Auth Token
3. Install: `npm install twilio`
4. Update `server/routes/otp.js`:

```javascript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// In send OTP route:
await client.messages.create({
  body: `Your GS Grocery OTP is: ${otp}. Valid for 10 minutes.`,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: `+91${cleanPhone}`
});
```

### Option 2: AWS SNS
1. Set up AWS account
2. Configure SNS
3. Install: `npm install @aws-sdk/client-sns`

### Option 3: MSG91 (India)
1. Sign up at https://msg91.com
2. Get API key
3. Use their REST API

### Option 4: TextLocal (India)
1. Sign up at https://www.textlocal.in
2. Get API key
3. Use their REST API

## Environment Variables

Add to `server/.env`:

```env
# For Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Or for MSG91
MSG91_API_KEY=your_api_key
MSG91_SENDER_ID=GSGROC

# Or for TextLocal
TEXTLOCAL_API_KEY=your_api_key
TEXTLOCAL_SENDER=GSGROC
```

## Testing

In development mode:
- OTP is shown in console
- You can also set `SHOW_OTP=true` in `.env` to show OTP in API response
- OTP expires in 10 minutes
- Maximum 5 verification attempts

## Security Notes

- OTPs expire after 10 minutes
- Maximum 5 verification attempts per OTP
- OTPs are stored in memory (use Redis in production)
- Phone numbers are validated (Indian format)
- OTPs are 6-digit random numbers

## Current Status

✅ OTP generation working
✅ OTP verification working
✅ Phone number validation working
⏳ SMS sending (needs integration)
⏳ Production-ready storage (needs Redis/database)

