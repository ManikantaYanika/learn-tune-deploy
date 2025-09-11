import { HomeCreditRecord } from './synthetic-data';
import { FilterState } from '@/components/dashboard/FilterSidebar';

// Data filtering utilities
export function applyFilters(data: HomeCreditRecord[], filters: FilterState): HomeCreditRecord[] {
  return data.filter(record => {
    // Gender filter
    if (filters.gender.length > 0 && !filters.gender.includes(record.CODE_GENDER)) {
      return false;
    }
    
    // Education filter
    if (filters.education.length > 0 && !filters.education.includes(record.NAME_EDUCATION_TYPE)) {
      return false;
    }
    
    // Family status filter
    if (filters.familyStatus.length > 0 && !filters.familyStatus.includes(record.NAME_FAMILY_STATUS)) {
      return false;
    }
    
    // Housing type filter
    if (filters.housingType.length > 0 && !filters.housingType.includes(record.NAME_HOUSING_TYPE)) {
      return false;
    }
    
    // Age range filter
    if (record.AGE_YEARS && (record.AGE_YEARS < filters.ageRange[0] || record.AGE_YEARS > filters.ageRange[1])) {
      return false;
    }
    
    // Income bracket filter
    if (filters.incomeBracket !== 'all') {
      const bracketMap = { low: 'Low', mid: 'Mid', high: 'High' };
      if (record.INCOME_BRACKET !== bracketMap[filters.incomeBracket as keyof typeof bracketMap]) {
        return false;
      }
    }
    
    // Employment range filter
    if (record.EMPLOYMENT_YEARS && (
      record.EMPLOYMENT_YEARS < filters.employmentRange[0] || 
      record.EMPLOYMENT_YEARS > filters.employmentRange[1]
    )) {
      return false;
    }
    
    return true;
  });
}

// KPI calculation utilities
export function calculateKPIs(data: HomeCreditRecord[]) {
  if (data.length === 0) return {};
  
  const totalApplicants = data.length;
  const totalDefaults = data.filter(r => r.TARGET === 1).length;
  const defaultRate = (totalDefaults / totalApplicants) * 100;
  const repaidRate = 100 - defaultRate;
  
  const ages = data.filter(r => r.AGE_YEARS).map(r => r.AGE_YEARS!);
  const incomes = data.map(r => r.AMT_INCOME_TOTAL);
  const credits = data.map(r => r.AMT_CREDIT);
  const annuities = data.filter(r => r.AMT_ANNUITY).map(r => r.AMT_ANNUITY);
  
  const medianAge = median(ages);
  const medianIncome = median(incomes);
  const avgCredit = mean(credits);
  const avgAnnuity = mean(annuities);
  
  // Missing data analysis
  const totalFeatures = Object.keys(data[0] || {}).length;
  const numericalFeatures = ['AMT_INCOME_TOTAL', 'AMT_CREDIT', 'AMT_ANNUITY', 'AGE_YEARS', 'EMPLOYMENT_YEARS', 'CNT_CHILDREN'].length;
  const categoricalFeatures = totalFeatures - numericalFeatures;
  
  // DTI and LTI calculations
  const dtiValues = data.filter(r => r.DTI && r.DTI > 0).map(r => r.DTI!);
  const ltiValues = data.filter(r => r.LOAN_TO_INCOME && r.LOAN_TO_INCOME > 0).map(r => r.LOAN_TO_INCOME!);
  
  const avgDTI = mean(dtiValues);
  const avgLTI = mean(ltiValues);
  
  // Demographic breakdowns
  const maleCount = data.filter(r => r.CODE_GENDER === 'M').length;
  const femaleCount = data.filter(r => r.CODE_GENDER === 'F').length;
  const withChildrenCount = data.filter(r => r.CNT_CHILDREN > 0).length;
  
  // Risk segmentation
  const defaulterIncomes = data.filter(r => r.TARGET === 1).map(r => r.AMT_INCOME_TOTAL);
  const nonDefaulterIncomes = data.filter(r => r.TARGET === 0).map(r => r.AMT_INCOME_TOTAL);
  const avgIncomeDefaulters = mean(defaulterIncomes);
  const avgIncomeNonDefaulters = mean(nonDefaulterIncomes);
  
  return {
    // Overview KPIs
    totalApplicants,
    defaultRate: Number(defaultRate.toFixed(2)),
    repaidRate: Number(repaidRate.toFixed(2)),
    totalFeatures,
    numericalFeatures,
    categoricalFeatures,
    medianAge: Number(medianAge?.toFixed(1) || 0),
    medianIncome: Number(medianIncome?.toFixed(0) || 0),
    avgCredit: Number(avgCredit?.toFixed(0) || 0),
    
    // Risk KPIs
    totalDefaults,
    avgIncomeDefaulters: Number(avgIncomeDefaulters?.toFixed(0) || 0),
    avgIncomeNonDefaulters: Number(avgIncomeNonDefaulters?.toFixed(0) || 0),
    incomeGap: Number((avgIncomeNonDefaulters - avgIncomeDefaulters)?.toFixed(0) || 0),
    
    // Demographics KPIs
    malePercentage: Number(((maleCount / totalApplicants) * 100).toFixed(1)),
    femalePercentage: Number(((femaleCount / totalApplicants) * 100).toFixed(1)),
    withChildrenPercentage: Number(((withChildrenCount / totalApplicants) * 100).toFixed(1)),
    avgFamilySize: Number(mean(data.map(r => r.CNT_FAM_MEMBERS))?.toFixed(1) || 0),
    
    // Financial KPIs
    avgIncome: Number(mean(incomes)?.toFixed(0) || 0),
    avgAnnuity: Number(avgAnnuity?.toFixed(0) || 0),
    avgDTI: Number(avgDTI?.toFixed(3) || 0),
    avgLTI: Number(avgLTI?.toFixed(2) || 0),
    highCreditPercentage: Number(((data.filter(r => r.AMT_CREDIT > 1000000).length / totalApplicants) * 100).toFixed(1))
  };
}

