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
    const cleanedLines = lines.filter(line => line.trim().length > 2);
    
    const text = cleanedLines.join('\n');
    
    console.log(`[PDF Parser] Passing ${text.length} characters of raw text to AI for detailed extraction...`);
    const results = await extractTransactionsFromText(text);
    
    // Format the date objects back to JS Dates
    const formattedResults = results.map(tx => ({
      ...tx,
      date: new Date(tx.date)
    }));

    console.log(`[PDF Parser] AI successfully extracted ${formattedResults.length} transactions from the custom PDF.`);
    return formattedResults;
  } catch (error) {
    console.error("[PDF Parser Error]", error);
    throw new Error("Failed to parse PDF using AI");
  }
};
