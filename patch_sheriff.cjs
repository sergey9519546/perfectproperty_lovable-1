const fs = require('fs');
let content = fs.readFileSync('src/features/sheriff-sales/types.ts', 'utf8');

content = content.replace(/cadastreSummary: string;/g, 'cadastreSummary?: string;');
content = content.replace(/armsLengthCompsFound: number;/g, 'armsLengthCompsFound?: number;');
content = content.replace(/aerialSummary: string;/g, 'aerialSummary?: string;');
content = content.replace(/verifiedPropertyTaxLien: number;/g, 'verifiedPropertyTaxLien?: number;');
content = content.replace(/verifiedWaterSewerLien: number;/g, 'verifiedWaterSewerLien?: number;');
content = content.replace(/municipalCodeFines: number;/g, 'municipalCodeFines?: number;');
content = content.replace(/depositPayableTo: string;/g, 'depositPayableTo?: string;');
content = content.replace(/remainingBalanceDueDays: number;/g, 'remainingBalanceDueDays?: number;');

fs.writeFileSync('src/features/sheriff-sales/types.ts', content);
