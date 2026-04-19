import { brand } from "@/config/brand";
import { escapeHtml } from "@/lib/mail/transactional-booking";

/**
 * Marketing-Newsletter: auffälliges, responsives Grundgerüst + Admin-HTML im Content-Bereich.
 */
export function wrapNewsletterHtml(innerHtml: string, guestName: string): string {
  const site = escapeHtml(brand.siteName);
  const greet = escapeHtml(guestName);
  const footerNote = escapeHtml(
    brand.labels.newsletterFooterOptInNote.replace("{siteName}", brand.siteName)
  );
  const preheader = escapeHtml(
    brand.labels.newsletterPreheaderDefault.replace("{siteName}", brand.siteName)
  );
  return `<!DOCTYPE html>
<html lang="${brand.htmlLang}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${site}</title>
<style>
  body { margin:0; background:#0c1f3a; font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif; }
  .wrap { max-width:640px; margin:0 auto; padding:24px 16px 48px; }
  .card {
    border-radius:20px; overflow:hidden;
    box-shadow:0 24px 60px rgba(0,40,100,.35);
    background:linear-gradient(145deg,#ffffff 0%,#f0f6ff 100%);
  }
  .hero {
    padding:28px 24px 20px;
    background:linear-gradient(120deg,#1B4F8A 0%,#4A7EC7 45%,#0c1f3a 100%);
    color:#fff;
  }
  .hero h1 { margin:0; font-size:22px; letter-spacing:-0.02em; font-weight:700; }
  .hero p { margin:10px 0 0; opacity:.9; font-size:14px; }
  .content { padding:24px; color:#1A1A2E; font-size:15px; line-height:1.55; }
  .content h2 { font-size:18px; margin:0 0 12px; color:#1B4F8A; }
  .footer { padding:16px 24px 22px; font-size:12px; color:#6B7280; background:#f7f9fc; border-top:1px solid rgba(27,79,138,.12); }
  .preheader { display:none!important; visibility:hidden; opacity:0; height:0; width:0; }
  a { color:#1B4F8A; }
</style>
</head>
<body>
<span class="preheader">${preheader}</span>
<div class="wrap">
  <div class="card">
    <div class="hero">
      <h1>${site}</h1>
      <p>${escapeHtml(brand.labels.newsletterHeroLead)}</p>
    </div>
    <div class="content">
      <p style="margin-top:0"><strong>${escapeHtml(brand.labels.newsletterGreetingHello)} ${greet}</strong></p>
      ${innerHtml}
    </div>
    <div class="footer">${footerNote}</div>
  </div>
</div>
</body>
</html>`;
}
