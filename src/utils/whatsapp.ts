import { Complaint, DispatchSettings, OfficialContact } from '../types';
import { CATEGORY_LABELS } from '../data/initialComplaints';

/**
 * Formats a complaint into a clean, authoritative Arabic message for WhatsApp
 * strictly following the exact form order
 */
export function formatComplaintForWhatsApp(complaint: Complaint, officialRole?: string): string {
  const catLabel = CATEGORY_LABELS[complaint.category]?.label || 'شكوى عامة';
  const appOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const complaintLink = `${appOrigin}/?ticket=${complaint.ticketNumber}`;

  // Build full public media URL if image or video is attached
  let mediaText = '';
  if (complaint.videoUrl) {
    const fullVideoUrl = complaint.videoUrl.startsWith('http')
      ? complaint.videoUrl
      : `${appOrigin}${complaint.videoUrl.startsWith('/') ? '' : '/'}${complaint.videoUrl}`;
    mediaText = `\n*🎥 رابط فيديو المشكلة:* \n${fullVideoUrl}\n`;
  } else if (complaint.imageUrl) {
    const fullImgUrl = complaint.imageUrl.startsWith('http')
      ? complaint.imageUrl
      : `${appOrigin}${complaint.imageUrl.startsWith('/') ? '' : '/'}${complaint.imageUrl}`;
    mediaText = `\n*📸 رابط صورة المشكلة:* \n${fullImgUrl}\n`;
  }

  const groupInvite = 'https://chat.whatsapp.com/BZBRGdkAmv5FUYMP5TdXJN';

  return `*📢 بلاغ جديد عبر ملتقى شباب بشتيل*
━━━━━━━━━━━━━━━━━━
*1️⃣ الاسم (اسم صاحب الشكوى):* ${complaint.authorName}
*2️⃣ نوع الشكوى:* ${catLabel}
*3️⃣ عنوان الشكوى:* ${complaint.title}
*4️⃣ العنوان بالتفصيل (علامة مميزة):*
${complaint.detailedAddress}

*5️⃣ الشكوى بالتفصيل:*
${complaint.details}

*6️⃣ رقم الهاتف للتواصل:* ${complaint.phone ? complaint.phone : 'غير مسجل'}
━━━━━━━━━━━━━━━━━━${mediaText}
${officialRole ? `*🎯 الجهة الموجه إليها البلاغ:* ${officialRole}\n` : ''}*🆔 كود البلاغ على المنصة:* #${complaint.ticketNumber}
*⏰ وقت وتاريخ التسجيل:* ${new Date(complaint.createdAt).toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}

*🔗 رابط متابعة وتحديث البلاغ على الموقع:*
${complaintLink}

*👥 رابط جروب ملتقى شباب بشتيل على الواتساب:*
${groupInvite}

_ملتقى شباب بشتيل - صوت أهالي وشباب بشتيل_`;
}

/**
 * Clean phone number to international format without + or spaces
 */
export function cleanPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    cleaned = '2' + cleaned;
  }
  return cleaned;
}

/**
 * Generates universal WhatsApp send URL with text PRE-FILLED
 * When opened, WhatsApp displays the entire text in the message box,
 * and the user simply selects the group / hits Send!
 */
export function getWhatsAppPreparedUrl(message: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

/**
 * Generates native whatsapp:// protocol link
 */
export function getWhatsAppNativeUrl(message: string): string {
  return `whatsapp://send?text=${encodeURIComponent(message)}`;
}

export const BASHTIL_WHATSAPP_GROUP_LINK = 'https://chat.whatsapp.com/BZBRGdkAmv5FUYMP5TdXJN?s=cl&p=a&mlu=4&ilr=4&iam=2';

/**
 * Copies the complaint text and (if available) image blob into the system clipboard
 */
export async function copyComplaintToClipboard(text: string, imageUrl?: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return false;

  let copied = false;

  // 1. Attempt rich clipboard write if image is present
  if (imageUrl && window.ClipboardItem && navigator.clipboard.write) {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      let pngBlob = blob;

      if (blob.type !== 'image/png') {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const imgPromise = new Promise<Blob | null>((resolve) => {
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            canvas.toBlob((b) => resolve(b), 'image/png');
          };
          img.onerror = () => resolve(null);
        });
        img.src = imageUrl;
        const converted = await imgPromise;
        if (converted) pngBlob = converted;
      }

      if (pngBlob && pngBlob.type === 'image/png') {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': new Blob([text], { type: 'text/plain' }),
            'image/png': pngBlob,
          }),
        ]);
        copied = true;
      }
    } catch (err) {
      console.warn('Rich clipboard item fallback to text:', err);
    }
  }

  // 2. Ensure text is copied if rich write didn't succeed
  if (!copied && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch (err) {
      console.warn('Clipboard writeText error:', err);
    }
  }

  return copied;
}

/**
 * Opens WhatsApp on the user's device with the entire message PRE-FILLED
 * Also ensures clipboard has the latest formatted text
 */
export function openWhatsAppDirect(message: string): void {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(message).catch(() => {});
  }

  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const universalUrl = getWhatsAppPreparedUrl(message);
  const nativeUrl = getWhatsAppNativeUrl(message);

  if (isMobile) {
    try {
      window.location.href = nativeUrl;
    } catch {
      window.open(universalUrl, '_blank');
    }
  } else {
    window.open(universalUrl, '_blank');
  }
}

/**
 * Copies message and image to clipboard and immediately opens the Bashtil group invite link directly
 */
export async function openBashtilGroupDirect(message: string, imageUrl?: string): Promise<void> {
  // 1. Copy text and image to clipboard
  try {
    await copyComplaintToClipboard(message, imageUrl);
  } catch (err) {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(message).catch(() => {});
    }
  }

  // 2. Open group invite link directly
  const targetUrl = BASHTIL_WHATSAPP_GROUP_LINK;
  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = targetUrl;
  } else {
    window.open(targetUrl, '_blank');
  }
}

/**
 * Directly redirects the current browser tab to the Bashtil WhatsApp Group link
 */
export function redirectToWhatsAppGroup(): void {
  window.location.href = BASHTIL_WHATSAPP_GROUP_LINK;
}

/**
 * Directly opens the Bashtil Youth Forum WhatsApp Group in new tab/app
 */
export function openWhatsAppGroup(): void {
  window.open(BASHTIL_WHATSAPP_GROUP_LINK, '_blank');
}

/**
 * Generates direct wa.me link for a specific official
 */
export function getDirectWhatsAppUrl(phoneNumber: string, message: string): string {
  const clean = cleanPhoneNumber(phoneNumber);
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates WhatsApp share link for group or contact selector
 */
export function getWhatsAppShareUrl(message: string): string {
  return getWhatsAppPreparedUrl(message);
}

/**
 * Determines which official is the primary responder for this category
 */
export function getPrimaryOfficial(category: Complaint['category'], settings: DispatchSettings): OfficialContact {
  switch (category) {
    case 'garbage':
      return settings.officials.garbage;
    case 'water':
      return settings.officials.water;
    case 'roads':
    case 'electricity':
    case 'encroachments':
    case 'other':
    default:
      return settings.officials.municipality;
  }
}
