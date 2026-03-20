import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

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
  const dateStr = new Date(issuedAt).toLocaleDateString("de-LI");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>skicoach.li</Text>
          <Text>Liechtenstein</Text>
        </View>
        <Text style={styles.h1}>Rechnung {invoiceNumber}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Datum</Text>
          <Text>{dateStr}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Gast</Text>
          <Text>
            {guestName}
            {guestEmail ? ` · ${guestEmail}` : ""}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Lehrkraft</Text>
          <Text>{teacherName ?? "—"}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.th}>
            <Text style={styles.col1}>Beschreibung</Text>
            <Text style={styles.col2}>Betrag CHF</Text>
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
            <Text>Netto</Text>
            <Text>{netCHF}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>MwSt. {vatPercent}%</Text>
            <Text>{vatCHF}</Text>
          </View>
          <View style={[styles.totalRow, { fontWeight: "bold", marginTop: 6 }]}>
            <Text>Total CHF</Text>
            <Text>{amountBrutto}</Text>
          </View>
        </View>

        {(bankName || bankIban) ? (
          <View style={{ marginTop: 40 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 6 }}>Zahlungsinformationen</Text>
            {bankName ? <Text>{bankName}</Text> : null}
            {bankIban ? <Text>IBAN: {bankIban}</Text> : null}
            {bankAddress ? <Text>{bankAddress}</Text> : null}
          </View>
        ) : null}

        <Text style={styles.footer}>
          skicoach.li · Liechtenstein · Rechnung {invoiceNumber}
        </Text>
      </Page>
    </Document>
  );
}
