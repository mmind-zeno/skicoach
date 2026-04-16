import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { brand } from "@/config/brand";
import { appDateOnlyLocale } from "@/lib/locale-shared";

/** Ascent-Primärfarbe — konsistent mit `globals.css` Pilot. */
const ACCENT = "#0058bc";
const ACCENT_SOFT = "#e8f1fc";
const INK = "#191c1e";
const INK_MUTED = "#5c6370";

function formatChfAmount(raw: string): string {
  const n = Number.parseFloat(raw);
  if (Number.isNaN(n)) return raw;
  const [intPart, dec] = n.toFixed(2).split(".");
  const withSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return `${withSep}.${dec}`;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingHorizontal: 0,
    paddingBottom: 48,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: INK,
  },
  headerBand: {
    backgroundColor: ACCENT,
    paddingTop: 22,
    paddingBottom: 20,
    paddingHorizontal: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { flex: 1, paddingRight: 16 },
  headerSite: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    marginBottom: 3,
  },
  headerDomain: { fontSize: 8.5, color: "rgba(255,255,255,0.88)" },
  headerRight: { alignItems: "flex-end", maxWidth: 220 },
  headerKicker: {
    fontSize: 8,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  headerInvoiceNo: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  body: { paddingHorizontal: 40, paddingTop: 22 },
  addressRow: {
    flexDirection: "row",
    marginBottom: 18,
  },
  addressBlock: { flex: 1, paddingRight: 14 },
  addressLabel: {
    fontSize: 7.5,
    color: INK_MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
  },
  addressLine: { fontSize: 9, lineHeight: 1.35, marginBottom: 2 },
  recipientName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  metaStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: ACCENT_SOFT,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT,
    marginBottom: 18,
  },
  metaCol: {},
  metaLabel: { fontSize: 7.5, color: INK_MUTED, marginBottom: 2 },
  metaValue: { fontSize: 9.5, fontFamily: "Helvetica-Bold" },
  table: {
    borderWidth: 1,
    borderColor: "#d1dae6",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 14,
  },
  th: {
    flexDirection: "row",
    backgroundColor: ACCENT,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  thText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  tr: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e8edf4",
  },
  colPos: { width: 26 },
  colDesc: { flex: 1, paddingRight: 8 },
  colAmt: { width: 88, textAlign: "right" },
  tdText: { fontSize: 9, lineHeight: 1.4 },
  tdAmt: { fontSize: 9.5, fontFamily: "Helvetica-Bold", textAlign: "right" },
  totalsWrap: {
    alignSelf: "flex-end",
    width: 240,
    backgroundColor: "#f7f9fb",
    borderWidth: 1,
    borderColor: "#d1dae6",
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  totalRowFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: ACCENT,
  },
  totalLabel: { fontSize: 9, color: INK_MUTED },
  totalValue: { fontSize: 9.5, fontFamily: "Helvetica-Bold" },
  totalFinalLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
  },
  totalFinalValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
  },
  paymentBox: {
    borderWidth: 1.5,
    borderColor: "#b8cce8",
    backgroundColor: "#fafcfe",
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  paymentTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    marginBottom: 8,
  },
  paymentLine: { fontSize: 9, lineHeight: 1.45, marginBottom: 2 },
  thankYou: {
    fontSize: 9.5,
    fontStyle: "italic",
    color: ACCENT,
    marginBottom: 6,
  },
  footerNote: { fontSize: 8, color: INK_MUTED, lineHeight: 1.35 },
  footerFixed: {
    position: "absolute",
    bottom: 22,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  footerSmall: { fontSize: 7, color: "#8892a0", maxWidth: "72%" },
  footerPage: { fontSize: 7, color: "#8892a0" },
});

