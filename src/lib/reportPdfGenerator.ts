import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type {
  MonthlyCollectionReportResponse,
  DefaulterReportResponse,
  PropertyPnlReportResponse,
} from "@/services/reports.service";

const primaryColor: [number, number, number] = [30, 58, 138]; // #1E3A8A Royal Blue
const slateDark: [number, number, number] = [15, 23, 42]; // Slate 900
const slateMuted: [number, number, number] = [100, 116, 139]; // Slate 500
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

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.roundedRect(margin, 12, contentWidth, 22, 2.5, 2.5, "F");

  // Title in Banner
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("RENTMATE", margin + 8, 21);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("PROPERTY MANAGEMENT & FINANCIAL INTELLIGENCE", margin + 8, 27);

  // Badge label right aligned
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(reportTypeBadge.toUpperCase(), pageWidth - margin - 8, 21, {
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
    27,
    { align: "right" }
  );

  // Report Title Bar
  doc.setTextColor(...slateDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(title, margin, 42);

  doc.setTextColor(...slateMuted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(subtitle, margin, 47);
}

function addFooter(doc: jsPDF) {
  const pageCount = (doc as any).internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...slateMuted);
    doc.text(
      "RentMate Enterprise PMS — Confidential Financial & Operational Record (BRD Sec 25)",
      14,
      pageHeight - 8
    );
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 8, {
      align: "right",
    });
  }
}

/**
 * 1. Monthly Rent Collection Report PDF
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

  // Summary Metrics Grid (4 cards in a row)
  const cardY = 52;
  const cardW = (contentWidth - 9) / 4;
  const cardH = 16;

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
      color: primaryColor,
    },
  ];

  metrics.forEach((m, idx) => {
    const x = margin + idx * (cardW + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, cardY, cardW, cardH, 2, 2, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...slateMuted);
    doc.text(m.label, x + 3.5, cardY + 5.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...m.color);
    doc.text(m.val, x + 3.5, cardY + 12);
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
    startY: cardY + cardH + 7,
    margin: { left: margin, right: margin },
    head: [
      [
        "#",
        "Receipt",
        "Month",
        "Tenant",
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
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.8,
      textColor: slateDark,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 20 },
      2: { cellWidth: 16 },
      3: { cellWidth: 26 },
      4: { cellWidth: 22 },
      5: { cellWidth: 34 },
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

  addFooter(doc);
  doc.save(`RentMate-Rent-Collections-${report.summary.filterMonth || "all"}.pdf`);
}

/**
 * 2. Pending Defaulters List PDF
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

  // Summary Metrics Grid (4 cards)
  const cardY = 52;
  const cardW = (contentWidth - 9) / 4;
  const cardH = 16;

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
    doc.setFillColor(254, 242, 242); // Red tint
    doc.setDrawColor(254, 205, 211);
    doc.roundedRect(x, cardY, cardW, cardH, 2, 2, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...slateMuted);
    doc.text(m.label, x + 3.5, cardY + 5.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...m.color);
    doc.text(m.val, x + 3.5, cardY + 12);
  });

  const tableData = report.items.map((item, i) => [
    i + 1,
    item.tenantName,
    item.tenantPhone,
    item.propertyTitle,
    item.unitNumber,
    item.month,
    `${item.daysOverdue} days`,
    `INR ${item.baseAmount.toLocaleString("en-IN")}`,
    `INR ${item.penaltyAmount.toLocaleString("en-IN")}`,
    `INR ${item.totalOutstanding.toLocaleString("en-IN")}`,
    item.status,
  ]);

  autoTable(doc, {
    startY: cardY + cardH + 7,
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
      fillColor: [185, 28, 28], // Dark Red for defaulters
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.8,
      textColor: slateDark,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 7, halign: "center" },
      1: { cellWidth: 26 },
      2: { cellWidth: 22 },
      3: { cellWidth: 26 },
      4: { cellWidth: 14 },
      5: { cellWidth: 14 },
      6: { cellWidth: 15, halign: "center", fontStyle: "bold", textColor: roseRed },
      7: { cellWidth: 16, halign: "right" },
      8: { cellWidth: 14, halign: "right" },
      9: { cellWidth: 18, halign: "right", fontStyle: "bold", textColor: roseRed },
      10: { cellWidth: 16, halign: "center" },
    },
  });

  addFooter(doc);
  doc.save(`RentMate-Defaulters-Ledger-${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * 3. Property-wise Profit & Loss / Expense Report PDF
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

  // Summary Metrics Grid (4 cards)
  const cardY = 52;
  const cardW = (contentWidth - 9) / 4;
  const cardH = 16;

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
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, cardY, cardW, cardH, 2, 2, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...slateMuted);
    doc.text(m.label, x + 3.5, cardY + 5.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...m.color);
    doc.text(m.val, x + 3.5, cardY + 12);
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
    `${item.maintenanceTicketsCount} (${item.resolvedTicketsCount} resolved)`,
  ]);

  autoTable(doc, {
    startY: cardY + cardH + 7,
    margin: { left: margin, right: margin },
    head: [
      [
        "#",
        "Property Asset",
        "City",
        "Occupancy",
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
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.8,
      textColor: slateDark,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 7, halign: "center" },
      1: { cellWidth: 38 },
      2: { cellWidth: 18 },
      3: { cellWidth: 18, halign: "center" },
      4: { cellWidth: 22, halign: "right", textColor: emeraldGreen },
      5: { cellWidth: 22, halign: "right", textColor: roseRed },
      6: { cellWidth: 22, halign: "right", fontStyle: "bold" },
      7: { cellWidth: 14, halign: "center", fontStyle: "bold" },
      8: { cellWidth: 21, halign: "center" },
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

  addFooter(doc);
  doc.save(`RentMate-Property-PnL-${new Date().toISOString().slice(0, 10)}.pdf`);
}
