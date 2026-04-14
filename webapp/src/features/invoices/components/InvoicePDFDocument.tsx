import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { brand } from "@/config/brand";
import { appDateOnlyLocale } from "@/lib/locale-shared";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  header: { marginBottom: 24 },
  brand: { fontSize: 18, color: "#1B4F8A", marginBottom: 4 },
  h1: { fontSize: 14, marginBottom: 12 },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 100, color: "#666" },
  table: { marginTop: 16, borderWidth: 1, borderColor: "#ddd" },
  th: {
    flexDirection: "row",
    backgroundColor: "#f0f4f8",
    padding: 6,
    fontWeight: "bold",
  },
  tr: { flexDirection: "row", padding: 6, borderTopWidth: 1, borderColor: "#eee" },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: "right" },
  totals: { marginTop: 16, alignSelf: "flex-end", width: 200 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#888" },
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
  const dateStr = new Date(issuedAt).toLocaleDateString(appDateOnlyLocale);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>{brand.invoiceBrandHeader}</Text>
          <Text>{brand.issuerLocation}</Text>
        </View>
        <Text style={styles.h1}>
          {brand.labels.invoiceSingular} {invoiceNumber}
        </Text>

        <View style={styles.row}>
          <Text style={styles.label}>{brand.labels.invoiceTableDate}</Text>
          <Text>{dateStr}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{brand.labels.clientSingular}</Text>
          <Text>
            {guestName}
            {guestEmail ? ` · ${guestEmail}` : ""}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{brand.labels.staffSingular}</Text>
          <Text>{teacherName ?? brand.labels.uiEmDash}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.th}>
            <Text style={styles.col1}>
              {brand.labels.invoicePdfDescription}
            </Text>
            <Text style={styles.col2}>
              {brand.labels.invoicePdfAmountChf}
            </Text>
          </View>
          <View style={styles.tr}>
            <Text style={styles.col1}>
              {courseName} — {bookingDate}
            </Text>
            <Text style={styles.col2}>{amountBrutto}</Text>
          </View>
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>{brand.labels.invoicePdfNet}</Text>
            <Text>{netCHF}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>
              {brand.labels.invoicePdfVatTemplate.replace(
                "{percent}",
                vatPercent
              )}
            </Text>
            <Text>{vatCHF}</Text>
          </View>
          <View style={[styles.totalRow, { fontWeight: "bold", marginTop: 6 }]}>
            <Text>{brand.labels.invoicePdfTotalChf}</Text>
            <Text>{amountBrutto}</Text>
          </View>
        </View>

        {(bankName || bankIban) ? (
          <View style={{ marginTop: 40 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 6 }}>
              {brand.labels.invoicePdfPaymentInfo}
            </Text>
            {bankName ? <Text>{bankName}</Text> : null}
            {bankIban ? (
              <Text>
                {brand.labels.invoicePdfIbanPrefix} {bankIban}
              </Text>
            ) : null}
            {bankAddress ? <Text>{bankAddress}</Text> : null}
          </View>
        ) : null}

        <Text style={styles.footer}>
          {brand.invoiceFooterBase} · {brand.labels.invoiceSingular}{" "}
          {invoiceNumber}
        </Text>
      </Page>
    </Document>
  );
}
