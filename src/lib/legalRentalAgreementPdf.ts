import { jsPDF } from "jspdf";
import { numberToWordsINR } from "./rentInvoicePdf";

export interface RentalAgreementData {
  agreementNumber?: string;
  executionDate?: string;
  // Landlord (Lessor)
  landlordName: string;
  landlordFatherName?: string;
  landlordAddress?: string;
  landlordPhone?: string;
  landlordEmail?: string;
  // Tenant (Lessee)
  tenantName: string;
  tenantFatherName?: string;
  tenantPermanentAddress?: string;
  tenantPhone: string;
  tenantEmail?: string;
  tenantIdProofNumber?: string;
  // Property & Unit
  propertyName: string;
  propertyAddress: string;
  city: string;
  unitNumber: string;
  floor?: number | string;
  furnishing?: string;
  // Commercial Terms
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  rentDueDay?: number;
  graceDays?: number;
  electricityRate?: number;
  waterRate?: number;
  escalationPercentage?: number;
  noticePeriodDays?: number;
  lockInPeriodMonths?: number;
  witness1Name?: string;
  witness2Name?: string;
}

export function generateLegalRentalAgreementPdf(data: RentalAgreementData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 22) {
      doc.addPage();
      y = margin;
      drawPageBorder();
    }
  };

  const drawPageBorder = () => {
    doc.setDrawColor(203, 213, 225); // Slate 300
    doc.setLineWidth(0.35);
    doc.rect(margin - 4, margin - 4, contentWidth + 8, pageHeight - margin * 2 + 8);
  };

  // Initial page border
  drawPageBorder();

  // 1. Notarial / E-Stamp Duty Box (Standard in Indian Lease Deeds)
  doc.setDrawColor(148, 163, 184); // Slate 400
  doc.setLineDashPattern([2, 1.5], 0);
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 22, "FD");
  doc.setLineDashPattern([], 0); // Reset

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("SPACE FOR NON-JUDICIAL E-STAMP DUTY CERTIFICATE / NOTARIAL ATTESTATION", pageWidth / 2, y + 8, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(
    "Executed under the Indian Contract Act, 1872 & Transfer of Property Act, 1882 for Residential 11-Month Tenancy.",
    pageWidth / 2,
    y + 14,
    { align: "center" }
  );

  y += 28;

  // 2. Title & Agreement Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text("RESIDENTIAL RENTAL LEASE AGREEMENT", pageWidth / 2, y, { align: "center" });

  y += 5.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(37, 99, 235); // Blue 600
  doc.text("STANDARD 11-MONTH TENANCY DEED WITH SUB-METER UTILITY TERMS", pageWidth / 2, y, {
    align: "center",
  });

  y += 5;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);

  y += 6;

  // Metadata Bar
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const execDateFormatted = data.executionDate
    ? new Date(data.executionDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  doc.text(`Agreement Ref: ${data.agreementNumber || `LSE-${Date.now().toString().slice(-6)}`}`, margin, y);
  doc.text(`Place of Execution: ${data.city || "Jaipur"}, India`, pageWidth / 2, y, { align: "center" });
  doc.text(`Date of Execution: ${execDateFormatted}`, pageWidth - margin, y, { align: "right" });

  y += 8;

  // 3. Preamble & Parties Description
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  const preamble = `THIS DEED OF LEASE AGREEMENT is executed on this ${execDateFormatted} at ${data.city}, India, by and between:`;
  const splitPreamble = doc.splitTextToSize(preamble, contentWidth);
  doc.text(splitPreamble, margin, y);
  y += splitPreamble.length * 4.2 + 2;

  // Lessor Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 23, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("1. FIRST PARTY (LESSOR / LANDLORD):", margin + 3, y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Name: ${data.landlordName || "Property Owner"}${data.landlordFatherName ? ` S/o ${data.landlordFatherName}` : ""}`,
    margin + 3,
    y + 10
  );
  doc.text(
    `Address: ${data.landlordAddress || data.propertyAddress || "Demised Premises Address"}`,
    margin + 3,
    y + 14
  );
  doc.text(
    `Contact Phone: ${data.landlordPhone || "N/A"}  |  Email: ${data.landlordEmail || "N/A"}`,
    margin + 3,
    y + 18
  );

  y += 27;

  // Lessee Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 23, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("2. SECOND PARTY (LESSEE / TENANT):", margin + 3, y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Name: ${data.tenantName}${data.tenantFatherName ? ` S/o ${data.tenantFatherName}` : ""}`,
    margin + 3,
    y + 10
  );
  doc.text(
    `Permanent Address: ${data.tenantPermanentAddress || "As verified on official Government ID"}`,
    margin + 3,
    y + 14
  );
  doc.text(
    `Contact Phone: ${data.tenantPhone || "N/A"}  |  Email: ${data.tenantEmail || "N/A"}${data.tenantIdProofNumber ? `  |  Govt ID: ${data.tenantIdProofNumber}` : ""}`,
    margin + 3,
    y + 18
  );

  y += 27;

  // Recitals
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const recitals = `WHEREAS the Lessor is the absolute lawful owner/representative of Property known as "${data.propertyName}", located at ${data.propertyAddress}, ${data.city}. And whereas the Lessee has approached the Lessor to take on lease Unit No. ${data.unitNumber || "101"} (Floor ${data.floor || 1}, ${data.furnishing || "Semi-Furnished"}) for private residential purpose only, which the Lessor has agreed on the following mutually agreed terms:`;
  const splitRecitals = doc.splitTextToSize(recitals, contentWidth);
  doc.text(splitRecitals, margin, y);
  y += splitRecitals.length * 3.8 + 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("NOW THIS AGREEMENT WITNESSETH AND IT IS MUTUALLY AGREED AS FOLLOWS:", margin, y);
  y += 6;

  // 4. Numbered Clauses
  const startDateStr = new Date(data.startDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const endDateStr = new Date(data.endDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const clauses = [
    {
      title: "1. TENURE & DURATION",
      text: `This lease is granted for a fixed period of 11 (Eleven) calendar months commencing from ${startDateStr} and ending on ${endDateStr}, unless terminated earlier in accordance with the terms of this Agreement.`,
    },
    {
      title: "2. MONTHLY RENT & PAYMENT DUE DATE",
      text: `The Lessee agrees to pay a monthly rent of Rs. ${Number(data.monthlyRent || 0).toLocaleString("en-IN")} (${numberToWordsINR(data.monthlyRent || 0)}), payable strictly in advance on or before the ${data.rentDueDay || 5}th day of each calendar month. A grace period of ${data.graceDays || 3} days is allowed, after which late fee penalties shall accrue as recorded in the management ledger.`,
    },
    {
      title: "3. INTEREST-FREE SECURITY DEPOSIT",
      text: `The Lessee has deposited a sum of Rs. ${Number(data.securityDeposit || 0).toLocaleString("en-IN")} (${numberToWordsINR(data.securityDeposit || 0)}) with the Lessor as interest-free refundable Security Deposit. This deposit shall be refunded upon vacant and peaceful handover of the premises, subject to deductions for any unpaid rent, sub-meter utility bills, or damages beyond normal wear and tear.`,
    },
    {
      title: "4. SUB-METER UTILITIES (ELECTRICITY & WATER)",
      text: `In addition to the monthly rent, the Lessee shall regularly pay for actual sub-meter electricity consumption calculated at the rate of Rs. ${data.electricityRate || 9}/kWh, and water supply charges at Rs. ${data.waterRate || 20}/kL (or as fixed by the building management). Charges will be computed from the dedicated physical unit sub-meter logs and billed monthly.`,
    },
    {
      title: "5. ANNUAL RENT ESCALATION ON RENEWAL",
      text: `Upon the expiry of the 11-month lease term, if both parties mutually decide to renew the agreement for a subsequent term, the monthly rent shall be subject to a standard agreed escalation of ${data.escalationPercentage || 10}% over the existing monthly rent.`,
    },
    {
      title: "6. LOCK-IN PERIOD & NOTICE FOR TERMINATION",
      text: `Both parties agree to a minimum lock-in period of ${data.lockInPeriodMonths || 3} months. Either party may terminate this agreement prior to expiry by serving a minimum of ${data.noticePeriodDays || 30} days advance written notice or by paying one month's rent in lieu thereof.`,
    },
    {
      title: "7. EXCLUSIVE RESIDENTIAL USE & RESTRICTIONS",
      text: `The demised premises shall be utilized solely and exclusively for residential dwelling by the Lessee and registered family members. No commercial, hazardous, unlawful, or immoral activities causing nuisance to neighbors shall be permitted.`,
    },
    {
      title: "8. SUB-LETTING PROHIBITION",
      text: `The Lessee shall NOT assign, transfer, sub-let, or part with possession of the demised premises or any part thereof to any third party under any circumstances.`,
    },
    {
      title: "9. MAINTENANCE, REPAIRS & HANDOVER CONDITION",
      text: `The Lessee shall maintain the premises, sanitary fittings, electrical switches, and fixtures in clean and tenantable order. Minor day-to-day repairs (fuses, tap washers) shall be borne by the Lessee. Major structural repairs shall remain the responsibility of the Lessor. On vacating, the Lessee shall hand over all keys and premises in the same clean state as received.`,
    },
    {
      title: "10. JURISDICTION & GOVERNING LAW",
      text: `This agreement shall be interpreted and governed in accordance with the laws of India, and any disputes arising hereunder shall be subject to the exclusive jurisdiction of the civil courts in ${data.city || "Jaipur"}.`,
    },
  ];

  clauses.forEach((c) => {
    checkPageBreak(20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(c.title, margin, y);
    y += 4.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(51, 65, 85);
    const splitText = doc.splitTextToSize(c.text, contentWidth);
    doc.text(splitText, margin, y);
    y += splitText.length * 3.7 + 3;
  });

  // 5. Signature & Witness Block
  checkPageBreak(50);
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("IN WITNESS WHEREOF, the parties hereto have signed this Agreement on the day, month, and year first written:", margin, y);
  y += 8;

  const boxWidth = (contentWidth - 6) / 2;

  // Landlord signature box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, boxWidth, 24, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("SIGNATURE OF LESSOR (LANDLORD)", margin + 3, y + 5);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${data.landlordName || "Owner"}`, margin + 3, y + 17);
  doc.text("Date: ________________________", margin + 3, y + 21);

  // Tenant signature box
  doc.rect(margin + boxWidth + 6, y, boxWidth, 24, "FD");
  doc.setFont("helvetica", "bold");
  doc.text("SIGNATURE OF LESSEE (TENANT)", margin + boxWidth + 9, y + 5);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${data.tenantName}`, margin + boxWidth + 9, y + 17);
  doc.text("Date: ________________________", margin + boxWidth + 9, y + 21);

  y += 28;

  // Witnesses box
  checkPageBreak(25);
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, y, contentWidth, 18, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("WITNESSES:", margin + 3, y + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("1. Name & Address: ____________________________________  Signature: ____________________", margin + 3, y + 9.5);
  doc.text("2. Name & Address: ____________________________________  Signature: ____________________", margin + 3, y + 14.5);

  // Add Page Numbers to all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Residential Rental Lease Agreement  |  Unit ${data.unitNumber || "101"} (${data.propertyName})`,
      margin,
      pageHeight - 8
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
  }

  const safeFileName = `Rental_Agreement_${(data.tenantName || "Tenant").replace(/\s+/g, "_")}_Unit_${data.unitNumber || "101"}.pdf`;
  doc.save(safeFileName);
}
