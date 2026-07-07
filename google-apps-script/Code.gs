/**
 * RAJWADI KANGAN — Reseller Form backend
 * ---------------------------------------------------------------
 * Receives the "Join Our Network" form submission (posted as JSON from
 * form.js) and appends it as a new row in a Google Sheet.
 *
 * SETUP
 * 1. Create (or open) a Google Sheet for your reseller leads.
 * 2. Extensions → Apps Script. Delete any starter code and paste this
 *    whole file in.
 * 3. Click "Deploy" → "New deployment" → type: "Web app".
 *      - Execute as:   Me
 *      - Who has access: Anyone
 * 4. Deploy, authorize the requested permissions, and copy the resulting
 *    URL (it ends in /exec).
 * 5. Open form.js in the website project and set:
 *      const GAS_ENDPOINT = 'PASTE_YOUR_URL_HERE';
 *
 * The sheet's header row is created automatically the first time this
 * script runs, so you don't need to type it in yourself — this avoids
 * the most common source of "it saved to the wrong column" bugs.
 * ------------------------------------------------------------------ */

const SHEET_NAME = 'Sheet1';
const HEADERS = [
  'Timestamp',
  'Full Name',
  'Brand Name',
  'Store Name',
  'WhatsApp',
  'Website',
  'Social Media',
];

/**
 * Returns the target sheet, creating it (and writing the header row)
 * if it doesn't exist yet. This is what makes the script resilient to
 * a fresh spreadsheet, a renamed tab, or a first-ever run.
 */
function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Handles the POST from the website's reseller form.
 * Expected JSON body:
 * {
 *   "fullName": "Amirun",
 *   "brandName": "Rajwadi Kangan",
 *   "storeName": "Rajwadi Store",
 *   "whatsapp": "+918828888129",
 *   "website": "https://rajwadikangan.in",      // optional
 *   "socialMedia": "https://instagram.com/rajwadi_kangan" // optional
 * }
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('No data received in request body.');
    }

    const data = JSON.parse(e.postData.contents);

    // basic server-side validation — never trust the client alone
    const required = ['fullName', 'whatsapp'];
    const missing = required.filter((key) => !data[key] || String(data[key]).trim() === '');
    if (missing.length) {
      throw new Error('Missing required field(s): ' + missing.join(', '));
    }

    const sheet = getOrCreateSheet_();
    sheet.appendRow([
      new Date(),
      data.fullName,
      data.brandName,
      data.storeName,
      data.whatsapp,
      data.website || '',
      data.socialMedia || '',
    ]);

    return jsonResponse_({ success: true, message: 'Data saved successfully' });
  } catch (err) {
    return jsonResponse_({ success: false, message: err.toString() });
  }
}

/**
 * A GET request just confirms the deployment is live — handy for
 * sanity-checking the /exec URL directly in a browser tab.
 */
function doGet(e) {
  return jsonResponse_({
    success: true,
    message: 'Rajwadi Kangan reseller-form endpoint is live. POST JSON to this URL to save an entry.',
  });
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
