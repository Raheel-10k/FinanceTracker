import fs from 'fs';
import pdfParse from 'pdf-parse';
import { extractTransactionsFromText } from '../ai/groq';

export const parsePDF = async (filePath: string): Promise<any[]> => {
  const dataBuffer = fs.readFileSync(filePath);
  try {
    console.log(`[PDF Parser] Reading PDF structure from ${filePath}`);
    const data = await pdfParse(dataBuffer);
    
    // Perform gentle cleaning instead of aggressive digit-strips to preserve formatting
    const lines = data.text.split('\n');
    const cleanedLines = lines.filter((line: string) => line.trim().length > 2);
    
    const text = cleanedLines.join('\n');
    
    console.log(`[PDF Parser] Passing ${text.length} characters of raw text to AI for detailed extraction...`);
    const results = await extractTransactionsFromText(text);
    
    const formattedResults = results.map(tx => {
       let parsed = new Date(tx.date);
       // If the LLM hallucinated YYYY-DD-MM instead of YYYY-MM-DD
       if (isNaN(parsed.getTime())) {
          const parts = tx.date.split('-');
          if (parts.length === 3) {
            // Swap day and month securely
            parsed = new Date(`${parts[0]}-${parts[2]}-${parts[1]}`);
          }
       }
       if (isNaN(parsed.getTime())) parsed = new Date(); // Ultra safe fallback
       
       return {
         ...tx,
         date: parsed
       };
    });

    console.log(`[PDF Parser] AI successfully extracted ${formattedResults.length} transactions from the custom PDF.`);
    return formattedResults;
  } catch (error) {
    console.error("[PDF Parser Error]", error);
    throw new Error("Failed to parse PDF using AI");
  }
};
