const PDFDocument = require('pdfkit');
const { Resend } = require('resend');

const BUSINESS = {
  name: 'ClearEdge Protective Films',
  phone: '(678) 983-5212',
  email: 'dallas@clearedgeppf.com',
  website: 'clearedgeppf.com',
};

const PURPLE = '#7851A9';
const W = 512;

// ── Airtable helpers ───────────────────────────────────────────────────────

async function fetchPendingRecords() {
  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME = 'Leads' } = process.env;
  const filter = encodeURIComponent('AND({Status}="Completed",NOT({Invoice Sent}))');
  const res = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}?filterByFormula=${filter}`,
    { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } }
  );
  if (!res.ok) throw new Error(`Airtable fetch failed: ${res.status}`);
  const { records } = await res.json();
  return records;
}

async function markInvoiceSent(recordId) {
  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME = 'Leads' } = process.env;
  await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}/${recordId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields: { 'Invoice Sent': true } }),
    }
  );
}

// ── Invoice number ─────────────────────────────────────────────────────────

function makeInvoiceNumber(completionDate) {
  const dateStr = completionDate
    ? completionDate.replace(/-/g, '')
    : new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `INV-${dateStr}-${rand}`;
}

// ── PDF generation ─────────────────────────────────────────────────────────

function buildPDF(fields, invoiceNumber) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const vehicle =
      [fields['Vehicle Year'], fields['Vehicle Make'], fields['Vehicle Model']]
        .filter(Boolean)
        .join(' ') || 'Not specified';

    const completionDate = fields['Completion Date'] || new Date().toISOString().slice(0, 10);
    const priceStr =
      fields['Final Price'] != null ? `$${Number(fields['Final Price']).toFixed(2)}` : 'TBD';

    // Header bar
    doc.rect(50, 50, W, 72).fill(PURPLE);
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(20)
      .text(BUSINESS.name, 65, 63, { lineBreak: false });
    doc.font('Helvetica').fontSize(9)
      .text(`${BUSINESS.phone}  •  ${BUSINESS.email}  •  ${BUSINESS.website}`, 65, 87, { lineBreak: false });
    doc.font('Helvetica-Bold').fontSize(26)
      .text('INVOICE', 50, 63, { width: W - 10, align: 'right', lineBreak: false });

    // Invoice meta
    let y = 142;
    doc.fillColor('#999999').font('Helvetica').fontSize(8)
      .text('INVOICE #', 50, y).text('DATE', 230, y).text('PAYMENT STATUS', 400, y);
    y += 13;
    doc.fillColor('#111111').font('Helvetica-Bold').fontSize(10)
      .text(invoiceNumber, 50, y)
      .text(completionDate, 230, y)
      .text(fields['Payment Status'] || 'Unpaid', 400, y);

    y += 22;
    doc.moveTo(50, y).lineTo(562, y).strokeColor('#e0e0e0').lineWidth(0.5).stroke();

    // Bill to / Vehicle
    y += 14;
    doc.fillColor('#999999').font('Helvetica').fontSize(8)
      .text('BILL TO', 50, y).text('VEHICLE', 310, y);
    y += 13;
    doc.fillColor('#111111').font('Helvetica-Bold').fontSize(11)
      .text(fields['Name'] || '', 50, y, { width: 250 })
      .text(vehicle, 310, y, { width: 250 });
    y += 16;
    doc.font('Helvetica').fontSize(9).fillColor('#555555');
    if (fields['Email']) { doc.text(fields['Email'], 50, y); y += 13; }
    if (fields['Phone']) { doc.text(fields['Phone'], 50, y); y += 13; }

    y += 8;
    doc.moveTo(50, y).lineTo(562, y).strokeColor('#e0e0e0').lineWidth(0.5).stroke();

    // Service table header
    y += 1;
    doc.rect(50, y, W, 22).fill('#f5f5f5');
    doc.fillColor('#333333').font('Helvetica-Bold').fontSize(9)
      .text('DESCRIPTION', 60, y + 7, { lineBreak: false })
      .text('AMOUNT', 502, y + 7, { width: 60, align: 'right', lineBreak: false });
    y += 23;

    // Service row
    const descParts = [
      fields['Service Requested'] ? `Service: ${fields['Service Requested']}` : 'Vehicle Protection Service',
      fields['Coverage Details'] ? `Notes: ${fields['Coverage Details']}` : null,
      fields['Warranty Length'] ? `Warranty: ${fields['Warranty Length']}` : null,
    ].filter(Boolean);
    const descText = descParts.join('\n');
    const descTextHeight = doc.heightOfString(descText, { width: W - 100, lineGap: 3 });

    doc.fillColor('#111111').font('Helvetica').fontSize(10)
      .text(descText, 60, y + 6, { width: W - 100, lineGap: 3 });
    doc.font('Helvetica-Bold').fontSize(10)
      .text(priceStr, 502, y + 6, { width: 60, align: 'right', lineBreak: false });

    y += Math.max(descTextHeight, 20) + 16;

    // Total
    doc.moveTo(50, y).lineTo(562, y).strokeColor('#e0e0e0').lineWidth(0.5).stroke();
    y += 10;
    doc.fillColor('#111111').font('Helvetica-Bold').fontSize(12)
      .text('TOTAL', 50, y, { width: W - 70, align: 'right', lineBreak: false })
      .text(priceStr, 502, y, { width: 60, align: 'right', lineBreak: false });
    if (fields['Payment Method']) {
      y += 18;
      doc.font('Helvetica').fontSize(9).fillColor('#888888')
        .text(`Payment method: ${fields['Payment Method']}`, 50, y, { width: W, align: 'right' });
    }

    // Footer
    const footerY = 700;
    doc.moveTo(50, footerY).lineTo(562, footerY).strokeColor('#e0e0e0').lineWidth(0.5).stroke();
    doc.font('Helvetica').fontSize(8.5).fillColor('#999999')
      .text('Thank you for choosing ClearEdge Protective Films — we appreciate your business.', 50, footerY + 10, { align: 'center', width: W })
      .text(`Questions? Call ${BUSINESS.phone} or email ${BUSINESS.email}`, 50, footerY + 23, { align: 'center', width: W })
      .text('Care guide and warranty details at clearedgeppf.com', 50, footerY + 36, { align: 'center', width: W });

    doc.end();
  });
}

// ── Main handler (runs on schedule) ───────────────────────────────────────

exports.handler = async () => {
  let records;
  try {
    records = await fetchPendingRecords();
  } catch (err) {
    console.error('Failed to fetch pending records:', err.message);
    return { statusCode: 500, body: err.message };
  }

  if (!records.length) {
    console.log('No pending invoices.');
    return { statusCode: 200, body: 'No pending invoices' };
  }

  console.log(`Found ${records.length} record(s) to invoice`);
  const resend = new Resend(process.env.RESEND_API_KEY);
  const results = [];

  for (const record of records) {
    const { id: recordId, fields } = record;
    try {
      const customerEmail = fields['Email'];
      if (!customerEmail) {
        console.warn(`Record ${recordId} has no email — skipping`);
        results.push({ recordId, status: 'skipped', reason: 'no email' });
        continue;
      }

      const invoiceNumber = makeInvoiceNumber(fields['Completion Date']);
      const pdfBuffer = await buildPDF(fields, invoiceNumber);

      const customerName = fields['Name'] || 'Valued Customer';
      const vehicle =
        [fields['Vehicle Year'], fields['Vehicle Make'], fields['Vehicle Model']]
          .filter(Boolean).join(' ') || 'your vehicle';

      await resend.emails.send({
        from: process.env.INVOICE_FROM_EMAIL || `invoices@updates.${BUSINESS.website}`,
        to: customerEmail,
        subject: `Invoice from ClearEdge Protective Films — ${vehicle}`,
        html: `
          <p>Hi ${customerName},</p>
          <p>Thank you for choosing ClearEdge Protective Films! Please find your invoice attached.</p>
          <p>If you have any questions about your service or warranty, reach out to us directly:</p>
          <p>
            <strong>Phone:</strong> ${BUSINESS.phone}<br>
            <strong>Email:</strong> ${BUSINESS.email}
          </p>
          <p>We hope to see you again for any future protection needs!</p>
          <p>— The ClearEdge Team</p>
          <p style="color:#999;font-size:12px;">Please do not reply to this email. To reach us, call or email the contact info above.</p>
        `,
        attachments: [{ filename: `${invoiceNumber}.pdf`, content: pdfBuffer }],
      });

      await markInvoiceSent(recordId);
      console.log(`Invoice sent for record ${recordId}: ${invoiceNumber}`);
      results.push({ recordId, status: 'sent', invoiceNumber });
    } catch (err) {
      console.error(`Failed to invoice record ${recordId}:`, err.message);
      results.push({ recordId, status: 'error', error: err.message });
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(results),
  };
};
