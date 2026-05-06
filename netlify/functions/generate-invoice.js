const PDFDocument = require('pdfkit');
const { Resend } = require('resend');

const BUSINESS = {
  name: 'ClearEdge Protective Films',
  address: 'Kennesaw, GA 30144',
  phone: '(678) 983-5212',
  email: 'dallas@clearedgeppf.com',
  website: 'clearedgeppf.com',
};

const PURPLE = '#7851A9';
const W = 512; // usable page width (LETTER 612pt - 2*50pt margins)

async function fetchRecord(recordId) {
  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME = 'Leads' } = process.env;
  const res = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}/${recordId}`,
    { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } }
  );
  if (!res.ok) throw new Error(`Airtable fetch failed: ${res.status}`);
  return res.json();
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

function makeInvoiceNumber(completionDate) {
  const dateStr = completionDate
    ? completionDate.replace(/-/g, '')
    : new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `INV-${dateStr}-${rand}`;
}

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

    // ── Header bar ──────────────────────────────────────────────────────────
    doc.rect(50, 50, W, 72).fill(PURPLE);

    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(20)
      .text(BUSINESS.name, 65, 63, { lineBreak: false });

    doc.font('Helvetica').fontSize(9)
      .text(
        `${BUSINESS.phone}  •  ${BUSINESS.email}  •  ${BUSINESS.website}`,
        65, 87, { lineBreak: false }
      );

    doc.font('Helvetica-Bold').fontSize(26)
      .text('INVOICE', 50, 63, { width: W - 10, align: 'right', lineBreak: false });

    // ── Invoice meta ─────────────────────────────────────────────────────────
    let y = 142;

    doc.fillColor('#999999').font('Helvetica').fontSize(8)
      .text('INVOICE #', 50, y)
      .text('DATE', 230, y)
      .text('PAYMENT STATUS', 400, y);

    y += 13;
    doc.fillColor('#111111').font('Helvetica-Bold').fontSize(10)
      .text(invoiceNumber, 50, y)
      .text(completionDate, 230, y)
      .text(fields['Payment Status'] || 'Unpaid', 400, y);

    // ── Divider ───────────────────────────────────────────────────────────────
    y += 22;
    doc.moveTo(50, y).lineTo(562, y).strokeColor('#e0e0e0').lineWidth(0.5).stroke();

    // ── Bill To / Vehicle ─────────────────────────────────────────────────────
    y += 14;
    doc.fillColor('#999999').font('Helvetica').fontSize(8)
      .text('BILL TO', 50, y)
      .text('VEHICLE', 310, y);

    y += 13;
    doc.fillColor('#111111').font('Helvetica-Bold').fontSize(11)
      .text(fields['Name'] || '', 50, y, { width: 250 })
      .text(vehicle, 310, y, { width: 250 });

    y += 16;
    doc.font('Helvetica').fontSize(9).fillColor('#555555');
    if (fields['Email']) { doc.text(fields['Email'], 50, y); y += 13; }
    if (fields['Phone']) { doc.text(fields['Phone'], 50, y); y += 13; }

    // ── Divider ───────────────────────────────────────────────────────────────
    y += 8;
    doc.moveTo(50, y).lineTo(562, y).strokeColor('#e0e0e0').lineWidth(0.5).stroke();

    // ── Service table header ──────────────────────────────────────────────────
    y += 1;
    doc.rect(50, y, W, 22).fill('#f5f5f5');
    doc.fillColor('#333333').font('Helvetica-Bold').fontSize(9)
      .text('DESCRIPTION', 60, y + 7, { lineBreak: false })
      .text('AMOUNT', 562, y + 7, { width: 60, align: 'right', lineBreak: false });

    y += 23;

    // ── Service row ───────────────────────────────────────────────────────────
    const descParts = [
      fields['Service Requested'] ? `Service: ${fields['Service Requested']}` : 'Vehicle Protection Service',
      fields['Coverage Details'] ? `Notes: ${fields['Coverage Details']}` : null,
      fields['Film Brand'] ? `Film Brand: ${fields['Film Brand']}` : null,
      fields['Warranty Length'] ? `Warranty: ${fields['Warranty Length']}` : null,
    ].filter(Boolean);

    const descText = descParts.join('\n');
    const descTextHeight = doc.heightOfString(descText, { width: W - 100, lineGap: 3 });

    doc.fillColor('#111111').font('Helvetica').fontSize(10)
      .text(descText, 60, y + 6, { width: W - 100, lineGap: 3 });

    doc.font('Helvetica-Bold').fontSize(10)
      .text(priceStr, 562, y + 6, { width: 60, align: 'right', lineBreak: false });

    y += Math.max(descTextHeight, 20) + 16;

    // ── Total ─────────────────────────────────────────────────────────────────
    doc.moveTo(50, y).lineTo(562, y).strokeColor('#e0e0e0').lineWidth(0.5).stroke();
    y += 10;
    doc.fillColor('#111111').font('Helvetica-Bold').fontSize(12)
      .text('TOTAL', 50, y, { width: W - 70, align: 'right', lineBreak: false })
      .text(priceStr, 562, y, { width: 60, align: 'right', lineBreak: false });

    if (fields['Payment Method']) {
      y += 18;
      doc.font('Helvetica').fontSize(9).fillColor('#888888')
        .text(`Payment method: ${fields['Payment Method']}`, 50, y, { width: W, align: 'right' });
    }

    // ── Footer ────────────────────────────────────────────────────────────────
    const footerY = 700;
    doc.moveTo(50, footerY).lineTo(562, footerY).strokeColor('#e0e0e0').lineWidth(0.5).stroke();
    doc.font('Helvetica').fontSize(8.5).fillColor('#999999')
      .text(
        'Thank you for choosing ClearEdge Protective Films — we appreciate your business.',
        50, footerY + 10, { align: 'center', width: W }
      )
      .text(
        `Questions? Call ${BUSINESS.phone} or email ${BUSINESS.email}`,
        50, footerY + 23, { align: 'center', width: W }
      )
      .text(
        'Care guide and warranty details at clearedgeppf.com',
        50, footerY + 36, { align: 'center', width: W }
      );

    doc.end();
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Verify webhook secret
  if (event.headers['x-webhook-secret'] !== process.env.WEBHOOK_SECRET) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { recordId } = body;
  if (!recordId) {
    return { statusCode: 400, body: 'Missing recordId' };
  }

  try {
    const record = await fetchRecord(recordId);
    const fields = record.fields;

    // Guard against duplicate sends
    if (fields['Invoice Sent']) {
      console.log('Invoice already sent for record', recordId, '— skipping');
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true, skipped: true }),
      };
    }

    const customerEmail = fields['Email'];
    if (!customerEmail) {
      console.error('No customer email on record', recordId);
      return { statusCode: 422, body: 'No customer email on record' };
    }

    const invoiceNumber = makeInvoiceNumber(fields['Completion Date']);
    const pdfBuffer = await buildPDF(fields, invoiceNumber);

    const customerName = fields['Name'] || 'Valued Customer';
    const vehicle =
      [fields['Vehicle Year'], fields['Vehicle Make'], fields['Vehicle Model']]
        .filter(Boolean)
        .join(' ') || 'your vehicle';

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.INVOICE_FROM_EMAIL || `invoices@${BUSINESS.website}`,
      to: customerEmail,
      subject: `Invoice from ClearEdge Protective Films — ${vehicle}`,
      html: `
        <p>Hi ${customerName},</p>
        <p>Thank you for choosing ClearEdge Protective Films! Please find your invoice attached.</p>
        <p>If you have any questions about your service or warranty, don't hesitate to reach out.</p>
        <p>
          <strong>Phone:</strong> ${BUSINESS.phone}<br>
          <strong>Email:</strong> ${BUSINESS.email}
        </p>
        <p>We hope to see you again for any future protection needs!</p>
        <p>— The ClearEdge Team</p>
      `,
      attachments: [
        {
          filename: `${invoiceNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    await markInvoiceSent(recordId);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, invoiceNumber }),
    };
  } catch (err) {
    console.error('generate-invoice error:', err);
    return { statusCode: 500, body: `Internal error: ${err.message}` };
  }
};
