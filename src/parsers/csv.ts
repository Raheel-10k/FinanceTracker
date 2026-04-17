import csv from 'csv-parser';
import fs from 'fs';

export const parseCSV = (filePath: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Attempt to parse standard bank csv format heuristically
        // E.g. date, description, debit, credit, balance
        const keys = Object.keys(data);
        const findKeyArr = (arr: string[]) => keys.find(k => arr.some(sub => k.toLowerCase().includes(sub)));
        
        const dateKey = findKeyArr(['date']) || keys[0];
        const descKey = findKeyArr(['desc', 'narration', 'particulars']) || keys[1];
        const debitKey = findKeyArr(['debit', 'withdrawal']) || keys[2];
        const creditKey = findKeyArr(['credit', 'deposit']) || keys[3];
        const balanceKey = findKeyArr(['balance']) || keys[4];

        if (dateKey && descKey && balanceKey) {
            const debitStr = (data[debitKey] || '').replace(/[^0-9.]/g, '');
            const creditStr = (data[creditKey] || '').replace(/[^0-9.]/g, '');
            const debit = parseFloat(debitStr) || 0;
            const credit = parseFloat(creditStr) || 0;
            const balance = parseFloat((data[balanceKey] || '').replace(/[^0-9.]/g, '')) || 0;

            if (debit > 0 || credit > 0) {
              results.push({
                date: new Date(data[dateKey]),
                description: data[descKey],
                type: credit > 0 ? 'credit' : 'debit',
                amount: credit > 0 ? credit : debit,
                balance
              });
            }
        }
      })
      .on('end', () => {
        console.log(`[CSV Parser] Processed actual file path ${filePath}. Found ${results.length} transactions.`);
        resolve(results);
      })
      .on('error', reject);
  });
};
