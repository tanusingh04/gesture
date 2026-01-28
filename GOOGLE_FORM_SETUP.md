# Google Form Setup for Reviews

## Steps to Create and Link Your Review Form

1. **Create a Google Form**
   - Go to https://forms.google.com
   - Click "Blank" to create a new form
   - Title it: "GS Grocery Shop - Customer Review"

2. **Add Questions**
   Suggested questions:
   - **Name** (Short answer)
   - **Email** (Short answer)
   - **Phone** (Short answer)
   - **Order ID** (Short answer) - Optional
   - **Rating** (Scale 1-5)
   - **Review** (Paragraph)
   - **Suggestions** (Paragraph) - Optional

3. **Get Form Link**
   - Click "Send" button (top right)
   - Click the link icon
   - Copy the form URL
   - It will look like: `https://forms.gle/XXXXXXXXXX`

4. **Update the Link in Code**
   
   Open `src/pages/Index.tsx` and find this line:
   ```tsx
   <a 
     href="https://forms.gle/YOUR_FORM_ID_HERE" 
     target="_blank" 
     rel="noopener noreferrer"
     className="hover:underline hover:opacity-100 transition-opacity"
   >
     Review
   </a>
   ```
   
   Replace `https://forms.gle/YOUR_FORM_ID_HERE` with your actual Google Form URL.

5. **Test the Link**
   - Visit your site
   - Scroll to footer
   - Click "Review" link
   - Verify it opens your Google Form

## Example Form URL Format

```
https://forms.gle/AbCdEfGhIjKlMnOp
```

## Tips

- Make the form short and simple
- Enable "Collect email addresses" if needed
- Set form to accept responses
- You can view responses in Google Sheets
- Share the form link only, not the edit link

## Viewing Responses

1. Open your Google Form
2. Click "Responses" tab
3. View responses or link to Google Sheets for better analysis

