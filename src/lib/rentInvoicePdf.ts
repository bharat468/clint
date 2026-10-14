import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface UtilityDetail {
  type: "ELECTRICITY" | "WATER" | string;
  meterNo?: string;
  previousReading?: number;
  currentReading?: number;
  consumedUnits?: number;
  unitMeasure?: string; // "kWh" or "kL"
  ratePerUnit?: number;
  amount: number;
}

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
  utilities?: UtilityDetail[];
  lateFee?: number;
  status: "PAID" | "PENDING" | "FAILED" | string;
  paymentMethod?: string;
  transactionRef?: string;
  paidOn?: string | null;
}

/**
 * Converts Indian currency numbers to words (e.g. 32000 -> "Thirty-Two Thousand Rupees Only")
 */
export function numberToWordsINR(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded <= 0) return "Zero Rupees Only";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const convertBelowThousand = (n: number): string => {
    let str = "";
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      str += ones[n] + " ";
    }
    return str.trim();
  };

  let num = rounded;
  let words = "";

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const remaining = num;

  if (crore > 0) words += convertBelowThousand(crore) + " Crore ";
  if (lakh > 0) words += convertBelowThousand(lakh) + " Lakh ";
  if (thousand > 0) words += convertBelowThousand(thousand) + " Thousand ";
  if (remaining > 0) words += convertBelowThousand(remaining) + " ";

  return `${words.trim()} Rupees Only`;
}

/**
 * Generate Authentic, Clean & Professional Corporate Firm Rent Invoice / Official Receipt PDF
 * ------------------------------------------------------------------------------------------
 * Spans the full A4 canvas (210 x 297 mm) with balanced corporate real estate presentation:
 * - Real estate firm / corporate header & letterhead branding
 * - Official document metadata (Tax Invoice / Rent Receipt, Date, Billing Month, Status)
 * - Two-column Lessor vs Lessee dossier with occupied unit designation
 * - Tabular itemization of Base Rent, Electricity Sub-Meter, Water Supply Sub-Meter, Maintenance
 * - Right-aligned subtotal calculation & Left-aligned Amount in Words
 * - Payment Acknowledgement without exposing raw database UUIDs
 * - Statutory declaration for Section 10(13A) HRA tax exemption
 * - Authorized signatory and certified ledger seal
 */
