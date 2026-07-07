# Google Apps Script — Reseller Form Backend

This folder contains the backend that saves "Join Our Network" form
submissions into a Google Sheet.

## Setup (5 minutes)

1. Create a new Google Sheet (or open the one you want leads saved to).
2. In the Sheet, go to **Extensions → Apps Script**.
3. Delete the placeholder `myFunction() {}` code and paste in the entire
   contents of `Code.gs` from this folder.
4. Click **Deploy → New deployment**.
   - Click the gear icon next to "Select type" and choose **Web app**.
   - Description: anything, e.g. "Rajwadi Kangan reseller form".
   - Execute as: **Me**.
   - Who has access: **Anyone**.
5. Click **Deploy**. Google will ask you to authorize the script the first
   time — approve it (it only needs access to this one spreadsheet).
6. Copy the **Web app URL** shown after deployment (it ends in `/exec`).
7. Open `form.js` in the main website project (project root) and paste
   your URL into:
   ```js
   const GAS_ENDPOINT = 'PASTE_YOUR_URL_HERE';
   ```
8. Re-upload/re-deploy the website. Submit a test entry from the "Join
   Our Network" section — a new row should appear in your Sheet within a
   few seconds, and a WhatsApp tab should open with the same details.

## What this script does differently from a minimal version

- **Creates the header row automatically** the first time it runs, and
  bolds/freezes it — so you never end up with data in the wrong column
  because the sheet was blank or the header was typed differently.
- **Creates the "Sheet1" tab itself** if it's missing, instead of
  throwing `Cannot read properties of null` (a very common failure when
  the tab was renamed or deleted).
- **Validates required fields server-side** (full name, brand name,
  store name, WhatsApp number) so a malformed or spoofed request can't
  silently create a blank row.
- **Responds to GET requests** too, so you can open the `/exec` URL
  directly in a browser to confirm the deployment is live before wiring
  it up to the website.

## Redeploying after edits

If you ever edit `Code.gs` again, you must create a **new deployment**
(or use "Manage deployments" → edit → new version) for the changes to go
live — saving the script alone does not update the running Web App.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Nothing appears in the Sheet | `GAS_ENDPOINT` in `form.js` doesn't match your deployed URL, or the deployment's access isn't set to "Anyone". |
| Browser console shows a CORS error | Expected — the site posts with `mode: 'no-cors'` on purpose (see the website's `README.md` §8), so the response is opaque. Check the Sheet itself to confirm the row was written, rather than the network tab. |
| WhatsApp opens but the Sheet stays empty | The Apps Script call failed independently of WhatsApp (by design, so the enquiry is never lost). Open the `/exec` URL in a browser — if it doesn't return the "endpoint is live" message, redeploy the script. |