export function InvoicePDFDocument({
  invoiceNumber,
  issuedAt,
  guestName,
  guestEmail,
  courseName,
  bookingDate,
  teacherName,
  amountBrutto,
  netCHF,
  vatCHF,
  vatPercent,
  bankName,
  bankIban,
  bankAddress,
}: {
  invoiceNumber: string;
  issuedAt: string;
  guestName: string;
  guestEmail: string | null;
  courseName: string;
  bookingDate: string;
  teacherName: string | null;
  amountBrutto: string;
  netCHF: string;
  vatCHF: string;
  vatPercent: string;
  bankName: string;
  bankIban: string;
  bankAddress: string;
}) {
  const L = brand.labels;
  const dateStr = new Date(issuedAt).toLocaleDateString(appDateOnlyLocale);
  const issuerLines = brand.legalPostalAddress
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const bruttoFmt = formatChfAmount(amountBrutto);
  const netFmt = formatChfAmount(netCHF);
  const vatFmt = formatChfAmount(vatCHF);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBand}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerSite}>{brand.siteName}</Text>
            <Text style={styles.headerDomain}>{brand.invoiceBrandHeader}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerKicker}>{L.invoiceSingular}</Text>
            <Text style={styles.headerInvoiceNo}>{invoiceNumber}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.addressRow}>
            <View style={styles.addressBlock}>
              <Text style={styles.addressLabel}>{L.invoicePdfIssuerHeading}</Text>
              {issuerLines.map((line, i) => (
                <Text key={`iss-${i}`} style={styles.addressLine}>
                  {line}
                </Text>
              ))}
            </View>
            <View style={styles.addressBlock}>
              <Text style={styles.addressLabel}>
                {L.invoicePdfRecipientHeading}
              </Text>
              <Text style={styles.recipientName}>{guestName}</Text>
              {guestEmail ? (
                <Text style={styles.addressLine}>{guestEmail}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.metaStrip}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>{L.invoicePdfMetaDateLabel}</Text>
              <Text style={styles.metaValue}>{dateStr}</Text>
            </View>
            <View style={[styles.metaCol, { alignItems: "flex-end" }]}>
              <Text style={styles.metaLabel}>{L.invoicePdfMetaServiceLabel}</Text>
              <Text style={styles.metaValue}>{bookingDate}</Text>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.th}>
              <Text style={[styles.thText, styles.colPos]}>{L.invoicePdfTablePos}</Text>
              <Text style={[styles.thText, styles.colDesc]}>
                {L.invoicePdfDescription}
              </Text>
              <Text style={[styles.thText, styles.colAmt]}>
                {L.invoicePdfAmountChf}
              </Text>
            </View>
            <View style={styles.tr}>
              <Text style={[styles.tdText, styles.colPos]}>1</Text>
              <View style={styles.colDesc}>
                <Text style={styles.tdText}>{courseName}</Text>
                {teacherName ? (
                  <Text
                    style={[
                      styles.tdText,
                      { fontSize: 8, color: INK_MUTED, marginTop: 2 },
                    ]}
                  >
                    {L.staffSingular}: {teacherName}
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.tdAmt, styles.colAmt]}>{bruttoFmt}</Text>
            </View>
          </View>

          <View style={styles.totalsWrap}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{L.invoicePdfNet}</Text>
              <Text style={styles.totalValue}>{netFmt}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                {L.invoicePdfVatTemplate.replace("{percent}", vatPercent)}
              </Text>
              <Text style={styles.totalValue}>{vatFmt}</Text>
            </View>
            <View style={styles.totalRowFinal}>
              <Text style={styles.totalFinalLabel}>{L.invoicePdfTotalChf}</Text>
              <Text style={styles.totalFinalValue}>{bruttoFmt}</Text>
            </View>
          </View>

          {bankName || bankIban ? (
            <View style={styles.paymentBox}>
              <Text style={styles.paymentTitle}>{L.invoicePdfPaymentInfo}</Text>
              {bankName ? (
                <Text style={styles.paymentLine}>{bankName}</Text>
              ) : null}
              {bankIban ? (
                <Text style={styles.paymentLine}>
                  {L.invoicePdfIbanPrefix} {bankIban}
                </Text>
              ) : null}
              {bankAddress ? (
                <Text style={styles.paymentLine}>{bankAddress}</Text>
              ) : null}
            </View>
          ) : null}

          <Text style={styles.thankYou}>{L.invoicePdfThankYou}</Text>
          <Text style={styles.footerNote}>{L.invoicePdfFooterLegalNote}</Text>
        </View>

        <View style={styles.footerFixed} fixed>
          <View style={styles.footerRow}>
            <Text style={styles.footerSmall}>
              {brand.invoiceFooterBase} · {L.invoiceSingular} {invoiceNumber}
            </Text>
            <Text
              style={styles.footerPage}
              render={({ pageNumber, totalPages }) =>
                `${pageNumber} / ${totalPages}`
              }
            />
          </View>
        </View>
      </Page>
    </Document>
  );
}
