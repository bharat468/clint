/**
 * RentMate 1-Click Direct WhatsApp Share Engine (100% Free - Zero 3rd Party API)
 * -----------------------------------------------------------------------------
 * Uses the browser's native `https://wa.me/{phone}?text={encodedText}` protocol.
 * Opens directly in WhatsApp Web on desktop, or WhatsApp Mobile App on smartphones.
 * Features clean, modern, executive formatting with bold headers and bullet dividers.
 */

export interface WhatsAppRentParams {
  tenantPhone: string;
  tenantName: string;
  propertyName: string;
  unitNumber?: string;
  month: string;
  amount: number;
  baseRent?: number;
  utilityAmount?: number;
  status: "PAID" | "PENDING" | "OVERDUE" | string;
  dueDate?: string;
  receiptNumber?: string;
  paidOn?: string;
}

export interface WhatsAppDefaulterParams {
  tenantPhone: string;
  tenantName: string;
  propertyTitle: string;
  unitNumber: string;
  month: string;
  daysOverdue: number;
  baseAmount: number;
  penaltyAmount: number;
  totalOutstanding: number;
}

/**
 * Normalizes phone numbers to standard international format (defaults to +91 for 10-digit Indian numbers)
 */
export function cleanPhoneNumber(rawPhone: string): string {
  if (!rawPhone) return "";
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

/**
 * 1-Click WhatsApp Rent Bill & Receipt Launcher
 */
export function shareRentOnWhatsApp(params: WhatsAppRentParams) {
  const phone = cleanPhoneNumber(params.tenantPhone);
  if (!phone) {
    alert("Tenant does not have a valid phone number recorded.");
    return false;
  }

  const isPaid = params.status === "PAID";
  const formattedAmount = `₹${Number(params.amount || 0).toLocaleString("en-IN")}`;
  const unitStr = params.unitNumber ? ` (Unit: ${params.unitNumber})` : "";
  const hasUtility = typeof params.utilityAmount === "number" && params.utilityAmount > 0;
  const baseRentVal = params.baseRent || (hasUtility ? params.amount - (params.utilityAmount || 0) : params.amount);

  let message = "";
  if (isPaid) {
    message = `*RENTMATE • OFFICIAL RENT RECEIPT*
━━━━━━━━━━━━━━━━━━━━
Hello *${params.tenantName}*,

Your payment has been received and confirmed. Thank you!

• *Property:* ${params.propertyName}${unitStr}
• *Billing Month:* ${params.month}
${hasUtility ? `• *Base Rent:* ₹${baseRentVal.toLocaleString("en-IN")}\n• *Sub-Meter Utilities:* ₹${Number(params.utilityAmount).toLocaleString("en-IN")}\n` : ""}• *Amount Settled:* ${formattedAmount}
• *Status:* Confirmed & Settled ✅
${params.receiptNumber ? `• *Receipt No:* ${params.receiptNumber}\n` : ""}${params.paidOn ? `• *Settlement Date:* ${params.paidOn}\n` : ""}
━━━━━━━━━━━━━━━━━━━━
This is an electronically generated receipt for your rental records.

Best regards,
*Accounts & Billing Desk*`;
  } else {
    const isOverdue = params.status === "OVERDUE";
    const statusText = isOverdue ? "Overdue ⚠️" : "Due (Pending)";

    message = `*RENTMATE • RENT PAYMENT NOTICE*
━━━━━━━━━━━━━━━━━━━━
Hello *${params.tenantName}*,

Here is your monthly rental statement for *${params.month}*:

• *Property:* ${params.propertyName}${unitStr}
• *Billing Month:* ${params.month}
${hasUtility ? `• *Base Rent:* ₹${baseRentVal.toLocaleString("en-IN")}\n• *Sub-Meter Utilities:* ₹${Number(params.utilityAmount).toLocaleString("en-IN")}\n` : ""}• *Total Payable:* ${formattedAmount}
• *Status:* ${statusText}
${params.dueDate ? `• *Due Date:* ${params.dueDate}\n` : ""}
━━━━━━━━━━━━━━━━━━━━
Kindly settle the dues on or before the due date to avoid late fee penalties.

Best regards,
*Property Management Team*`;
  }

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
  return true;
}

/**
 * 1-Click WhatsApp Delinquent Defaulter Arrears Notice
 */
export function shareDefaulterOnWhatsApp(params: WhatsAppDefaulterParams) {
  const phone = cleanPhoneNumber(params.tenantPhone);
  if (!phone) {
    alert("Tenant does not have a valid phone number recorded.");
    return false;
  }

  const baseDue = `₹${Number(params.baseAmount || 0).toLocaleString("en-IN")}`;
  const penaltyDue = `₹${Number(params.penaltyAmount || 0).toLocaleString("en-IN")}`;
  const totalDue = `₹${Number(params.totalOutstanding || 0).toLocaleString("en-IN")}`;

  const message = `*RENTMATE • OVERDUE RENT NOTICE*
━━━━━━━━━━━━━━━━━━━━
Dear *${params.tenantName}*,

This is an urgent reminder regarding unpaid rental dues for *${params.propertyTitle} (Unit: ${params.unitNumber})*.

• *Billing Month:* ${params.month}
• *Overdue Duration:* ${params.daysOverdue} Days
• *Base Rent Overdue:* ${baseDue}
• *Accrued Late Fee:* ${penaltyDue}
• *Total Outstanding:* ${totalDue}

━━━━━━━━━━━━━━━━━━━━
Please clear this pending balance immediately to maintain your active lease standing and avoid late penalties.

Best regards,
*Compliance & Collections Team*`;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
  return true;
}
