import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
  if (!process.env.GEMINI_API_KEY) {
    return {
      aiNarrative: "API Key missing. Unable to generate narrative.",
      insights: ["Set up Gemini API key to view insights."],
      simulatorAdvice: "Modify your spending to stretch your runway.",
      recommendation: "Review your top spends."
    };
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

Return a valid JSON object ONLY, with exactly the following keys:
- "aiNarrative": (String) 1 short, punchy sentence summarising their cycle (e.g., 'You retained ₹5,500 this cycle but spending was front-loaded.').
- "insights": (Array of 3 Strings) succinct, actionable bullet points about their behavior.
- "guiltExplanation": (String) A non-judgmental 1-sentence reason for their guilt score.
- "recommendation": (String) 1 useful next action or friendly advice.

Do not use markdown blocks around the JSON output. Do NOT include \`\`\`json. Output raw JSON object. Use a premium, intelligent, concise, non-judgmental tone.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini API Error:", error.message);
    return {
      aiNarrative: "We processed your statement, but AI summarization is unavailable right now.",
      insights: [
        "Your burn rate was calculated successfully.",
        "Check your micro leaks below.",
        "Try simulating differences to improve runway."
      ],
      guiltExplanation: "Calculations are based on your retained funds and micro-spend ratio.",
      recommendation: "Check your largest outflow this month."
    };
  }
};

export const generateSimulatorAdvice = async (updates: any) => {
  if (!process.env.GEMINI_API_KEY) return "Reducing daily spends significantly improves your runway.";

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `You are a financial wellness assistant.
The user is simulating a change in their cashflow:
Reduced Daily Spend: ₹${updates.reduceDailySpend}
Extra Income: ₹${updates.extraIncome}
Delayed Income by: ${updates.delayIncomeDays} days

Their new theoretical runway is ${updates.newRunwayDate} days, and balance is ₹${updates.projectedBalance}.

Return 1 short sentence (max 15 words) of advice about this simulation.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    return "Optimizing your daily spend directly impacts your financial stability.";
  }
};
