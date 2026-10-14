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

/**
 * Generate Modern, Clean & Minimalist Rent Invoice / Official Receipt PDF
 * -------------------------------------------------------------------------
 * Produces an executive, beautifully formatted A4 rental receipt or invoice:
 * - Minimalist corporate header with typography-driven branding.
 * - Structured side-by-side Landlord vs Tenant contact dossiers.
 * - Clear itemized fee breakdown table (Base Rent, Utilities, Maintenance, Late fee).
 * - Digital verification seal and settlement timestamp stamp.
 * - 100% English, publication-grade layout suitable for tax/HRA filing.
 * 
 * @param {RentInvoiceData} data - Lease, property, landlord, tenant, and financial figures
 */
export function generateRentInvoicePdf(data: RentInvoiceData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Modern Clean Color Palette
  const navyDark: [number, number, number] = [15, 23, 42]; // Slate 900
  const primaryBlue: [number, number, number] = [37, 99, 235]; // Blue 600
  const slateText: [number, number, number] = [51, 65, 85]; // Slate 700
  const slateMuted: [number, number, number] = [100, 116, 139]; // Slate 500
  const borderLight: [number, number, number] = [226, 232, 240]; // Slate 200
  const bgLight: [number, number, number] = [248, 250, 252]; // Slate 50
  const emeraldGreen: [number, number, number] = [16, 149, 102]; // Emerald 600
  const amberOrange: [number, number, number] = [217, 119, 6]; // Amber 600

  // 1. TOP HEADER (Modern Minimalist Style)
  // Left: Brand Logo & Tagline
  doc.setTextColor(...navyDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("RentMate", margin, 20);

  // Subtle brand dot
  doc.setFillColor(...primaryBlue);
  doc.circle(margin + 33, 16.5, 1.2, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...slateMuted);
  doc.text("Property Management & Rental Ecosystem", margin, 26);

  // Right: Document Title & Metadata
  const isPaid = data.status === "PAID";
  const docTitle = isPaid ? "OFFICIAL RENT RECEIPT" : "RENT INVOICE / BILL";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(isPaid ? emeraldGreen[0] : primaryBlue[0], isPaid ? emeraldGreen[1] : primaryBlue[1], isPaid ? emeraldGreen[2] : primaryBlue[2]);
  doc.text(docTitle, pageWidth - margin, 18, { align: "right" });

  const invoiceNo = data.invoiceNumber || `INV-${(data.paymentId || Math.random().toString(36).substring(2, 8)).slice(-6).toUpperCase()}`;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...slateMuted);
  doc.text(`Invoice No: ${invoiceNo}`, pageWidth - margin, 24, { align: "right" });

  const issueDate = data.date || new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  doc.text(`Issue Date: ${issueDate}`, pageWidth - margin, 29, { align: "right" });

  // Divider Line
  doc.setDrawColor(...borderLight);
  doc.setLineWidth(0.3);
  doc.line(margin, 34, pageWidth - margin, 34);

  // 2. METADATA SUMMARY BAR
  let yPos = 39;
  doc.setFillColor(...bgLight);
  doc.setDrawColor(...borderLight);
  doc.roundedRect(margin, yPos, contentWidth, 14, 2, 2, "FD");

  doc.setFontSize(7.5);
  doc.setTextColor(...slateMuted);
  doc.setFont("helvetica", "bold");
  doc.text("BILLING PERIOD", margin + 6, yPos + 5);
  doc.text("PAYMENT STATUS", margin + 65, yPos + 5);
  doc.text("NET AMOUNT", pageWidth - margin - 6, yPos + 5, { align: "right" });

  doc.setFontSize(9);
  doc.setTextColor(...navyDark);
  doc.text(data.month, margin + 6, yPos + 10.5);

  if (isPaid) {
    doc.setTextColor(...emeraldGreen);
    doc.text("PAID • VERIFIED", margin + 65, yPos + 10.5);
  } else {
    doc.setTextColor(...amberOrange);
    doc.text("PENDING / DUE", margin + 65, yPos + 10.5);
  }

  const safeAmount = Number(data.amount || 0);
  const baseRentVal = Number(data.baseRent ?? data.amount ?? 0);
  const utilityVal = Number(data.utilityAmount || 0);
  const maintenanceVal = Number(data.maintenanceAmount || 0);
  const lateFeeVal = Number(data.lateFee || 0);

  doc.setTextColor(...navyDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(`INR ${safeAmount.toLocaleString("en-IN")}`, pageWidth - margin - 6, yPos + 10.5, { align: "right" });

  // 3. TWO-COLUMN DOSSIER (Billed By vs Billed To)
  yPos = 59;
  const colWidth = (contentWidth - 6) / 2;

  // Left Column: Landlord / Property Card
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderLight);
  doc.roundedRect(margin, yPos, colWidth, 34, 2, 2, "FD");

  doc.setTextColor(...primaryBlue);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("ISSUED BY / PROPERTY DETAILS", margin + 5, yPos + 6);

  doc.setTextColor(...navyDark);
  doc.setFontSize(9.5);
  doc.text(data.landlordName || "Property Owner / Management", margin + 5, yPos + 12);

  doc.setTextColor(...slateText);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Property: ${data.propertyName || "Rental Residence"}`, margin + 5, yPos + 18);
  if (data.propertyAddress) {
    const splitAddr = doc.splitTextToSize(`Address: ${data.propertyAddress}`, colWidth - 10);
    doc.text(splitAddr, margin + 5, yPos + 23);
  }
  if (data.landlordPhone) {
    doc.text(`Contact: +91 ${data.landlordPhone}`, margin + 5, yPos + 30);
  }

  // Right Column: Tenant Details Card
  const rightColX = margin + colWidth + 6;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderLight);
  doc.roundedRect(rightColX, yPos, colWidth, 34, 2, 2, "FD");

  doc.setTextColor(...primaryBlue);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("BILLED TO / TENANT DETAILS", rightColX + 5, yPos + 6);

  doc.setTextColor(...navyDark);
  doc.setFontSize(9.5);
  doc.text(data.tenantName || "Tenant", rightColX + 5, yPos + 12);

  doc.setTextColor(...slateText);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Occupied Unit: ${data.unitNumber || "Main Flat / Unit"}`, rightColX + 5, yPos + 18);
  if (data.tenantPhone) {
    doc.text(`Mobile: +91 ${data.tenantPhone}`, rightColX + 5, yPos + 24);
  }
  if (data.tenantEmail) {
    doc.text(`Email: ${data.tenantEmail}`, rightColX + 5, yPos + 30);
  }

  // 4. ITEMIZED CHARGES BREAKDOWN TABLE
  yPos = 99;

  const tableBody: any[] = [
    ["1", `Monthly Base Rent (${data.month || "Billing Period"})`, `INR ${baseRentVal.toLocaleString("en-IN")}`],
  ];

  if (utilityVal > 0) {
    tableBody.push(["2", "Electricity & Water Sub-Meter Utility Charges", `INR ${utilityVal.toLocaleString("en-IN")}`]);
  }
  if (maintenanceVal > 0) {
    tableBody.push(["3", "Society Maintenance & Operational Charges", `INR ${maintenanceVal.toLocaleString("en-IN")}`]);
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
      fillColor: [30, 41, 59], // Slate 800
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 3.2,
      textColor: slateText,
      lineColor: borderLight,
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: contentWidth - 45 },
      2: { cellWidth: 35, halign: "right", fontStyle: "bold" },
    },
  });

  // 5. SUMMARY ROW BELOW TABLE
  const finalY = (doc as any).lastAutoTable?.finalY || 135;
  const summaryBoxW = 70;
  const summaryBoxH = 18;
  const summaryBoxX = pageWidth - margin - summaryBoxW;

  doc.setFillColor(...bgLight);
  doc.setDrawColor(...borderLight);
  doc.roundedRect(summaryBoxX, finalY + 4, summaryBoxW, summaryBoxH, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setTextColor(...slateMuted);
  doc.setFont("helvetica", "normal");
  doc.text(isPaid ? "Total Settled:" : "Total Payable:", summaryBoxX + 5, finalY + 11);

  doc.setFontSize(11);
  doc.setTextColor(...navyDark);
  doc.setFont("helvetica", "bold");
  doc.text(`INR ${safeAmount.toLocaleString("en-IN")}`, pageWidth - margin - 5, finalY + 14, { align: "right" });

  // 6. SETTLEMENT & VERIFICATION CARD
  const txBoxY = finalY + 27;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderLight);
  doc.roundedRect(margin, txBoxY, contentWidth, 22, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...primaryBlue);
  doc.text("PAYMENT SETTLEMENT & TRANSACTION RECORD", margin + 5, txBoxY + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...slateText);

  const paymentMode = data.paymentMethod || "Online Transfer / Bank UPI";
  const paidDateStr = data.paidOn
    ? new Date(data.paidOn).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : isPaid
    ? "Recorded upon payment"
    : "Awaiting settlement confirmation";

  doc.text(`• Mode of Payment: ${paymentMode}`, margin + 5, txBoxY + 11.5);
  doc.text(`• Settlement Date: ${paidDateStr}`, margin + 5, txBoxY + 16.5);

  const txIdStr = data.transactionRef || data.paymentId || "RNTM-TX-DIRECT";
  doc.text(`• Reference ID: ${txIdStr}`, margin + 85, txBoxY + 11.5);
  doc.text(`• Verification: Certified System Record`, margin + 85, txBoxY + 16.5);

  // 7. FOOTER STAMP & LEGAL NOTICE
  const footerY = txBoxY + 30;

  // Left Green Certified Seal
  doc.setDrawColor(...emeraldGreen);
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, footerY, 52, 16, 2, 2, "FD");
  doc.setFontSize(7.5);
  doc.setTextColor(22, 101, 52);
  doc.setFont("helvetica", "bold");
  doc.text("RENTMATE CERTIFIED", margin + 5, footerY + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text("Verified Rental Ledger", margin + 5, footerY + 11.5);

  // Right Authorized Sign Line
  doc.setDrawColor(...borderLight);
  doc.line(pageWidth - margin - 50, footerY + 11, pageWidth - margin, footerY + 11);
  doc.setTextColor(...slateMuted);
  doc.setFontSize(7);
  doc.text("Authorized Signature", pageWidth - margin - 25, footerY + 15, { align: "center" });

  // Bottom Legal / HRA Exemption Note
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "This is an electronically generated rental invoice and receipt issued under the RentMate Property Management Ecosystem. Valid for HRA tax exemption.",
    pageWidth / 2,
    286,
    { align: "center" }
  );

  // Download PDF
  const safeProp = (data.propertyName || "Property").replace(/[^a-zA-Z0-9_-]/g, "_");
  const safeMonth = (data.month || "Month").replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `Rent_Receipt_${safeProp}_${safeMonth}.pdf`;
  doc.save(filename);
}
