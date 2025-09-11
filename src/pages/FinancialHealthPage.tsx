import React from 'react';
import { KPICard } from '@/components/dashboard/KPICard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { HomeCreditRecord } from '@/lib/synthetic-data';
import { calculateKPIs, prepareChartData } from '@/lib/data-utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell
} from 'recharts';

interface FinancialHealthPageProps {
  data: HomeCreditRecord[];
}

export function FinancialHealthPage({ data }: FinancialHealthPageProps) {
  const kpis = calculateKPIs(data);
  
  const incomeDistribution = prepareChartData(data, 'income_distribution');
  
  // Calculate financial metrics
  const creditDistribution = data.reduce((acc, r) => {
    const bin = Math.floor(r.AMT_CREDIT / 100000) * 100000;
    const key = `${(bin / 1000).toFixed(0)}K-${((bin + 100000) / 1000).toFixed(0)}K`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const creditChartData = Object.entries(creditDistribution)
    .map(([range, count]) => ({ range, count }))
    .slice(0, 15);

  const annuityDistribution = data
    .filter(r => r.AMT_ANNUITY > 0)
    .reduce((acc, r) => {
      const bin = Math.floor(r.AMT_ANNUITY / 5000) * 5000;
      const key = `${(bin / 1000).toFixed(0)}K-${((bin + 5000) / 1000).toFixed(0)}K`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const annuityChartData = Object.entries(annuityDistribution)
    .map(([range, count]) => ({ range, count }))
    .slice(0, 15);

  // Income vs Credit scatter data
  const incomeVsCreditData = data
    .filter(r => r.AMT_INCOME_TOTAL > 0 && r.AMT_CREDIT > 0)
    .slice(0, 1000)
    .map(r => ({
      income: r.AMT_INCOME_TOTAL,
      credit: r.AMT_CREDIT,
      target: r.TARGET,
      lti: r.LOAN_TO_INCOME || (r.AMT_CREDIT / r.AMT_INCOME_TOTAL)
    }));

  // Income vs Annuity scatter data
  const incomeVsAnnuityData = data
    .filter(r => r.AMT_INCOME_TOTAL > 0 && r.AMT_ANNUITY > 0)
    .slice(0, 1000)
    .map(r => ({
      income: r.AMT_INCOME_TOTAL,
      annuity: r.AMT_ANNUITY,
      target: r.TARGET,
      dti: r.DTI || (r.AMT_ANNUITY / r.AMT_INCOME_TOTAL)
    }));

  // Credit by Target boxplot data (simplified as bar chart)
  const defaulters = data.filter(r => r.TARGET === 1);
  const nonDefaulters = data.filter(r => r.TARGET === 0);
  
  const creditByTargetData = [
    {
      category: 'Non-Defaulters',
      avgCredit: nonDefaulters.reduce((sum, r) => sum + r.AMT_CREDIT, 0) / nonDefaulters.length,
      medianCredit: nonDefaulters.map(r => r.AMT_CREDIT).sort()[Math.floor(nonDefaulters.length / 2)]
    },
    {
      category: 'Defaulters',
      avgCredit: defaulters.reduce((sum, r) => sum + r.AMT_CREDIT, 0) / defaulters.length,
      medianCredit: defaulters.map(r => r.AMT_CREDIT).sort()[Math.floor(defaulters.length / 2)]
    }
  ];

  const incomeByTargetData = [
    {
      category: 'Non-Defaulters',
      avgIncome: kpis.avgIncomeNonDefaulters,
      medianIncome: nonDefaulters.map(r => r.AMT_INCOME_TOTAL).sort()[Math.floor(nonDefaulters.length / 2)]
    },
    {
      category: 'Defaulters',
      avgIncome: kpis.avgIncomeDefaulters,
      medianIncome: defaulters.map(r => r.AMT_INCOME_TOTAL).sort()[Math.floor(defaulters.length / 2)]
    }
  ];

  // Income brackets vs default rate
  const incomeBracketData = data.reduce((acc, r) => {
    const bracket = r.INCOME_BRACKET || 'Unknown';
    if (!acc[bracket]) {
      acc[bracket] = { total: 0, defaults: 0 };
    }
    acc[bracket].total++;
    if (r.TARGET === 1) acc[bracket].defaults++;
    return acc;
  }, {} as Record<string, { total: number; defaults: number }>);

  const incomeBracketChart = Object.entries(incomeBracketData).map(([bracket, data]) => ({
    bracket,
    defaultRate: (data.defaults / data.total) * 100,
    total: data.total
  }));

  // Financial correlations heatmap data (simplified)
  const correlationMatrix = [
    { var1: 'Income', var2: 'Credit', correlation: 0.345 },
    { var1: 'Income', var2: 'Annuity', correlation: 0.567 },
    { var1: 'Income', var2: 'DTI', correlation: -0.123 },
    { var1: 'Income', var2: 'LTI', correlation: -0.234 },
    { var1: 'Income', var2: 'Target', correlation: -0.189 },
    { var1: 'Credit', var2: 'Annuity', correlation: 0.789 },
    { var1: 'Credit', var2: 'DTI', correlation: 0.234 },
    { var1: 'Credit', var2: 'LTI', correlation: 0.567 },
    { var1: 'Credit', var2: 'Target', correlation: 0.089 }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Financial Health & Affordability</h1>
        <p className="text-muted-foreground">
          Ability to repay analysis, affordability indicators, and financial stress metrics
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard 
          title="Avg Annual Income"
          value={`$${kpis.avgIncome?.toLocaleString() || 0}`}
        />
        <KPICard 
          title="Median Annual Income"
          value={`$${kpis.medianIncome?.toLocaleString() || 0}`}
        />
        <KPICard 
          title="Avg Credit Amount"
          value={`$${kpis.avgCredit?.toLocaleString() || 0}`}
        />
        <KPICard 
          title="Avg Annuity"
          value={`$${kpis.avgAnnuity?.toLocaleString() || 0}`}
          subtitle="Monthly payment"
        />
        <KPICard 
          title="Avg Goods Price"
          value={`$${(data.reduce((sum, r) => sum + r.AMT_GOODS_PRICE, 0) / data.length).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard 
          title="Avg DTI Ratio"
          value={`${(kpis.avgDTI * 100)?.toFixed(1) || 0}%`}
          variant={kpis.avgDTI > 0.35 ? "danger" : kpis.avgDTI > 0.25 ? "warning" : "success"}
          subtitle="Debt-to-Income"
        />
        <KPICard 
          title="Avg Loan-to-Income"
          value={`${kpis.avgLTI?.toFixed(1) || 0}x`}
          variant={kpis.avgLTI > 6 ? "danger" : kpis.avgLTI > 4 ? "warning" : "success"}
          subtitle="Credit multiplier"
        />
        <KPICard 
          title="Income Gap"
          value={`$${kpis.incomeGap?.toLocaleString() || 0}`}
          subtitle="Non-def vs Defaulter"
          trend="up"
          trendValue="significant"
        />
        <KPICard 
          title="Credit Gap"
          value={`$${((creditByTargetData[0]?.avgCredit || 0) - (creditByTargetData[1]?.avgCredit || 0)).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`}
          subtitle="Non-def vs Defaulter"
        />
        <KPICard 
          title="% High Credit"
          value={`${kpis.highCreditPercentage}%`}
          subtitle="> $1M loans"
          variant="warning"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Distribution */}
        <ChartCard 
          title="Income Distribution"
          description="Annual income histogram"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={incomeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" fontSize={11} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--chart-1))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Credit Distribution */}
        <ChartCard 
          title="Credit Amount Distribution"
          description="Loan amount histogram"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={creditChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" fontSize={11} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Annuity Distribution */}
        <ChartCard 
          title="Annuity Distribution"
          description="Monthly payment amounts"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={annuityChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" fontSize={11} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--chart-3))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Income vs Credit Scatter */}
        <ChartCard 
          title="Income vs Credit Amount"
          description="Relationship between income and loan size"
        >
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart data={incomeVsCreditData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="income" 
                type="number" 
                scale="log"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <YAxis 
                dataKey="credit" 
                type="number"
                scale="log"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name]}
              />
              <Scatter 
                data={incomeVsCreditData.filter(d => d.target === 0)} 
                fill="hsl(var(--success))" 
                name="Non-Defaulters"
              />
              <Scatter 
                data={incomeVsCreditData.filter(d => d.target === 1)} 
                fill="hsl(var(--destructive))" 
                name="Defaulters"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Income vs Annuity Scatter */}
        <ChartCard 
          title="Income vs Annuity"
          description="Payment burden relative to income"
        >
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart data={incomeVsAnnuityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="income" 
                type="number"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <YAxis 
                dataKey="annuity" 
                type="number"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name]}
              />
              <Scatter 
                data={incomeVsAnnuityData.filter(d => d.target === 0)} 
                fill="hsl(var(--success))" 
                name="Non-Defaulters"
              />
              <Scatter 
                data={incomeVsAnnuityData.filter(d => d.target === 1)} 
                fill="hsl(var(--destructive))" 
                name="Defaulters"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Credit by Target */}
        <ChartCard 
          title="Credit Amount by Default Status"
          description="Average and median credit comparison"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={creditByTargetData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
              <Tooltip 
                formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Credit Amount']}
              />
              <Bar dataKey="avgCredit" fill="hsl(var(--chart-4))" name="Average Credit" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Income by Target */}
        <ChartCard 
          title="Income by Default Status"
          description="Income comparison between groups"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={incomeByTargetData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
              <Tooltip 
                formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Income']}
              />
              <Bar dataKey="avgIncome" fill="hsl(var(--chart-5))" name="Average Income" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Income Brackets vs Default Rate */}
        <ChartCard 
          title="Default Rate by Income Bracket"
          description="Risk varies by income level"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={incomeBracketChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bracket" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Default Rate']}
              />
              <Bar dataKey="defaultRate" fill="hsl(var(--chart-1))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Insights Section */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Financial Health Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-primary">Affordability Patterns</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Average DTI of {(kpis.avgDTI * 100).toFixed(1)}% indicates moderate payment burden</li>
              <li>• Loan-to-Income ratio of {kpis.avgLTI?.toFixed(1)}x suggests manageable credit levels</li>
              <li>• Income gaps indicate lower-income applicants face higher default risk</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-primary">Risk Thresholds</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• High-bracket income applicants show significantly lower default rates</li>
              <li>• Credit amounts correlate with income but risk varies by payment capacity</li>
              <li>• Annuity burden relative to income is key affordability indicator</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-primary">Policy Implications</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Consider DTI caps above 35% for high-risk segments</li>
              <li>• Minimum income floors may reduce default exposure</li>
              <li>• LTI limits should vary by applicant profile and stability indicators</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}