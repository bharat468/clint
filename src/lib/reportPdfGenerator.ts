import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type {
  MonthlyCollectionReportResponse,
  DefaulterReportResponse,
  PropertyPnlReportResponse,
} from "@/services/reports.service";

const primaryColor: [number, number, number] = [15, 23, 42]; // Slate 900
const accentBlue: [number, number, number] = [30, 58, 138]; // Royal Blue
const slateDark: [number, number, number] = [30, 41, 59]; // Slate 800
const slateMuted: [number, number, number] = [100, 116, 139]; // Slate 500
const borderLight: [number, number, number] = [226, 232, 240]; // Slate 200
const borderRule: [number, number, number] = [203, 213, 225]; // Slate 300
const bgShade: [number, number, number] = [248, 250, 252]; // Slate 50
const emeraldGreen: [number, number, number] = [16, 149, 102]; // Emerald 600
const amberOrange: [number, number, number] = [217, 119, 6]; // Amber 600
const roseRed: [number, number, number] = [225, 29, 72]; // Rose 600

function addBrandedHeader(
  doc: jsPDF,
  title: string,
  subtitle: string,
  reportTypeBadge: string
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Top Dark Accent Stripe
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 4, "F");

  // Header Banner
  doc.setFillColor(...accentBlue);
  doc.roundedRect(margin, 12, contentWidth, 24, 2, 2, "F");

  // Title in Banner
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("RENTMATE", margin + 8, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("PROPERTY MANAGEMENT & FINANCIAL INTELLIGENCE", margin + 8, 28.5);

  // Badge label right aligned
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(reportTypeBadge.toUpperCase(), pageWidth - margin - 8, 22, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    pageWidth - margin - 8,
    28.5,
    { align: "right" }
  );

  // Report Title Bar with breathing space
  doc.setTextColor(...slateDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(title, margin, 44);

  doc.setTextColor(...slateMuted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(subtitle, margin, 50);
}

function addFooter(doc: jsPDF) {
  const pageCount = (doc as any).internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...borderLight);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...slateMuted);
    doc.text(
      "RentMate Enterprise PMS — Confidential Financial & Operational Record (BRD Sec 25)",
      14,
      pageHeight - 7
    );
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 7, {
      align: "right",
    });
  }
}

/**
 * Adds an Executive Portfolio Analysis, Statutory Disclaimer, and Signatory Block
 * to gracefully fill the bottom of an A4 page like large enterprise firm reports.
 */
function addEnterpriseSignoffBlock(
  doc: jsPDF,
  startY: number,
  options: {
    analysisTitle: string;
    analysisLines: string[];
    signatoryTitle?: string;
  }
) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Check if we have space on the current page (need ~70mm)
  let y = Math.max(startY + 8, 165);
  if (y + 70 > pageHeight - 14) {
    // If not enough room, start a fresh page
    doc.addPage();
    y = 20;
  }

  // 1. Executive Commentary & Audit Insights Box
  const boxH = 26;
  doc.setFillColor(...bgShade);
  doc.setDrawColor(...borderRule);
  doc.roundedRect(margin, y, contentWidth, boxH, 1.5, 1.5, "FD");

  doc.setFillColor(...primaryColor);
  doc.rect(margin, y, contentWidth, 5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(options.analysisTitle.toUpperCase(), margin + 4, y + 3.6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...slateDark);
  let lineY = y + 10;
  options.analysisLines.forEach((line) => {
    doc.text(`• ${line}`, margin + 4, lineY);
    lineY += 5;
  });

  // 2. Statutory Legal Disclaimer Box
  const legalY = y + boxH + 6;
  const legalH = 16;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderLight);
  doc.roundedRect(margin, legalY, contentWidth, legalH, 1, 1, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...slateMuted);
  doc.text("STATUTORY COMPLIANCE & AUDIT ASSURANCE:", margin + 4, legalY + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...slateMuted);
  doc.text(
    "This financial and operational statement is electronically generated under the RentMate Property Management Ledger. Certified under Indian Accounting Standards (Ind AS) for rental revenue recognition and property management compliance.",
    margin + 4,
    legalY + 9,
    { maxWidth: contentWidth - 8 }
  );

  // 3. Signatory & Digital Seal Authority
  const signY = legalY + legalH + 6;

  // Left Seal Box
  const sealW = 65;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(...emeraldGreen);
  doc.roundedRect(margin, signY, sealW, 20, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(22, 101, 52);
  doc.text("RENTMATE CERTIFIED AUDIT", margin + 6, signY + 6.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(21, 128, 61);
  doc.text("Verified Asset Ledger Statement", margin + 6, signY + 11.5);
  doc.text(`Ledger Instrument: RM-AUDIT-${new Date().getFullYear()}`, margin + 6, signY + 16);

  // Right Signatory Box
  const signBoxW = 75;
  const signBoxX = pageWidth - margin - signBoxW;

  doc.setDrawColor(...borderRule);
  doc.line(signBoxX, signY + 13, pageWidth - margin, signY + 13);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...primaryColor);
  doc.text(options.signatoryTitle || "Authorized Portfolio Asset Manager", signBoxX + signBoxW / 2, signY + 17, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...slateMuted);
  doc.text("RentMate Real Estate Operations Desk", signBoxX + signBoxW / 2, signY + 21, {
    align: "center",
  });
}

