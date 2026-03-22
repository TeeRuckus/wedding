import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'tawanakwaramba@gmail.com';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Converts a base64 data URL to a Blob.
 */
function base64ToBlob(base64) {
  const [header, data] = base64.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const bytes = atob(data);
  const buffer = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    buffer[i] = bytes.charCodeAt(i);
  }
  return new Blob([buffer], { type: mime });
}

function getPerthTimestamp() {
  return new Date().toLocaleString('en-AU', {
    timeZone: 'Australia/Perth',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/**
 * Uploads a photo using raw fetch and generates a signed URL using raw fetch.
 * The Supabase JS client is completely bypassed for ALL storage operations.
 *
 * @param {string} base64 - data:image/jpeg;base64,... string
 * @returns {Promise<string|null>} Signed URL (24h) or null
 */
async function uploadPhoto(base64) {
  if (!base64) return null;

  try {
    const timestamp = Date.now();
    const filename = `failed-attempt-${timestamp}.jpg`;
    const blob = base64ToBlob(base64);

    // Step 1: Upload via raw fetch
    const uploadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/guest-photos/${filename}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'image/jpeg',
        },
        body: blob,
      }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error('Photo upload error:', uploadRes.status, errText);
      return null;
    }

    // Step 2: Create signed URL via raw fetch (JS client is broken for this too)
    const signRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/sign/guest-photos/${filename}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expiresIn: 60 * 60 * 24 }), // 24 hours
      }
    );

    if (!signRes.ok) {
      const errText = await signRes.text();
      console.error('Signed URL error:', signRes.status, errText);
      // Fallback: return the direct public-ish URL (still requires auth header to view)
      return null;
    }

    const signData = await signRes.json();
    // signData.signedURL is the path — prepend the Supabase URL
    const signedUrl = signData.signedURL
      ? `${SUPABASE_URL}/storage/v1${signData.signedURL}`
      : null;

    return signedUrl;
  } catch (err) {
    console.error('Photo upload failed:', err);
    return null;
  }
}


/**
 * Email 1 — Sent immediately when a guest fails 3 times.
 */
export async function sendFailedAttemptEmail({ attempts }) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.error('EmailJS environment variables are not configured.');
    return false;
  }

  const firstAttempt = attempts[0] || 'Unknown';

  const templateParams = {
    to_email: ADMIN_EMAIL,
    subject: `[${firstAttempt}] Guest Needs Assistance`,
    attempt_1: attempts[0] || 'N/A',
    attempt_2: attempts[1] || 'N/A',
    attempt_3: attempts[2] || 'N/A',
    photo_url: '',
    message: 'Guest has been asked to take a photo — a follow-up email may arrive shortly.',
    timestamp: getPerthTimestamp(),
  };

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    return true;
  } catch (error) {
    console.error('Failed to send attempt email:', error);
    return false;
  }
}


/**
 * Email 2 — Sent only if the guest takes a photo.
 * Uploads via raw fetch, gets signed URL via raw fetch.
 */
export async function sendPhotoFollowUp({ photoBase64, attempts }) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.error('EmailJS environment variables are not configured.');
    return false;
  }

  const photoUrl = await uploadPhoto(photoBase64);

  if (!photoUrl) {
    console.error('Photo upload failed — sending email without photo.');
  }

  const firstAttempt = (attempts && attempts[0]) || 'Unknown';

  const templateParams = {
    to_email: ADMIN_EMAIL,
    subject: `[${firstAttempt}] Guest Photo — Follow Up`,
    attempt_1: (attempts && attempts[0]) || 'N/A',
    attempt_2: (attempts && attempts[1]) || 'N/A',
    attempt_3: (attempts && attempts[2]) || 'N/A',
    photo_url: photoUrl || '',
    message: photoUrl
      ? 'The guest has taken a photo. The image link below expires in 24 hours.'
      : 'The guest attempted to take a photo but the upload failed. Please find them near the entrance.',
    timestamp: getPerthTimestamp(),
  };

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    return true;
  } catch (error) {
    console.error('Failed to send photo email:', error);
    return false;
  }
}
