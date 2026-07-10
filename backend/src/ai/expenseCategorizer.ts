// Categorizes a transaction (merchant + note) into an ExpenseCategory.
// Uses fast keyword rules by default; if AI_PROVIDER=openai + a key is set,
// falls back to the model only for merchants the rules can't place.

export type ExpenseCategory =
  | 'FOOD' | 'CLOTHES' | 'RECHARGE' | 'BILLS'
  | 'ENTERTAINMENT' | 'TRANSPORT' | 'OTHER';

const RULES: { category: ExpenseCategory; keywords: string[] }[] = [
  { category: 'FOOD', keywords: ['swiggy', 'zomato', 'dominos', 'mcdonald', 'kfc', 'restaurant', 'cafe', 'coffee', 'starbucks', 'bakery', 'eatfit', 'blinkit', 'zepto', 'bigbasket', 'grocery', 'food', 'dmart', 'more retail', 'reliance fresh'] },
  { category: 'TRANSPORT', keywords: ['uber', 'ola', 'rapido', 'irctc', 'redbus', 'metro', 'petrol', 'fuel', 'hpcl', 'iocl', 'bpcl', 'fastag', 'parking', 'indian oil', 'railway'] },
  { category: 'RECHARGE', keywords: ['jio', 'airtel', 'vodafone', 'vi ', 'bsnl', 'recharge', 'mobile', 'dth', 'tatasky', 'prepaid', 'data pack'] },
  { category: 'BILLS', keywords: ['electricity', 'water bill', 'gas', 'broadband', 'wifi', 'postpaid', 'insurance', 'lic', 'rent', 'maintenance', 'bescom', 'tneb', 'adani', 'bill', 'emi', 'loan'] },
  { category: 'ENTERTAINMENT', keywords: ['netflix', 'prime video', 'hotstar', 'disney', 'spotify', 'youtube', 'bookmyshow', 'pvr', 'inox', 'gaming', 'steam', 'playstation'] },
  { category: 'CLOTHES', keywords: ['myntra', 'ajio', 'zara', 'h&m', 'hm ', 'lifestyle', 'pantaloons', 'westside', 'nike', 'adidas', 'shoppers stop', 'flipkart fashion', 'clothing', 'apparel'] },
];

export function categorizeByRules(merchant?: string | null, note?: string | null): ExpenseCategory | null {
  const hay = `${merchant ?? ''} ${note ?? ''}`.toLowerCase();
  if (!hay.trim()) return null;
  for (const rule of RULES) {
    if (rule.keywords.some((k) => hay.includes(k))) return rule.category;
  }
  return null;
}

async function categorizeWithOpenAI(merchant: string, note?: string | null): Promise<ExpenseCategory | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You classify a payment into exactly one category. Reply with ONLY one word from: FOOD, CLOTHES, RECHARGE, BILLS, ENTERTAINMENT, TRANSPORT, OTHER.' },
          { role: 'user', content: `Merchant: ${merchant}. Note: ${note ?? ''}` },
        ],
        max_tokens: 3,
        temperature: 0,
      }),
    });
    if (!res.ok) return null;
    const data: any = await res.json();
    const word = (data.choices?.[0]?.message?.content || '').trim().toUpperCase();
    const valid: ExpenseCategory[] = ['FOOD', 'CLOTHES', 'RECHARGE', 'BILLS', 'ENTERTAINMENT', 'TRANSPORT', 'OTHER'];
    return valid.includes(word as ExpenseCategory) ? (word as ExpenseCategory) : null;
  } catch {
    return null;
  }
}

export async function categorizeExpense(merchant?: string | null, note?: string | null): Promise<ExpenseCategory> {
  const byRules = categorizeByRules(merchant, note);
  if (byRules) return byRules;

  if (process.env.AI_PROVIDER === 'openai' && merchant) {
    const byAI = await categorizeWithOpenAI(merchant, note);
    if (byAI) return byAI;
  }
  return 'OTHER';
}