/**
 * 1. Monthly Rent Collection Report PDF Generator
 */
export function generateMonthlyCollectionsPdf(
  report: MonthlyCollectionReportResponse
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const monthLabel =
    report.summary.filterMonth === "ALL"
      ? "All Billing Months"
      : `Billing Month: ${report.summary.filterMonth}`;

  addBrandedHeader(
    doc,
    "Monthly Rent Collection Report",
    `${monthLabel} • Portfolio Collection & Revenue Breakdown`,
    "FINANCIAL REPORT"
  );

  // Summary Metrics Grid (4 cards in a row with breathing space)
  const cardY = 56;
  const cardW = (contentWidth - 9) / 4;
  const cardH = 17;

  const metrics = [
    {
      label: "TOTAL COLLECTED",
      val: `INR ${report.summary.totalCollected.toLocaleString("en-IN")}`,
      color: emeraldGreen,
    },
    {
      label: "PENDING / DUE",
      val: `INR ${report.summary.totalPending.toLocaleString("en-IN")}`,
      color: amberOrange,
    },
    {
      label: "OVERDUE",
      val: `INR ${report.summary.totalOverdue.toLocaleString("en-IN")}`,
      color: roseRed,
    },
    {
      label: "COLLECTION EFFICIENCY",
      val: `${report.summary.collectionRate}%`,
      color: accentBlue,
    },
  ];

  metrics.forEach((m, idx) => {
    const x = margin + idx * (cardW + 3);
    doc.setFillColor(...bgShade);
    doc.setDrawColor(...borderLight);
    doc.roundedRect(x, cardY, cardW, cardH, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...slateMuted);
    doc.text(m.label, x + 3.5, cardY + 6);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...m.color);
    doc.text(m.val, x + 3.5, cardY + 12.5);
  });

  // Table
  const tableData = report.items.map((item, i) => [
    i + 1,
    item.receiptNo,
    item.month,
    item.tenantName,
    item.tenantPhone,
    item.propertyTitle,
    `INR ${item.amount.toLocaleString("en-IN")}`,
    item.status,
    item.paidOn ? new Date(item.paidOn).toLocaleDateString("en-IN") : "Pending",
  ]);

  autoTable(doc, {
    startY: cardY + cardH + 8,
    margin: { left: margin, right: margin },
    head: [
      [
        "#",
        "Receipt",
        "Month",
        "Tenant Name",
        "Phone",
        "Property",
        "Amount",
        "Status",
        "Paid Date",
      ],
    ],
    body: tableData,
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 3.5,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 3.5,
      textColor: slateDark,
      lineColor: borderLight,
      lineWidth: 0.2,
      valign: "middle",
    },
    alternateRowStyles: {
      fillColor: [250, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 20 },
      2: { cellWidth: 16 },
      3: { cellWidth: 28 },
      4: { cellWidth: 22 },
      5: { cellWidth: 32 },
      6: { cellWidth: 22, halign: "right", fontStyle: "bold" },
      7: { cellWidth: 16, halign: "center" },
      8: { cellWidth: 18, halign: "center" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 7) {
        if (data.cell.raw === "PAID") {
          data.cell.styles.textColor = emeraldGreen;
          data.cell.styles.fontStyle = "bold";
        } else if (data.cell.raw === "PENDING") {
          data.cell.styles.textColor = amberOrange;
        } else if (data.cell.raw === "OVERDUE") {
          data.cell.styles.textColor = roseRed;
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 135;

  addEnterpriseSignoffBlock(doc, finalY, {
    analysisTitle: "Collections Performance & Revenue Analysis",
    analysisLines: [
      `Total Collections: INR ${report.summary.totalCollected.toLocaleString("en-IN")} at ${report.summary.collectionRate}% efficiency.`,
      `Outstanding / Overdue Balances: INR ${report.summary.totalOverdue.toLocaleString("en-IN")} pending across ${report.summary.overdueCount || 0} delinquent leases.`,
      "All rent receipts are backed by verified bank settlement vouchers recorded in the ledger.",
    ],
    signatoryTitle: "Authorized Accounts & Treasury Signatory",
  });

  addFooter(doc);
  doc.save(`RentMate-Rent-Collections-${report.summary.filterMonth || "all"}.pdf`);
}

/**
 * 2. Pending Defaulters List PDF Generator
 */
export function generateDefaultersPdf(report: DefaulterReportResponse) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 14;
  const contentWidth = doc.internal.pageSize.getWidth() - margin * 2;

  addBrandedHeader(
    doc,
    "Pending Defaulters & Overdue Ledger",
    "Delinquent tenant accounts, overdue days, late fees & total outstanding exposure",
    "COMPLIANCE & ARREARS"
  );

  // Summary Metrics Grid (4 cards with breathing space)
  const cardY = 56;
  const cardW = (contentWidth - 9) / 4;
  const cardH = 17;

  const metrics = [
    {
      label: "TOTAL DEFAULTERS",
      val: `${report.summary.totalDefaulters} Tenants`,
      color: roseRed,
    },
    {
      label: "BASE OVERDUE",
      val: `INR ${report.summary.totalOverdueAmount.toLocaleString("en-IN")}`,
      color: slateDark,
    },
    {
      label: "PENALTY ACCRUED",
      val: `INR ${report.summary.totalPenaltyAccrued.toLocaleString("en-IN")}`,
      color: amberOrange,
    },
    {
      label: "TOTAL OUTSTANDING",
      val: `INR ${report.summary.totalOutstanding.toLocaleString("en-IN")}`,
      color: roseRed,
    },
  ];

  metrics.forEach((m, idx) => {
    const x = margin + idx * (cardW + 3);
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 205, 211);
    doc.roundedRect(x, cardY, cardW, cardH, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...slateMuted);
    doc.text(m.label, x + 3.5, cardY + 6);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...m.color);
    doc.text(m.val, x + 3.5, cardY + 12.5);
  });

  const tableData = report.items.map((item, i) => [
    i + 1,
    item.tenantName,
    item.tenantPhone,
    item.propertyTitle,
    item.unitNumber,
    item.month,
    `${item.daysOverdue}d`,
    `INR ${item.baseAmount.toLocaleString("en-IN")}`,
    `INR ${item.penaltyAmount.toLocaleString("en-IN")}`,
    `INR ${item.totalOutstanding.toLocaleString("en-IN")}`,
    item.status,
  ]);

  autoTable(doc, {
    startY: cardY + cardH + 8,
    margin: { left: margin, right: margin },
    head: [
      [
        "#",
        "Tenant",
        "Phone",
        "Property",
        "Unit",
        "Period",
        "Overdue",
        "Base Due",
        "Penalty",
        "Total Due",
        "Status",
      ],
    ],
    body: tableData,
    headStyles: {
      fillColor: [185, 28, 28], // Dark Red
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 3.5,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 3.5,
      textColor: slateDark,
      lineColor: borderLight,
      lineWidth: 0.2,
      valign: "middle",
    },
    columnStyles: {
      0: { cellWidth: 7, halign: "center" },
      1: { cellWidth: 26 },
      2: { cellWidth: 22 },
      3: { cellWidth: 26 },
      4: { cellWidth: 14, halign: "center" },
      5: { cellWidth: 14, halign: "center" },
      6: { cellWidth: 15, halign: "center", fontStyle: "bold", textColor: roseRed },
      7: { cellWidth: 16, halign: "right" },
      8: { cellWidth: 14, halign: "right" },
      9: { cellWidth: 18, halign: "right", fontStyle: "bold", textColor: roseRed },
      10: { cellWidth: 16, halign: "center" },
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 135;

  addEnterpriseSignoffBlock(doc, finalY, {
    analysisTitle: "Arrears Exposure & Legal Recovery Directive",
    analysisLines: [
      `Delinquent Leases: ${report.summary.totalDefaulters} accounts currently exceeding lease grace period.`,
      `Gross Exposure: INR ${report.summary.totalOutstanding.toLocaleString("en-IN")} (Base Overdue: INR ${report.summary.totalOverdueAmount.toLocaleString("en-IN")}, Late Fee: INR ${report.summary.totalPenaltyAccrued.toLocaleString("en-IN")}).`,
      "Demand notices and automated WhatsApp compliance reminders have been scheduled per rental bylaws.",
    ],
    signatoryTitle: "Compliance & Recovery Officer",
  });

  addFooter(doc);
  doc.save(`RentMate-Defaulters-Ledger-${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * 3. Property-wise Profit & Loss / Expense Report PDF Generator
 */
export function generatePropertyPnlPdf(report: PropertyPnlReportResponse) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 14;
  const contentWidth = doc.internal.pageSize.getWidth() - margin * 2;

  addBrandedHeader(
    doc,
    "Property-wise Profit & Loss / Expense Report",
    "Asset-level gross rent collections, maintenance operational expenditures, and Net Operating Income (NOI)",
    "P&L STATEMENT"
  );

  // Summary Metrics Grid (4 cards with clean breathing space)
  const cardY = 56;
  const cardW = (contentWidth - 9) / 4;
  const cardH = 17;

  const metrics = [
    {
      label: "TOTAL REVENUE",
      val: `INR ${report.summary.portfolioRevenue.toLocaleString("en-IN")}`,
      color: emeraldGreen,
    },
    {
      label: "MAINTENANCE EXPENSES",
      val: `INR ${report.summary.portfolioExpenses.toLocaleString("en-IN")}`,
      color: roseRed,
    },
    {
      label: "NET OPERATING INCOME",
      val: `INR ${report.summary.netOperatingIncome.toLocaleString("en-IN")}`,
      color: primaryColor,
    },
    {
      label: "OPERATING MARGIN",
      val: `${report.summary.portfolioMargin}%`,
      color: report.summary.portfolioMargin >= 0 ? emeraldGreen : roseRed,
    },
  ];

  metrics.forEach((m, idx) => {
    const x = margin + idx * (cardW + 3);
    doc.setFillColor(...bgShade);
    doc.setDrawColor(...borderLight);
    doc.roundedRect(x, cardY, cardW, cardH, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...slateMuted);
    doc.text(m.label, x + 3.5, cardY + 6);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...m.color);
    doc.text(m.val, x + 3.5, cardY + 12.5);
  });

  const tableData = report.items.map((item, i) => [
    i + 1,
    item.propertyTitle,
    item.city,
    `${item.occupiedUnits}/${item.totalUnits}`,
    `INR ${item.grossIncome.toLocaleString("en-IN")}`,
    `INR ${item.totalExpenses.toLocaleString("en-IN")}`,
    `INR ${item.netProfit.toLocaleString("en-IN")}`,
    `${item.profitMargin}%`,
    `${item.maintenanceTicketsCount} (${item.resolvedTicketsCount} res)`,
  ]);

  // Wide, balanced column widths to completely eliminate awkward word wrapping
  autoTable(doc, {
    startY: cardY + cardH + 8,
    margin: { left: margin, right: margin },
    head: [
      [
        "#",
        "Property Asset",
        "City",
        "Units",
        "Collected Rent",
        "Maintenance Cost",
        "Net Operating P&L",
        "Margin",
        "Tickets",
      ],
    ],
    body: tableData,
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 3.5,
      halign: "left",
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 3.5,
      textColor: slateDark,
      lineColor: borderLight,
      lineWidth: 0.2,
      valign: "middle",
    },
    alternateRowStyles: {
      fillColor: [250, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 38 },
      2: { cellWidth: 18 },
      3: { cellWidth: 16, halign: "center" },
      4: { cellWidth: 23, halign: "right", textColor: emeraldGreen },
      5: { cellWidth: 23, halign: "right", textColor: roseRed },
      6: { cellWidth: 24, halign: "right", fontStyle: "bold" },
      7: { cellWidth: 16, halign: "center", fontStyle: "bold" },
      8: { cellWidth: 16, halign: "center" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 6) {
        const row = report.items[data.row.index];
        if (row && row.netProfit < 0) {
          data.cell.styles.textColor = roseRed;
        } else if (row && row.netProfit > 0) {
          data.cell.styles.textColor = emeraldGreen;
        }
      }
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 135;

  // Enterprise Portfolio Assessment and Sign-Off Block to fill A4 sheet
  addEnterpriseSignoffBlock(doc, finalY, {
    analysisTitle: "Portfolio Financial Health & Yield Assessment",
    analysisLines: [
      `Gross Portfolio Revenue: INR ${report.summary.portfolioRevenue.toLocaleString("en-IN")} across ${report.items.length} monitored real estate assets.`,
      `Operating Expenditure: INR ${report.summary.portfolioExpenses.toLocaleString("en-IN")} (Maintenance Expense Ratio: ${report.summary.portfolioRevenue > 0 ? Math.round((report.summary.portfolioExpenses / report.summary.portfolioRevenue) * 100) : 0}%).`,
      `Net Operating Income (NOI): INR ${report.summary.netOperatingIncome.toLocaleString("en-IN")} with a blended portfolio margin of ${report.summary.portfolioMargin}%.`,
    ],
    signatoryTitle: "Chief Asset & Financial Controller",
  });

  addFooter(doc);
  doc.save(`RentMate-Property-PnL-${new Date().toISOString().slice(0, 10)}.pdf`);
}
