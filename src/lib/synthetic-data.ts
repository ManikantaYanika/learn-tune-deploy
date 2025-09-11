// Synthetic Home Credit Default Risk dataset generator
// Based on the schema described in the Colab notebook

export interface HomeCreditRecord {
  SK_ID_CURR: number;
  TARGET: 0 | 1;
  CODE_GENDER: 'M' | 'F' | 'XNA';
  DAYS_BIRTH: number;
  DAYS_EMPLOYED: number;
  NAME_FAMILY_STATUS: string;
  CNT_CHILDREN: number;
  CNT_FAM_MEMBERS: number;
  NAME_EDUCATION_TYPE: string;
  OCCUPATION_TYPE: string;
  NAME_HOUSING_TYPE: string;
  AMT_INCOME_TOTAL: number;
  AMT_CREDIT: number;
  AMT_ANNUITY: number;
  AMT_GOODS_PRICE: number;
  NAME_CONTRACT_TYPE: string;
  REGION_RATING_CLIENT: number;
  FLAG_OWN_CAR: 'Y' | 'N';
  FLAG_OWN_REALTY: 'Y' | 'N';
  
  // Derived fields (calculated during preprocessing)
  AGE_YEARS?: number;
  EMPLOYMENT_YEARS?: number;
  DTI?: number;
  LOAN_TO_INCOME?: number;
  ANNUITY_TO_CREDIT?: number;
  INCOME_BRACKET?: 'Low' | 'Mid' | 'High';
}

// Reference data for synthetic generation
const educationTypes = [
  "Secondary / secondary special",
  "Higher education",
  "Incomplete higher", 
  "Lower secondary",
  "Academic degree"
];

const familyStatusTypes = [
  "Married",
  "Single / not married",
  "Civil marriage", 
  "Separated",
  "Widow"
];

const housingTypes = [
  "House / apartment",
  "With parents",
  "Municipal apartment",
  "Rented apartment", 
  "Office apartment",
  "Co-op apartment"
];

const occupationTypes = [
  "Laborers",
  "Core staff",
  "Sales staff",
  "Managers",
  "Drivers",
  "High skill tech staff",
  "Accountants",
  "Medicine staff",
  "Security staff",
  "Cooking staff",
  "Cleaning staff",
  "Private service staff",
  "Low-skill Laborers",
  "Waiters/barmen staff",
  "Secretaries",
  "Realty agents",
  "HR staff",
  "IT staff"
];

const contractTypes = ["Cash loans", "Revolving loans"];

// Realistic probability distributions for default risk
function getDefaultRiskByProfile(
  age: number,
  income: number, 
  education: string,
  employment: number
): number {
  let baseRisk = 0.08; // 8% baseline default rate
  
  // Age factor (younger = higher risk)
  if (age < 25) baseRisk *= 1.5;
  else if (age < 35) baseRisk *= 1.2;
  else if (age > 65) baseRisk *= 1.3;
  
  // Income factor (lower income = higher risk)
  if (income < 100000) baseRisk *= 2.0;
  else if (income < 200000) baseRisk *= 1.4;
  else if (income > 500000) baseRisk *= 0.6;
  
  // Education factor
  if (education === "Higher education" || education === "Academic degree") {
    baseRisk *= 0.7;
  } else if (education === "Lower secondary") {
    baseRisk *= 1.4;
  }
  
  // Employment stability
  if (employment < 1) baseRisk *= 1.8;
  else if (employment > 10) baseRisk *= 0.8;
  
  return Math.min(0.5, baseRisk); // Cap at 50%
}

// Generate random value within realistic ranges
function randomIncome(): number {
  // Log-normal distribution for realistic income distribution
  const mean = 11.5; // ~100k average
  const stdDev = 0.8;
  const normal = Math.random() * Math.random() * Math.random(); // Approximate normal
  return Math.exp(mean + stdDev * (normal - 0.5) * 6) * (0.5 + Math.random() * 0.5);
}

function randomAge(): number {
  // Normal distribution centered around 42 years
  const mean = 42;
  const stdDev = 12;
  let age;
  do {
    age = mean + stdDev * (Math.random() + Math.random() - 1);
  } while (age < 18 || age > 80);
  return Math.round(age);
}

function randomCredit(income: number): number {
  // Credit amount typically 2-8x annual income
  const multiplier = 2 + Math.random() * 6;
  return income * multiplier * (0.8 + Math.random() * 0.4);
}

