import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { brand } from "@/config/brand";
import {
  LI_PAYROLL_MERKBLATT_PDF_URL,
  LI_WITHHOLDING_TAX_PCT,
} from "@/services/payroll-li.shared";
import type { PayrollMonthReportDto } from "@/services/payroll-li.shared";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 9, fontFamily: "Helvetica" },
  brand: { fontSize: 16, color: "#305f9b", marginBottom: 4 },
  h1: { fontSize: 12, marginBottom: 10 },
  muted: { fontSize: 8, color: "#666", marginBottom: 12 },
  row: { flexDirection: "row", marginBottom: 3 },
  label: { width: 140, color: "#555" },
  table: { marginTop: 10, borderWidth: 1, borderColor: "#ddd" },
  tr: { flexDirection: "row", padding: 5, borderTopWidth: 1, borderColor: "#eee" },
  th: { flexDirection: "row", padding: 5, backgroundColor: "#f0f4f8", fontWeight: "bold" },
  colL: { flex: 2 },
  colR: { flex: 1, textAlign: "right" },
  sub: { fontSize: 8, color: "#555", paddingLeft: 8 },
  foot: { marginTop: 16, fontSize: 7, color: "#888" },
});

function whtMethodLabel(
  m: "manual" | "ytd_plus_current" | "times12"
): string {
  if (m === "manual") return brand.labels.payrollWhtMethodManual;
  if (m === "ytd_plus_current") return brand.labels.payrollWhtMethodYtd;
  return brand.labels.payrollWhtMethodTimes12;
}