export function generateRentInvoicePdf(data: RentInvoiceData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // Professional Corporate Color Palette
  const navyBrand: [number, number, number] = [15, 23, 42]; // Slate 900
  const slateText: [number, number, number] = [30, 41, 59]; // Slate 800
  const slateSub: [number, number, number] = [71, 85, 105]; // Slate 600
  const slateMuted: [number, number, number] = [100, 116, 139]; // Slate 500
  const borderRule: [number, number, number] = [203, 213, 225]; // Slate 300
  const borderLight: [number, number, number] = [226, 232, 240]; // Slate 200
  const bgShade: [number, number, number] = [248, 250, 252]; // Slate 50
  const emeraldGreen: [number, number, number] = [16, 149, 102]; // Emerald 600
  const amberTone: [number, number, number] = [217, 119, 6]; // Amber 600

  // 1. TOP CORPORATE BAR
  doc.setFillColor(...navyBrand);
  doc.rect(0, 0, pageWidth, 4, "F");

  // 2. HEADER & LETTERHEAD (Y: 12 - 38mm)
  let y = 14;

  // Left: Firm / Landlord Corporate Identity
  doc.setTextColor(...navyBrand);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  const firmTitle = data.landlordName ? data.landlordName.toUpperCase() : "RENTMATE PROPERTY MANAGEMENT";
  doc.text(firmTitle, margin, y + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...slateSub);
  doc.text("Real Estate Asset Management & Rental Operations", margin, y + 9);
  doc.text(`Premises: ${data.propertyName || "Residential Property"}`, margin, y + 13.5);
  if (data.propertyAddress) {
    doc.text(`Address: ${data.propertyAddress}`, margin, y + 17.5);
  }
  const contactParts = [];
  if (data.landlordPhone) contactParts.push(`Tel: +91 ${data.landlordPhone}`);
  if (data.landlordEmail) contactParts.push(`Email: ${data.landlordEmail}`);
  if (contactParts.length > 0) {
    doc.text(contactParts.join("  |  "), margin, y + 21.5);
  }

  // Right: Document Title & Metadata Box
  const isPaid = data.status === "PAID";
  const docTitle = isPaid ? "OFFICIAL RENT RECEIPT" : "RENT INVOICE & BILL";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(isPaid ? emeraldGreen[0] : navyBrand[0], isPaid ? emeraldGreen[1] : navyBrand[1], isPaid ? emeraldGreen[2] : navyBrand[2]);
  doc.text(docTitle, pageWidth - margin, y + 4, { align: "right" });

  const invoiceNo = data.invoiceNumber || `INV-${(data.paymentId || Math.random().toString(36).substring(2, 8)).slice(-6).toUpperCase()}`;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...slateText);
  doc.text(`Invoice No: ${invoiceNo}`, pageWidth - margin, y + 10, { align: "right" });

  const issueDate = data.date || new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...slateSub);
  doc.text(`Date of Issue: ${issueDate}`, pageWidth - margin, y + 14.5, { align: "right" });
  doc.text(`Billing Cycle: ${data.month}`, pageWidth - margin, y + 18.5, { align: "right" });

  // Status Badge
  const statusBadgeW = 34;
  const statusBadgeH = 6;
  const statusBadgeX = pageWidth - margin - statusBadgeW;
  const statusBadgeY = y + 21.5;

  if (isPaid) {
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(...emeraldGreen);
    doc.roundedRect(statusBadgeX, statusBadgeY, statusBadgeW, statusBadgeH, 1, 1, "FD");
    doc.setTextColor(22, 101, 52);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("PAID & SETTLED", statusBadgeX + statusBadgeW / 2, statusBadgeY + 4.2, { align: "center" });
  } else {
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(...amberTone);
    doc.roundedRect(statusBadgeX, statusBadgeY, statusBadgeW, statusBadgeH, 1, 1, "FD");
    doc.setTextColor(146, 64, 14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("PAYMENT DUE", statusBadgeX + statusBadgeW / 2, statusBadgeY + 4.2, { align: "center" });
  }

  // 3. DIVIDER
  y = 42;
  doc.setDrawColor(...navyBrand);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);
  doc.setDrawColor(...borderLight);
  doc.setLineWidth(0.2);
  doc.line(margin, y + 1.2, pageWidth - margin, y + 1.2);

  // 4. PARTIES DOSSIER (Lessor vs Lessee) (Y: 46 - 76mm)
  y = 47;
  const colW = (contentWidth - 6) / 2;

  // Left Dossier: Lessor (Landlord)
  doc.setFillColor(...bgShade);
  doc.setDrawColor(...borderRule);
  doc.roundedRect(margin, y, colW, 28, 1, 1, "FD");

  doc.setFillColor(...navyBrand);
  doc.rect(margin, y, colW, 5.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("LESSOR / ISSUED BY", margin + 4, y + 4);

  doc.setTextColor(...navyBrand);
  doc.setFontSize(9);
  doc.text(data.landlordName || "Property Owner / Management", margin + 4, y + 10.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...slateSub);
  doc.text(`Estate: ${data.propertyName}`, margin + 4, y + 15.5);
  if (data.propertyAddress) {
    const splitAddr = doc.splitTextToSize(`Address: ${data.propertyAddress}`, colW - 8);
    doc.text(splitAddr, margin + 4, y + 20);
  }
  if (data.landlordPhone) {
    doc.text(`Contact: +91 ${data.landlordPhone}`, margin + 4, y + 25);
  }

  // Right Dossier: Lessee (Tenant)
  const rightX = margin + colW + 6;
  doc.setFillColor(...bgShade);
  doc.setDrawColor(...borderRule);
  doc.roundedRect(rightX, y, colW, 28, 1, 1, "FD");

  doc.setFillColor(...navyBrand);
  doc.rect(rightX, y, colW, 5.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("LESSEE / BILLED TO", rightX + 4, y + 4);

  doc.setTextColor(...navyBrand);
  doc.setFontSize(9);
  doc.text(data.tenantName || "Tenant", rightX + 4, y + 10.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...slateSub);
  doc.text(`Occupied Unit: Unit ${data.unitNumber || "101"}`, rightX + 4, y + 15.5);
  if (data.tenantPhone) {
    doc.text(`Phone / WhatsApp: +91 ${data.tenantPhone}`, rightX + 4, y + 20);
  }
  if (data.tenantEmail) {
    doc.text(`Email: ${data.tenantEmail}`, rightX + 4, y + 25);
  }

  // 5. ITEMIZED CHARGES TABLE (Spacious corporate layout)
  const tableStartY = 84;
  const safeAmount = Number(data.amount || 0);

  // Compute breakdown
  let utilityTotal = 0;
  const tableBody: any[] = [];
  let itemIndex = 1;

  // Determine utilities
  const hasUtilitiesList = data.utilities && data.utilities.length > 0;
  if (hasUtilitiesList) {
    utilityTotal = data.utilities!.reduce((sum, u) => sum + Number(u.amount || 0), 0);
  } else if (data.utilityAmount && data.utilityAmount > 0) {
    utilityTotal = Number(data.utilityAmount);
  }

  const maintenanceVal = Number(data.maintenanceAmount || 0);
  const lateFeeVal = Number(data.lateFee || 0);

  let baseRentVal = Number(data.baseRent);
  if (!baseRentVal || isNaN(baseRentVal)) {
    baseRentVal = safeAmount >= utilityTotal + maintenanceVal + lateFeeVal
      ? safeAmount - (utilityTotal + maintenanceVal + lateFeeVal)
      : safeAmount;
  }

  // Row 1: Base Rent
  tableBody.push([
    itemIndex++,
    `Monthly Premises Base Rent\nBilling Cycle: ${data.month || "Current Period"}`,
    "1 Month",
    `INR ${baseRentVal.toLocaleString("en-IN")}`,
    `INR ${baseRentVal.toLocaleString("en-IN")}`,
  ]);

  // Utility Rows: Electricity and Water
  if (hasUtilitiesList) {
    data.utilities!.forEach((u) => {
      const isElec = u.type === "ELECTRICITY";
      const title = isElec
        ? `Electricity Sub-Meter Consumption (${u.meterNo || `Unit ${data.unitNumber || "101"}`})`
        : `Water Supply Sub-Meter Charges (${u.meterNo || `Unit ${data.unitNumber || "101"}`})`;

      const meterInfo = u.consumedUnits !== undefined
        ? `Prev: ${u.previousReading ?? 0} | Curr: ${u.currentReading ?? 0}\n(${u.consumedUnits} ${u.unitMeasure || (isElec ? "kWh" : "kL")})`
        : `Meter Tariff Dues`;

      const rateStr = u.ratePerUnit ? `INR ${u.ratePerUnit}/${u.unitMeasure || (isElec ? "kWh" : "kL")}` : "Tariff";

      tableBody.push([
        itemIndex++,
        title,
        meterInfo,
        rateStr,
        `INR ${Number(u.amount).toLocaleString("en-IN")}`,
      ]);
    });
  } else if (utilityTotal > 0) {
    tableBody.push([
      itemIndex++,
      `Electricity & Water Sub-Meter Utility Charges`,
      `Monthly Usage`,
      `Standard Tariff`,
      `INR ${utilityTotal.toLocaleString("en-IN")}`,
    ]);
  }

  // Row: Maintenance (if any)
  if (maintenanceVal > 0) {
    tableBody.push([
      itemIndex++,
      `Society Maintenance & Common Amenities Fee`,
      `Monthly`,
      `Fixed Rate`,
      `INR ${maintenanceVal.toLocaleString("en-IN")}`,
    ]);
  }

  // Row: Late Fee (if any)
  if (lateFeeVal > 0) {
    tableBody.push([
      itemIndex++,
      `Late Payment Grace Overdue Penalty`,
      `1 Month`,
      `Statutory Cap`,
      `INR ${lateFeeVal.toLocaleString("en-IN")}`,
    ]);
  }

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: margin, right: margin },
    head: [["#", "Particulars / Fee Description", "Units / Meter Detail", "Tariff Rate", "Amount (INR)"]],
    body: tableBody,
    theme: "grid",
    headStyles: {
      fillColor: navyBrand,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 4.2,
      halign: "left",
    },
    styles: {
      fontSize: 8,
      cellPadding: 4.2,
      textColor: slateText,
      lineColor: borderRule,
      lineWidth: 0.2,
      valign: "middle",
    },
    alternateRowStyles: {
      fillColor: [250, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: contentWidth - 96 },
      2: { cellWidth: 38, halign: "center" },
      3: { cellWidth: 24, halign: "right" },
      4: { cellWidth: 24, halign: "right", fontStyle: "bold" },
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 135;

  // 6. TOTALS & SUMMARY SECTION (With balanced breathing space)
  const calcTotal = baseRentVal + utilityTotal + maintenanceVal + lateFeeVal;
  const grandTotal = Math.max(safeAmount, calcTotal);

  // Left Column: Amount in Words & Settlement
  const summaryLeftW = contentWidth - 75;
  const summaryLeftX = margin;
  const summaryY = finalY + 7;

  // Amount in words box
  doc.setFillColor(...bgShade);
  doc.setDrawColor(...borderRule);
  doc.roundedRect(summaryLeftX, summaryY, summaryLeftW, 15, 1, 1, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...slateSub);
  doc.text("AMOUNT IN WORDS:", summaryLeftX + 4, summaryY + 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...navyBrand);
  const wordsStr = numberToWordsINR(grandTotal);
  doc.text(wordsStr, summaryLeftX + 4, summaryY + 10.5);

  // Settlement Details Box (Without raw UUID!)
  const settleY = summaryY + 19;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderRule);
  doc.roundedRect(summaryLeftX, settleY, summaryLeftW, 21, 1, 1, "FD");

  doc.setFillColor(...navyBrand);
  doc.rect(summaryLeftX, settleY, summaryLeftW, 4.8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text("PAYMENT SETTLEMENT & TRANSACTION RECORD", summaryLeftX + 4, settleY + 3.4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...slateSub);

  const paymentMode = data.paymentMethod || "Online Transfer / Bank UPI";
  const paidDateStr = data.paidOn
    ? new Date(data.paidOn).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : isPaid
    ? "Recorded upon payment"
    : "Awaiting settlement confirmation";

  doc.text(`• Mode of Payment: ${paymentMode}`, summaryLeftX + 4, settleY + 9);
  doc.text(`• Settlement Date: ${paidDateStr}`, summaryLeftX + 4, settleY + 14);

  doc.text(`• Verification: Certified Ledger Instrument`, summaryLeftX + 58, settleY + 9);
  doc.text(`• Settlement Status: ${isPaid ? "Settled & Verified" : "Pending Confirmation"}`, summaryLeftX + 58, settleY + 14);

  // Right Column: Financial Calculation Breakdown Table
  const summaryRightW = 70;
  const summaryRightX = pageWidth - margin - summaryRightW;

  doc.setFillColor(...bgShade);
  doc.setDrawColor(...borderRule);
  doc.roundedRect(summaryRightX, summaryY, summaryRightW, 37, 1, 1, "FD");

  let rY = summaryY + 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...slateSub);

  // Base rent row
  doc.text("Base Rent:", summaryRightX + 4, rY);
  doc.text(`INR ${baseRentVal.toLocaleString("en-IN")}`, pageWidth - margin - 4, rY, { align: "right" });

  // Utilities row
  rY += 5.5;
  doc.text("Sub-Meter Utilities:", summaryRightX + 4, rY);
  doc.text(`INR ${utilityTotal.toLocaleString("en-IN")}`, pageWidth - margin - 4, rY, { align: "right" });

  // Maintenance row
  rY += 5.5;
  doc.text("Maintenance & Society:", summaryRightX + 4, rY);
  doc.text(`INR ${maintenanceVal.toLocaleString("en-IN")}`, pageWidth - margin - 4, rY, { align: "right" });

  // Divider
  rY += 3.5;
  doc.setDrawColor(...borderRule);
  doc.line(summaryRightX + 4, rY, pageWidth - margin - 4, rY);

  // Grand Total Row
  rY += 5.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...navyBrand);
  doc.text(isPaid ? "Total Settled:" : "Total Payable:", summaryRightX + 4, rY);
  doc.text(`INR ${grandTotal.toLocaleString("en-IN")}`, pageWidth - margin - 4, rY, { align: "right" });

  // 7. STATUTORY DECLARATION & TERMS (Y: 195 - 240mm)
  const termsY = settleY + 24;
  doc.setFillColor(...bgShade);
  doc.setDrawColor(...borderRule);
  doc.roundedRect(margin, termsY, contentWidth, 27, 1, 1, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...navyBrand);
  doc.text("TERMS, CONDITIONS & STATUTORY DECLARATION:", margin + 4, termsY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...slateSub);
  doc.text("1. This document constitutes an official rental receipt and proof of settlement issued under the RentMate Property Management Ecosystem.", margin + 4, termsY + 10);
  doc.text("2. Sub-meter utility readings are recorded per designated unit meters at landlord-approved municipal/sub-meter rates.", margin + 4, termsY + 14.5);
  doc.text("3. Valid as formal rent receipt for claiming House Rent Allowance (HRA) tax exemption under Section 10(13A) of the Income Tax Act, 1961.", margin + 4, termsY + 19);
  doc.text("4. Payment once settled is credited directly against tenant ledger for the specified billing cycle.", margin + 4, termsY + 23.5);

  // 8. SIGNATURE & CERTIFIED SEAL AUTHORITY (Y: 247 - 280mm)
  const signY = termsY + 31;

  // Left Seal Box
  const sealW = 60;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(...emeraldGreen);
  doc.roundedRect(margin, signY, sealW, 20, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(22, 101, 52);
  doc.text("RENTMATE CERTIFIED", margin + 6, signY + 6.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(21, 128, 61);
  doc.text("Verified Rental Ledger Instrument", margin + 6, signY + 11.5);
  doc.text(`Digital Seal Ref: RM-${invoiceNo}`, margin + 6, signY + 16);

  // Right Signatory Box
  const signBoxW = 65;
  const signBoxX = pageWidth - margin - signBoxW;

  doc.setDrawColor(...borderRule);
  doc.line(signBoxX, signY + 13, pageWidth - margin, signY + 13);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...navyBrand);
  doc.text("Authorized Signatory / Lessor", signBoxX + signBoxW / 2, signY + 17, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...slateSub);
  const lessorSignName = data.landlordName ? `${data.landlordName} (${data.propertyName})` : data.propertyName;
  doc.text(lessorSignName, signBoxX + signBoxW / 2, signY + 21, { align: "center" });

  // 9. BOTTOM FOOTER BAR (Y: 288 - 294mm)
  doc.setDrawColor(...borderLight);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...slateMuted);
  doc.text("RentMate Property Management Ledger  •  Official Electronic Instrument (BRD Compliance)", margin, pageHeight - 7);
  doc.text(`Page 1 of 1  •  Generated on ${new Date().toLocaleDateString("en-IN")}`, pageWidth - margin, pageHeight - 7, { align: "right" });

  // Download PDF
  const safeProp = (data.propertyName || "Property").replace(/[^a-zA-Z0-9_-]/g, "_");
  const safeMonth = (data.month || "Month").replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `Rent_Receipt_${safeProp}_${safeMonth}.pdf`;
  doc.save(filename);
}
