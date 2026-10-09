import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface RentInvoiceData {
  invoiceNumber?: string;
  paymentId?: string;
  date?: string;
  month: string;
  propertyName: string;
  propertyAddress?: string;
  unitNumber?: string;
  landlordName?: string;
  landlordPhone?: string;
  landlordEmail?: string;
  tenantName: string;
  tenantPhone?: string;
  tenantEmail?: string;
  amount: number;
  baseRent?: number;
  maintenanceAmount?: number;
  utilityAmount?: number;
  lateFee?: number;
  status: "PAID" | "PENDING" | "FAILED" | string;
  paymentMethod?: string;
  transactionRef?: string;
  paidOn?: string | null;
}

export function generateRentInvoicePdf(data: RentInvoiceData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Primary Theme Colors
  const primaryColor: [number, number, number] = [30, 58, 138]; // Deep Royal Blue #1E3A8A
  const slateDark: [number, number, number] = [15, 23, 42]; // Slate 900
  const slateMuted: [number, number, number] = [100, 116, 139]; // Slate 500
  const emeraldGreen: [number, number, number] = [16, 149, 102]; // Emerald 600

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.roundedRect(margin, 12, contentWidth, 24, 3, 3, "F");

  // Title in Banner
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("RENTMATE", margin + 8, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("PROPERTY MANAGEMENT & RENTAL ECOSYSTEM", margin + 8, 28);

  // Invoice / Receipt Label Right-Aligned
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  const statusLabel = data.status === "PAID" ? "OFFICIAL RENT RECEIPT" : "RENT INVOICE / BILL";
  doc.text(statusLabel, pageWidth - margin - 8, 23, { align: "right" });

  const invoiceNo = data.invoiceNumber || `INV-${(data.paymentId || Math.random().toString(36).substring(2, 8)).slice(-6).toUpperCase()}`;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Invoice #: ${invoiceNo}`, pageWidth - margin - 8, 29, { align: "right" });

  // Invoice Meta Bar (Date, Month, Status)
  let yPos = 42;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, yPos, contentWidth, 14, 2, 2, "FD");

  doc.setTextColor(...slateMuted);
  doc.setFontSize(8);
  doc.text("DATE OF ISSUE", margin + 6, yPos + 5);
  doc.text("BILLING PERIOD", margin + 50, yPos + 5);
  doc.text("PAYMENT STATUS", margin + 105, yPos + 5);
  doc.text("TOTAL AMOUNT", pageWidth - margin - 6, yPos + 5, { align: "right" });

  doc.setTextColor(...slateDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  const issueDate = data.date || new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  doc.text(issueDate, margin + 6, yPos + 10.5);
  doc.text(data.month, margin + 50, yPos + 10.5);

  if (data.status === "PAID") {
    doc.setTextColor(...emeraldGreen);
    doc.text("PAID ✓", margin + 105, yPos + 10.5);
  } else {
    doc.setTextColor(217, 119, 6); // amber-600
    doc.text("PENDING / DUE", margin + 105, yPos + 10.5);
  }

  doc.setTextColor(...primaryColor);
  doc.text(`INR ${data.amount.toLocaleString("en-IN")}`, pageWidth - margin - 6, yPos + 10.5, { align: "right" });

  // Two Columns: Landlord (Issuer) & Tenant (Billed To)
  yPos = 62;
  const colWidth = (contentWidth - 6) / 2;

  // Landlord Card
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, yPos, colWidth, 34, 2, 2, "FD");

  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("ISSUED BY / LANDLORD", margin + 5, yPos + 6);

  doc.setTextColor(...slateDark);
  doc.setFontSize(10);
  doc.text(data.landlordName || "Property Owner / Management", margin + 5, yPos + 12);

  doc.setTextColor(...slateMuted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Property: ${data.propertyName}`, margin + 5, yPos + 18);
  if (data.propertyAddress) {
    const splitAddr = doc.splitTextToSize(`Address: ${data.propertyAddress}`, colWidth - 10);
    doc.text(splitAddr, margin + 5, yPos + 23);
  }
  if (data.landlordPhone) {
    doc.text(`Contact: +91 ${data.landlordPhone}`, margin + 5, yPos + 30);
  }

  // Tenant Card
  const rightColX = margin + colWidth + 6;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightColX, yPos, colWidth, 34, 2, 2, "FD");

  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("TENANT DETAILS (BILLED TO)", rightColX + 5, yPos + 6);

  doc.setTextColor(...slateDark);
  doc.setFontSize(10);
  doc.text(data.tenantName, rightColX + 5, yPos + 12);

  doc.setTextColor(...slateMuted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Allocated Unit: ${data.unitNumber || "Main Flat / Unit"}`, rightColX + 5, yPos + 18);
  if (data.tenantPhone) {
    doc.text(`Mobile: +91 ${data.tenantPhone}`, rightColX + 5, yPos + 24);
  }
  if (data.tenantEmail) {
    doc.text(`Email: ${data.tenantEmail}`, rightColX + 5, yPos + 30);
  }

  // Rent Breakdown Table
  yPos = 102;
  const baseRentVal = data.baseRent || data.amount;
  const maintenanceVal = data.maintenanceAmount || 0;
  const utilityVal = data.utilityAmount || 0;
  const lateFeeVal = data.lateFee || 0;

  const tableBody = [
    ["1", `Monthly Residential Rent (${data.month})`, `INR ${baseRentVal.toLocaleString("en-IN")}`],
  ];

  if (maintenanceVal > 0) {
    tableBody.push(["2", "Society & Maintenance Charges", `INR ${maintenanceVal.toLocaleString("en-IN")}`]);
  }
  if (utilityVal > 0) {
    tableBody.push(["3", "Electricity & Water Surcharge", `INR ${utilityVal.toLocaleString("en-IN")}`]);
  }
  if (lateFeeVal > 0) {
    tableBody.push(["4", "Late Payment Grace Overdue Penalty", `INR ${lateFeeVal.toLocaleString("en-IN")}`]);
  }

  autoTable(doc, {
    startY: yPos,
    margin: { left: margin, right: margin },
    head: [["#", "Description / Fee Item", "Amount (INR)"]],
    body: tableBody,
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3.5,
      textColor: slateDark,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: contentWidth - 52 },
      2: { cellWidth: 40, halign: "right", fontStyle: "bold" },
    },
  });

  // Summary Table / Box below table
  const finalY = (doc as any).lastAutoTable?.finalY || 140;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(pageWidth - margin - 75, finalY + 4, 75, 22, 2, 2, "FD");

  doc.setFontSize(8.5);
  doc.setTextColor(...slateMuted);
  doc.text("Total Charges:", pageWidth - margin - 70, finalY + 11);
  doc.text("Net Total Paid:", pageWidth - margin - 70, finalY + 18);

  doc.setTextColor(...slateDark);
  doc.setFont("helvetica", "normal");
  doc.text(`INR ${data.amount.toLocaleString("en-IN")}`, pageWidth - margin - 5, finalY + 11, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text(`INR ${data.amount.toLocaleString("en-IN")}`, pageWidth - margin - 5, finalY + 19, { align: "right" });

  // Transaction Receipt Box
  const txBoxY = finalY + 32;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, txBoxY, contentWidth, 24, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryColor);
  doc.text("PAYMENT & SETTLEMENT RECORD", margin + 6, txBoxY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...slateDark);

  const paymentMode = data.paymentMethod || "ONLINE_TRANSFER / UPI";
  const paidDateStr = data.paidOn
    ? new Date(data.paidOn).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : data.status === "PAID"
    ? "Recorded upon payment"
    : "Awaiting settlement";

  doc.text(`• Mode of Payment: ${paymentMode}`, margin + 6, txBoxY + 12);
  doc.text(`• Settlement Date: ${paidDateStr}`, margin + 6, txBoxY + 18);

  const txIdStr = data.transactionRef || data.paymentId || "RNTM-TX-DIRECT";
  doc.text(`• Transaction Ref: ${txIdStr}`, margin + 90, txBoxY + 12);
  doc.text(`• Verification: Digitally Verified System Record`, margin + 90, txBoxY + 18);

  // Signatures / Stamps
  const footerY = txBoxY + 36;

  // Left stamp
  doc.setDrawColor(16, 149, 102);
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, footerY, 55, 18, 2, 2, "FD");
  doc.setFontSize(8);
  doc.setTextColor(22, 101, 52);
  doc.setFont("helvetica", "bold");
  doc.text("✓ RENTMATE VERIFIED", margin + 6, footerY + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Authentic Rental Transaction", margin + 6, footerY + 13);

  // Right signature line
  doc.setDrawColor(148, 163, 184);
  doc.line(pageWidth - margin - 55, footerY + 12, pageWidth - margin, footerY + 12);
  doc.setTextColor(...slateMuted);
  doc.setFontSize(7.5);
  doc.text("Authorized Landlord / Agent Sign", pageWidth - margin - 28, footerY + 16, { align: "center" });

  // Bottom Notice
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "This is an electronically generated rental invoice and receipt issued under the RENTMATE Rental Ecosystem. Valid for tax exemption under HRA.",
    pageWidth / 2,
    285,
    { align: "center" }
  );

  // Save / Download PDF
  const filename = `Rent_Receipt_${data.propertyName.replace(/\s+/g, "_")}_${data.month.replace(/\s+/g, "_")}.pdf`;
  doc.save(filename);
}
