import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

interface StatementMetrics {
  burnRate: number;
  runway: number;
  guilt: number;
  retained: number;
  totalCredits: number;
  totalDebits: number;
  microLeaks: number;
  largestSpend: number;
}

export const generateAIInsights = async (metrics: StatementMetrics) => {
  if (!process.env.GROQ_API_KEY) {
    return {
      aiNarrative: "API Key missing. Unable to generate narrative.",
      insights: ["Set up Groq API key to view insights."],
      guiltExplanation: "Calculations are based on your retained funds and micro-spend ratio.",
      recommendation: "Review your top spends."
    };
  }

  const prompt = `You are an intelligent, premium financial wellness assistant for a luxury fintech product.
Analyze these user metrics:
Burn rate: ₹${metrics.burnRate}/day
Runway: ${metrics.runway} days
Guilt Score: ${metrics.guilt}/100 (0 is perfect, 100 is overspending)
Retained Balance: ₹${metrics.retained}
Total Credits: ₹${metrics.totalCredits}
Total Debits: ₹${metrics.totalDebits}
Micro Leaks (< ₹200): ₹${metrics.microLeaks}
Largest Spend: ₹${metrics.largestSpend}

Return a valid JSON object exactly conforming to this schema:
{
  "aiNarrative": "String. 1 short, punchy sentence summarising their cycle",
  "insights": ["String", "String", "String"],
  "guiltExplanation": "String. A non-judgmental 1-sentence reason for their guilt score.",
  "recommendation": "String. 1 useful next action or friendly advice."
}

Use a premium, intelligent, concise, non-judgmental tone. Do NOT include markdown blocks.`;

  try {
    console.log(`[Groq API] Requesting insights for statement metrics...`);
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "openai/gpt-oss-120b"
    });

    let text = chatCompletion.choices[0]?.message?.content || "{}";
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    if (text.startsWith("`") && text.endsWith("`")) text = text.slice(1, -1);
    
    console.log(`[Groq API] Raw Response:`, text);
    
    let parsed: any = {};
    try {
        parsed = JSON.parse(text);
    } catch(e) {
        const match = text.match(/\{([\s\S]*)\}/);
        if (match) parsed = JSON.parse(match[0]);
        else throw new Error("Unable to parse valid JSON from AI");
    }
    return parsed;
  } catch (error: any) {
    console.error(`[Groq API Error] Failed to generate insights:`, error.message);
    return {
      aiNarrative: "We processed your statement, but AI summarization is unavailable right now.",
      insights: [
        "Your burn rate was calculated successfully.",
        "Check your micro leaks.",
      ],
      guiltExplanation: "Calculations are based on your retained funds and micro-spend ratio.",
      recommendation: "Check your largest outflow this month."
    };
  }
};

export const generateSimulatorAdvice = async (updates: any) => {
  if (!process.env.GROQ_API_KEY) return "Reducing daily spends significantly improves your runway.";

  const prompt = `You are a financial wellness assistant.
The user is simulating a change in their cashflow:
Reduced Daily Spend: ₹${updates.reduceDailySpend}
Extra Income: ₹${updates.extraIncome}
Delayed Income by: ${updates.delayIncomeDays} days

Their new theoretical runway is ${updates.newRunwayDate} days, and balance is ₹${updates.projectedBalance}.

Return ONLY 1 short sentence (max 15 words) of advice about this simulation.`;

  try {
    console.log(`[Groq API] Requesting simulator advice...`);
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
    });
    
    const text = chatCompletion.choices[0]?.message?.content?.trim() || "";
    console.log(`[Groq API] Simulator Response:`, text);
    return text;
  } catch (error: any) {
    console.error(`[Groq API Error] Failed to generate simulator advice:`, error.message);
    return "Optimizing your daily spend directly impacts your financial stability.";
  }
};

export const extractTransactionsFromText = async (text: string): Promise<any[]> => {
  if (!process.env.GROQ_API_KEY) {
    console.error(`[Groq API Error] API Key missing. Cannot parse raw statement text.`);
    throw new Error("API Key missing. Cannot parse raw statement text.");
  }

  const prompt = `You are an expert, highly accurate financial data extraction parser.
Below is the raw, unformatted text extracted directly from a bank statement PDF. It may contain headers, footers, disclaimers, account summaries, and messy line breaks.

YOUR EXPLICIT TASK:
1. Scan the text meticulously and identify ONLY individual financial transactions (debits and credits).
2. Ignore opening balances, closing balances, page numbers, tables of contents, or summary boxes. Look specifically for tabular data rows containing a Date, a Description/Narration, and an Amount. 
3. Determine the 'type' ("credit" or "debit"). Often, if an amount is under a "Withdrawal/Debit" column it is a debit. If under "Deposit/Credit", it is a credit. If there is a 'Cr' or 'Dr' suffix on the amount, parse accordingly.
4. Clean all amounts into pure positive Float numbers (e.g., "1,234.50" -> 1234.5).
5. If a trailing balance is provided on the row, include it as a clean float. If missing, set it to 0.

You MUST return the extracted transactions as a JSON object strictly matching this schema exactly:
{
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "String (the name or details of the transaction)",
      "type": "credit" or "debit",
      "amount": Number (positive float),
      "balance": Number (the balance after transaction, or 0)
    }
  ]
}

Raw statement text:
${String(text)}`;

  try {
    console.log(`[Groq API] Requesting transaction extraction from raw text...`);
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "meta-llama/llama-4-scout-17b-16e-instruct"
    });

    let responseText = chatCompletion.choices[0]?.message?.content || "{}";
    console.log(`[Groq API] DEBUG RAW AI PAYLOAD:`, responseText);
    responseText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
    if (responseText.startsWith("`") && responseText.endsWith("`")) responseText = responseText.slice(1, -1);
    
    let parsed: any = {};
    try {
        parsed = JSON.parse(responseText);
    } catch(e) {
        const matchArray = responseText.match(/\[([\s\S]*)\]/);
        const matchObject = responseText.match(/\{([\s\S]*)\}/);
        
        if (matchArray) {
            parsed = JSON.parse(matchArray[0]);
        } else if (matchObject) {
            parsed = JSON.parse(matchObject[0]);
        } else {
            throw new Error("Unable to parse valid JSON from AI");
        }
    }
    
    if (Array.isArray(parsed)) return parsed;
    if (parsed.transactions && Array.isArray(parsed.transactions)) return parsed.transactions;
    
    // In case it nested it further
    const keys = Object.keys(parsed);
    if (keys.length === 1 && Array.isArray(parsed[keys[0]])) return parsed[keys[0]];
    
    return [];
  } catch (error: any) {
    console.error(`[Groq API Error] Failed to extract transactions:`, error.message);
    throw new Error("AI failed to extract transactions from text");
  }
};
