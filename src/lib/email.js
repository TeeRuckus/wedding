import emailjs from '@emailjs/browser';
import { supabase } from './supabase';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'tawanakwaramba@gmail.com';

/**
 * Converts a base64 data URL to a File object for uploading.
 */
function base64ToFile(base64, filename) {
  const [header, data] = base64.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const bytes = atob(data);
  const buffer = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    buffer[i] = bytes.charCodeAt(i);
  }
  return new File([buffer], filename, { type: mime });
}

/**
 * Returns the current Perth time as a formatted string.
 */
function getPerthTimestamp() {
  return new Date().toLocaleString('en-AU', {
    timeZone: 'Australia/Perth',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/**
 * Uploads a base64 photo to a PRIVATE Supabase Storage bucket
 * and returns a signed URL that expires after 24 hours.
 */
async function uploadPhoto(base64) {
  if (!base64) return null;

  const SIGNED_URL_EXPIRY = 60 * 60 * 24; // 24 hours

  try {
    const timestamp = Date.now();
    const filename = `failed-attempt-${timestamp}.jpg`;
    const file = base64ToFile(base64, filename);

    const { error } = await supabase.storage
      .from('guest-photos')
      .upload(filename, file, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('Photo upload error:', error);
      return null;
    }

    const { data: signedData, error: signError } = await supabase.storage
      .from('guest-photos')
      .createSignedUrl(filename, SIGNED_URL_EXPIRY);

    if (signError) {
      console.error('Signed URL error:', signError);
      return null;
    }

    return signedData?.signedUrl || null;
  } catch (err) {
    console.error('Photo upload failed:', err);
    return null;
  }
}


/**
 * Email 1 — Sent immediately when a guest fails 3 times.
 * Contains the three attempted names. No photo.
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
    has_photo: 'false',
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
 * Uploads to private storage, includes signed URL + embedded image.
 * Also includes the three attempts for full context.
 */
export async function sendPhotoFollowUp({ photoBase64, attempts }) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.error('EmailJS environment variables are not configured.');
    return false;
  }

  const photoUrl = await uploadPhoto(photoBase64);

  if (!photoUrl) {
    console.error('Photo upload failed — email not sent.');
    return false;
  }

  const firstAttempt = (attempts && attempts[0]) || 'Unknown';

  const templateParams = {
    to_email: ADMIN_EMAIL,
    subject: `[${firstAttempt}] Guest Photo — Follow Up`,
    attempt_1: (attempts && attempts[0]) || 'N/A',
    attempt_2: (attempts && attempts[1]) || 'N/A',
    attempt_3: (attempts && attempts[2]) || 'N/A',
    has_photo: 'true',
    photo_url: photoUrl,
    message: 'The guest has taken a photo. The image link below expires in 24 hours.',
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