export function generateSyntheticData(numRecords: number = 10000): HomeCreditRecord[] {
  const records: HomeCreditRecord[] = [];
  
  for (let i = 0; i < numRecords; i++) {
    const age = randomAge();
    const income = randomIncome();
    const education = educationTypes[Math.floor(Math.random() * educationTypes.length)];
    const employment = Math.random() > 0.1 ? Math.random() * 25 : -1; // 10% unemployed
    
    // Calculate default probability based on profile
    const defaultRisk = getDefaultRiskByProfile(age, income, education, employment);
    const target = Math.random() < defaultRisk ? 1 : 0;
    
    const credit = randomCredit(income);
    const annuity = credit * (0.05 + Math.random() * 0.15) / 12; // 5-20% annual rate, monthly payment
    
    const record: HomeCreditRecord = {
      SK_ID_CURR: 100000 + i,
      TARGET: target as 0 | 1,
      CODE_GENDER: Math.random() > 0.65 ? 'F' : Math.random() > 0.95 ? 'XNA' : 'M',
      DAYS_BIRTH: -Math.round(age * 365.25),
      DAYS_EMPLOYED: employment > 0 ? -Math.round(employment * 365.25) : 365243, // 365243 is unemployed code
      NAME_FAMILY_STATUS: familyStatusTypes[Math.floor(Math.random() * familyStatusTypes.length)],
      CNT_CHILDREN: Math.random() > 0.4 ? 0 : Math.floor(Math.random() * 4),
      CNT_FAM_MEMBERS: 1 + Math.floor(Math.random() * 5),
      NAME_EDUCATION_TYPE: education,
      OCCUPATION_TYPE: Math.random() > 0.05 ? occupationTypes[Math.floor(Math.random() * occupationTypes.length)] : "",
      NAME_HOUSING_TYPE: housingTypes[Math.floor(Math.random() * housingTypes.length)],
      AMT_INCOME_TOTAL: Math.round(income),
      AMT_CREDIT: Math.round(credit),
      AMT_ANNUITY: Math.round(annuity),
      AMT_GOODS_PRICE: Math.round(credit * (0.8 + Math.random() * 0.4)),
      NAME_CONTRACT_TYPE: contractTypes[Math.floor(Math.random() * contractTypes.length)],
      REGION_RATING_CLIENT: 1 + Math.floor(Math.random() * 3),
      FLAG_OWN_CAR: Math.random() > 0.5 ? 'Y' : 'N',
      FLAG_OWN_REALTY: Math.random() > 0.3 ? 'Y' : 'N'
    };
    
    records.push(record);
  }
  
  return records;
}

// Add derived fields based on the specification
export function preprocessData(records: HomeCreditRecord[]): HomeCreditRecord[] {
  return records.map(record => {
    // Convert days to years
    const ageYears = -record.DAYS_BIRTH / 365.25;
    const employmentYears = record.DAYS_EMPLOYED === 365243 ? 0 : -record.DAYS_EMPLOYED / 365.25;
    
    // Calculate financial ratios
    const dti = record.AMT_ANNUITY / record.AMT_INCOME_TOTAL;
    const lti = record.AMT_CREDIT / record.AMT_INCOME_TOTAL;
    const annuityToCredit = record.AMT_ANNUITY / record.AMT_CREDIT;
    
    return {
      ...record,
      AGE_YEARS: Math.round(ageYears * 10) / 10,
      EMPLOYMENT_YEARS: Math.max(0, Math.round(employmentYears * 10) / 10),
      DTI: Math.round(dti * 1000) / 1000,
      LOAN_TO_INCOME: Math.round(lti * 100) / 100,
      ANNUITY_TO_CREDIT: Math.round(annuityToCredit * 1000) / 1000
    };
  });
}

// Add income brackets based on quartiles
export function addIncomeBrackets(records: HomeCreditRecord[]): HomeCreditRecord[] {
  const incomes = records.map(r => r.AMT_INCOME_TOTAL).sort((a, b) => a - b);
  const q1 = incomes[Math.floor(incomes.length * 0.25)];
  const q3 = incomes[Math.floor(incomes.length * 0.75)];
  
  return records.map(record => ({
    ...record,
    INCOME_BRACKET: record.AMT_INCOME_TOTAL <= q1 ? 'Low' as const 
      : record.AMT_INCOME_TOTAL >= q3 ? 'High' as const 
      : 'Mid' as const
  }));
}

// Generate and preprocess a complete dataset
export function generateCompleteDataset(numRecords: number = 10000): HomeCreditRecord[] {
  const raw = generateSyntheticData(numRecords);
  const processed = preprocessData(raw);
  return addIncomeBrackets(processed);
}