export function PayrollSlipPDFDocument({ report }: { report: PayrollMonthReportDto }) {
  const { hours, computation, snapshot } = report;
  if (!computation) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>{brand.labels.payrollPdfNoComputation}</Text>
        </Page>
      </Document>
    );
  }

  const name = hours.teacher.name ?? hours.teacher.email;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Text style={styles.h1}>{brand.labels.payrollPdfTitle}</Text>
        <Text style={styles.muted}>
          {computation.ratesVersionLabel} · {brand.labels.payrollPdfNotAdvice}
        </Text>

        {snapshot ? (
          <Text style={[styles.muted, { marginBottom: 8 }]}>
            {brand.labels.payrollPdfSnapshotNote}: {snapshot.finalizedAt.slice(0, 10)}
          </Text>
        ) : null}

        <View style={styles.row}>
          <Text style={styles.label}>{brand.labels.labelName}</Text>
          <Text>{name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{brand.labels.labelEmail}</Text>
          <Text>{hours.teacher.email}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{brand.labels.monthlyHoursMonthLabel}</Text>
          <Text>{hours.month}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.th}>
            <Text style={styles.colL}>{brand.labels.payrollPdfSectionHours}</Text>
            <Text style={styles.colR}>h / CHF</Text>
          </View>
          <View style={styles.tr}>
            <Text style={styles.colL}>
              {brand.labels.monthlyHoursProductive} ({computation.hourlyRateProductive}{" "}
              CHF/h)
            </Text>
            <Text style={styles.colR}>{computation.productiveDecimalHours}</Text>
          </View>
          <View style={styles.tr}>
            <Text style={styles.colL}>
              {brand.labels.monthlyHoursInternalTotal} ({computation.hourlyRateInternal}{" "}
              CHF/h)
            </Text>
            <Text style={styles.colR}>{computation.internalDecimalHours}</Text>
          </View>
          <View style={styles.tr}>
            <Text style={styles.colL}>{brand.labels.payrollPdfGrossProductive}</Text>
            <Text style={styles.colR}>{computation.grossProductiveChf}</Text>
          </View>
          <View style={styles.tr}>
            <Text style={styles.colL}>{brand.labels.payrollPdfGrossInternal}</Text>
            <Text style={styles.colR}>{computation.grossInternalChf}</Text>
          </View>
          <View style={styles.tr}>
            <Text style={[styles.colL, { fontWeight: "bold" }]}>
              {brand.labels.monthlyHoursTotalWorked}
            </Text>
            <Text style={[styles.colR, { fontWeight: "bold" }]}>
              {computation.totalDecimalHours}
            </Text>
          </View>
        </View>

        <View style={[styles.table, { marginTop: 12 }]}>
          <View style={styles.th}>
            <Text style={styles.colL}>{brand.labels.payrollPdfSectionEmployee}</Text>
            <Text style={styles.colR}>CHF</Text>
          </View>
          <View style={styles.tr}>
            <Text style={styles.colL}>{brand.labels.payrollRowGross}</Text>
            <Text style={styles.colR}>{computation.grossChf}</Text>
          </View>
          {computation.employeeSocialBreakdown.map((line) => (
            <View key={line.key} style={styles.tr}>
              <Text style={[styles.colL, styles.sub]}>
                {line.labelDe} ({line.pct}%)
              </Text>
              <Text style={styles.colR}>-{line.chf}</Text>
            </View>
          ))}
          <View style={styles.tr}>
            <Text style={[styles.colL, { fontWeight: "bold" }]}>
              {brand.labels.payrollRowEmployeeSocial} ({computation.employeeSocialPct}%)
            </Text>
            <Text style={[styles.colR, { fontWeight: "bold" }]}>
              -{computation.employeeSocialChf}
            </Text>
          </View>
          <View style={styles.tr}>
            <Text style={styles.colL}>
              {brand.labels.payrollPdfWhtBasis} ({whtMethodLabel(computation.whtAnnualBasisMethod)}
              ): {computation.whtAnnualBasisChf}
            </Text>
            <Text style={styles.colR}> </Text>
          </View>
          <View style={styles.tr}>
            <Text style={styles.colL}>
              {brand.labels.payrollRowWht}{" "}
              {computation.withholdingTaxApplied
                ? `(${LI_WITHHOLDING_TAX_PCT} %)`
                : `(${brand.labels.payrollWhtNotApplied})`}
            </Text>
            <Text style={styles.colR}>-{computation.withholdingTaxChf}</Text>
          </View>
          <View style={styles.tr}>
            <Text style={[styles.colL, { fontWeight: "bold" }]}>
              {brand.labels.payrollRowNetApprox}
            </Text>
            <Text style={[styles.colR, { fontWeight: "bold" }]}>
              {computation.netPayoutApproxChf}
            </Text>
          </View>
        </View>

        <View style={[styles.table, { marginTop: 12 }]}>
          <View style={styles.th}>
            <Text style={styles.colL}>{brand.labels.payrollPdfSectionEmployer}</Text>
            <Text style={styles.colR}>CHF</Text>
          </View>
          {computation.employerSocialBreakdown.map((line) => (
            <View key={line.key} style={styles.tr}>
              <Text style={[styles.colL, styles.sub]}>
                {line.labelDe} ({line.pct}%)
              </Text>
              <Text style={styles.colR}>{line.chf}</Text>
            </View>
          ))}
          <View style={styles.tr}>
            <Text style={[styles.colL, { fontWeight: "bold" }]}>
              {brand.labels.payrollRowEmployerSocial} ({computation.employerSocialPct}%)
            </Text>
            <Text style={[styles.colR, { fontWeight: "bold" }]}>
              {computation.employerSocialChf}
            </Text>
          </View>
          <View style={styles.tr}>
            <Text style={styles.colL}>{brand.labels.payrollRowKvgEmployerMonth}</Text>
            <Text style={styles.colR}>{computation.employerKvgMonthlyChf}</Text>
          </View>
        </View>

        <Text style={styles.foot}>
          {brand.labels.payrollPdfFooterMerkblatt}: {LI_PAYROLL_MERKBLATT_PDF_URL}
        </Text>
        <Text style={styles.foot}>{brand.labels.payrollPdfFooterObligations}</Text>
      </Page>
    </Document>
  );
}
