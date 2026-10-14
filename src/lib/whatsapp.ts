/**
 * RentMate 1-Click Direct WhatsApp Share Engine (100% Free - Zero 3rd Party API)
 * -----------------------------------------------------------------------------
 * Uses the browser's native `https://wa.me/{phone}?text={encodedText}` protocol.
 * Opens directly in WhatsApp Web on desktop, or WhatsApp Mobile App on smartphones.
 * Zero external API cost, zero gateway latency, instant delivery.
 */

export interface WhatsAppRentParams {
  tenantPhone: string;
  tenantName: string;
  propertyName: string;
  unitNumber?: string;
  month: string;
  amount: number;
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
  const formattedAmount = `INR ${Number(params.amount || 0).toLocaleString("en-IN")}`;
  const unitStr = params.unitNumber ? ` (Unit: ${params.unitNumber})` : "";

  let message = "";
  if (isPaid) {
    message = `✅ *RENTMATE - OFFICIAL PAYMENT RECEIPT*

Dear *${params.tenantName}*,

We have received your rent payment! Here are your official settlement details:

🏢 *Property:* ${params.propertyName}${unitStr}
📅 *Billing Period:* ${params.month}
💰 *Amount Paid:* ${formattedAmount}
${params.receiptNumber ? `🧾 *Receipt #:* ${params.receiptNumber}\n` : ""}${params.paidOn ? `🗓️ *Settlement Date:* ${params.paidOn}\n` : ""}✅ *Status:* PAID [VERIFIED]

Thank you for your timely payment!`;
  } else {
    const isOverdue = params.status === "OVERDUE";
    const statusLabel = isOverdue ? "⚠️ CRITICALLY OVERDUE" : "⏳ PENDING / DUE";

    message = `🏢 *RENTMATE - RENT INVOICE & PAYMENT NOTICE*

Dear *${params.tenantName}*,

This is a gentle payment notice regarding your monthly rental charges:

🏢 *Property:* ${params.propertyName}${unitStr}
📅 *Billing Period:* ${params.month}
💰 *Total Due:* ${formattedAmount}
📌 *Status:* ${statusLabel}
${params.dueDate ? `⏰ *Due Date:* ${params.dueDate}\n` : ""}
Please settle your dues before the grace period expires to avoid late penalty charges.

Thank you,
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

  const baseDue = `INR ${Number(params.baseAmount || 0).toLocaleString("en-IN")}`;
  const penaltyDue = `INR ${Number(params.penaltyAmount || 0).toLocaleString("en-IN")}`;
  const totalDue = `INR ${Number(params.totalOutstanding || 0).toLocaleString("en-IN")}`;

  const message = `🚨 *RENTMATE - URGENT OVERDUE RENT ARREARS NOTICE*

Attention: *${params.tenantName}*,

Your rent for *${params.propertyTitle}* (Unit: *${params.unitNumber}*) is severely overdue.

⚠️ *Arrears Summary:*
• Billing Period: *${params.month}*
• Total Overdue: *${params.daysOverdue} Days*
• Base Rent Due: *${baseDue}*
• Accrued Late Penalty: *${penaltyDue}*
• *TOTAL OUTSTANDING: ${totalDue}*

Please clear this outstanding amount immediately to avoid legal escalation or lease termination.

Thank you,
*Compliance & Collections Team*`;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
  return true;
}