// Statistical utility functions
function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 
    ? (sorted[mid - 1] + sorted[mid]) / 2 
    : sorted[mid];
}

// Chart data preparation utilities
export function prepareChartData(data: HomeCreditRecord[], type: string) {
  switch (type) {
    case 'target_distribution':
      const defaultCount = data.filter(r => r.TARGET === 1).length;
      const repaidCount = data.length - defaultCount;
      return [
        { name: 'Repaid', value: repaidCount, color: 'hsl(var(--success))' },
        { name: 'Default', value: defaultCount, color: 'hsl(var(--destructive))' }
      ];
      
    case 'age_distribution':
      const ageBins = createBins(data.filter(r => r.AGE_YEARS).map(r => r.AGE_YEARS!), 15);
      return ageBins;
      
    case 'income_distribution':
      const incomeBins = createBins(data.map(r => r.AMT_INCOME_TOTAL), 20);
      return incomeBins;
      
    case 'gender_distribution':
      return groupBy(data, 'CODE_GENDER').map(({ key, count }) => ({
        name: key === 'M' ? 'Male' : key === 'F' ? 'Female' : 'Not Specified',
        value: count
      }));
      
    case 'education_distribution':
      return groupBy(data, 'NAME_EDUCATION_TYPE');
      
    case 'family_status_distribution':
      return groupBy(data, 'NAME_FAMILY_STATUS');
      
    case 'default_by_gender':
      return calculateDefaultRateByCategory(data, 'CODE_GENDER');
      
    case 'default_by_education':
      return calculateDefaultRateByCategory(data, 'NAME_EDUCATION_TYPE');
      
    case 'default_by_housing':
      return calculateDefaultRateByCategory(data, 'NAME_HOUSING_TYPE');

    case 'housing_distribution':
      return groupBy(data, 'NAME_HOUSING_TYPE');
      
    default:
      return [];
  }
}

function createBins(values: number[], numBins: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binSize = (max - min) / numBins;
  
  const bins = Array(numBins).fill(0).map((_, i) => ({
    range: `${Math.round(min + i * binSize)}-${Math.round(min + (i + 1) * binSize)}`,
    count: 0,
    min: min + i * binSize,
    max: min + (i + 1) * binSize
  }));
  
  values.forEach(value => {
    const binIndex = Math.min(Math.floor((value - min) / binSize), numBins - 1);
    bins[binIndex].count++;
  });
  
  return bins;
}

function groupBy(data: HomeCreditRecord[], key: keyof HomeCreditRecord) {
  const groups = data.reduce((acc, record) => {
    const value = String(record[key]);
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(groups)
    .map(([key, count]) => ({ key, count, name: key, value: count }))
    .sort((a, b) => b.count - a.count);
}

function calculateDefaultRateByCategory(data: HomeCreditRecord[], category: keyof HomeCreditRecord) {
  const groups = data.reduce((acc, record) => {
    const key = String(record[category]);
    if (!acc[key]) {
      acc[key] = { total: 0, defaults: 0 };
    }
    acc[key].total++;
    if (record.TARGET === 1) {
      acc[key].defaults++;
    }
    return acc;
  }, {} as Record<string, { total: number; defaults: number }>);
  
  return Object.entries(groups)
    .map(([key, { total, defaults }]) => ({
      category: key,
      defaultRate: (defaults / total) * 100,
      total,
      defaults
    }))
    .sort((a, b) => b.defaultRate - a.defaultRate);
}

// Correlation calculations
export function calculateCorrelations(data: HomeCreditRecord[]) {
  const numericalFields = [
    'AGE_YEARS', 'EMPLOYMENT_YEARS', 'AMT_INCOME_TOTAL', 
    'AMT_CREDIT', 'AMT_ANNUITY', 'DTI', 'LOAN_TO_INCOME', 
    'CNT_CHILDREN', 'CNT_FAM_MEMBERS', 'TARGET'
  ];
  
  const correlations: Record<string, Record<string, number>> = {};
  
  numericalFields.forEach(field1 => {
    correlations[field1] = {};
    numericalFields.forEach(field2 => {
      correlations[field1][field2] = calculatePearsonCorrelation(data, field1, field2);
    });
  });
  
  return correlations;
}

function calculatePearsonCorrelation(
  data: HomeCreditRecord[], 
  field1: string, 
  field2: string
): number {
  const pairs = data
    .filter(r => r[field1 as keyof HomeCreditRecord] != null && r[field2 as keyof HomeCreditRecord] != null)
    .map(r => [
      Number(r[field1 as keyof HomeCreditRecord]), 
      Number(r[field2 as keyof HomeCreditRecord])
    ]);
  
  if (pairs.length < 2) return 0;
  
  const n = pairs.length;
  const sumX = pairs.reduce((sum, [x]) => sum + x, 0);
  const sumY = pairs.reduce((sum, [, y]) => sum + y, 0);
  const sumXY = pairs.reduce((sum, [x, y]) => sum + x * y, 0);
  const sumXX = pairs.reduce((sum, [x]) => sum + x * x, 0);
  const sumYY = pairs.reduce((sum, [, y]) => sum + y * y, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
}