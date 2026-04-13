/** Magic-Link-Mail (inhaltlich angelehnt an @auth/core, ohne nicht exportiertes Subpath-Import). */

import { brand } from "@/config/brand";

type MailTheme = { brandColor?: string; buttonText?: string };

export function magicLinkHtml(params: {
  url: string;
  host: string;
  theme?: MailTheme;
}): string {
  const { url, host, theme } = params;
  const escapedHost = host.replace(/\./g, "&#8203;.");
  const heading = brand.labels.emailMagicLinkHeadingTemplate.replace(
    "{host}",
    `<strong>${escapedHost}</strong>`
  );
  const buttonLabel = brand.labels.emailMagicLinkButton;
  const disclaimer = brand.labels.emailMagicLinkDisclaimer;
  const brandColor = theme?.brandColor ?? "#346df1";
  const buttonText = theme?.buttonText ?? "#fff";
  const color = {
    background: "#f9f9f9",
    text: "#444",
    mainBackground: "#fff",
    buttonBackground: brandColor,
    buttonBorder: brandColor,
    buttonText,
  };
  return `
<body style="background: ${color.background};">
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        ${heading}
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                target="_blank"
                style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">${buttonLabel}</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        ${disclaimer}
      </td>
    </tr>
  </table>
</body>
`;
}

export function magicLinkText(params: { url: string; host: string }): string {
  const line = brand.labels.emailMagicLinkTextIntroTemplate.replace(
    "{host}",
    params.host
  );
  return `${line}\n${params.url}\n\n`;
}
