// Parses Indian bank / UPI transaction SMS into structured data.
// Handles common formats: HDFC, SBI, ICICI, Axis, Kotak + UPI apps
// (GPay / PhonePe / Paytm) which all surface a debit/credit line.
import crypto from 'crypto';

export interface ParsedSms {
  amount: number;
  direction: 'DEBIT' | 'CREDIT';
  merchant: string | null;
  refNo: string | null;
  accountTail: string | null;
  smsRef: string;       // stable dedupe key
  isTransaction: boolean;
}

const DEBIT_WORDS = /\b(debited|debit|spent|paid|sent|withdrawn|purchase|deducted)\b/i;
const CREDIT_WORDS = /\b(credited|credit|received|deposited|refund)\b/i;

// ₹ / Rs / INR amounts, with optional thousands separators and decimals.
const AMOUNT_RE = /(?:(?:rs|inr|₹)\.?\s*)([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i;

// Merchant / counterparty after "to", "at", "VPA", "to VPA", "info:"
const MERCHANT_RE =
  /(?:\b(?:to|at|towards)\b|VPA|UPI\/[A-Z]+\/|info[:\-]|for)\s*[:\-]?\s*([A-Za-z0-9@._&' ]{2,40}?)(?=\s+(?:on|ref|upi|avl|a\/c|not you|txn|dated|thru|via|\.|$))/i;

const REF_RE = /(?:ref(?:erence)?(?:\s*no)?|txn(?:\s*id)?|utr|upi\s*ref)[:.\s#]*([A-Za-z0-9]{4,})/i;
const ACCT_RE = /(?:a\/c|acct|account|ac)\s*(?:no)?\.?\s*[xX*]*([0-9]{3,6})/i;

function cleanMerchant(m: string | null): string | null {
  if (!m) return null;
  const t = m.trim().replace(/\s+/g, ' ').replace(/[._-]+$/, '').trim();
  if (!t || /^\d+$/.test(t)) return null;
  return t.length > 40 ? t.slice(0, 40) : t;
}

export function parseSms(message: string, receivedAt?: string | Date): ParsedSms {
  const text = (message || '').replace(/\s+/g, ' ').trim();

  const amountMatch = text.match(AMOUNT_RE);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

  const isDebit = DEBIT_WORDS.test(text);
  const isCredit = CREDIT_WORDS.test(text);
  const direction: 'DEBIT' | 'CREDIT' = isCredit && !isDebit ? 'CREDIT' : 'DEBIT';

  const merchant = cleanMerchant(text.match(MERCHANT_RE)?.[1] ?? null);
  const refNo = text.match(REF_RE)?.[1] ?? null;
  const accountTail = text.match(ACCT_RE)?.[1] ?? null;

  // A real transaction SMS has an amount AND a debit/credit verb.
  const isTransaction = amount > 0 && (isDebit || isCredit);

  // Dedupe key: prefer the bank's ref no; else hash of amount+merchant+day.
  const day = (receivedAt ? new Date(receivedAt) : new Date()).toISOString().slice(0, 10);
  const basis = refNo ? `ref:${refNo}` : `amt:${amount}|m:${merchant ?? ''}|d:${day}`;
  const smsRef = crypto.createHash('sha1').update(basis).digest('hex').slice(0, 16);

  return { amount, direction, merchant, refNo, accountTail, smsRef, isTransaction };
}
