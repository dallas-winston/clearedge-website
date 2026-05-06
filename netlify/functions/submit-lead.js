const SERVICE_MAP = {
  'ppf-partial': 'Partial (High-Impact Areas)',
  'ppf-full-front': 'Full Front',
  'ppf-full-front-lower-sides': 'Custom',
  'ppf-full-body': 'Full Body',
  'ceramic': 'Other',
  'tint': 'Other',
  'ppf-ceramic': 'Custom',
  'ppf-tint': 'Custom',
  'full-package': 'Custom',
  'not-sure': 'Other',
};

// Human-readable labels for services that map to "Custom" or "Other" in Airtable,
// so the actual selection is preserved in Coverage Details.
const SERVICE_LABEL = {
  'ppf-full-front-lower-sides': 'PPF — Full Front + Lower Sides',
  'ceramic': 'Ceramic Coating',
  'tint': 'Window Tint',
  'ppf-ceramic': 'PPF + Ceramic Coating (bundle)',
  'ppf-tint': 'PPF + Window Tint (bundle)',
  'full-package': 'Full Package (PPF + Ceramic + Tint)',
  'not-sure': 'Not sure — needs guidance',
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME = 'Leads' } = process.env;

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.error('Missing Airtable env vars');
    return { statusCode: 500, body: 'Configuration error' };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const name =
    body.name ||
    [body.firstName, body.lastName].filter(Boolean).join(' ').trim() ||
    'Unknown';

  const serviceKey = body.service || body.services || '';
  const serviceRequested = SERVICE_MAP[serviceKey] || 'Other';

  // Preserve the full service label and any message in Coverage Details
  const coverageParts = [];
  if (SERVICE_LABEL[serviceKey]) coverageParts.push(`Service: ${SERVICE_LABEL[serviceKey]}`);
  if (body.message) coverageParts.push(body.message);
  const coverageDetails = coverageParts.join('\n').trim();

  const fields = {
    'Name': name,
    'Email': body.email || '',
    'Phone': body.phone || '',
    'Vehicle Year': body.vehicleYear || '',
    'Vehicle Make': body.vehicleMake || '',
    'Vehicle Model': body.vehicleModel || '',
    'Service Requested': serviceRequested,
    'Coverage Details': coverageDetails,
    'Status': 'New',
    'Lead Source': body.leadSource || 'Website Form',
  };

  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records: [{ fields }] }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error('Airtable API error:', res.status, text);
      return { statusCode: 502, body: 'Airtable error' };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error('submit-lead error:', err);
    return { statusCode: 500, body: 'Internal error' };
  }
};
