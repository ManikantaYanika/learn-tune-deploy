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
  ComposedChart,
  Line,
  Area
} from 'recharts';

interface RiskSegmentationPageProps {
  data: HomeCreditRecord[];
}

export function RiskSegmentationPage({ data }: RiskSegmentationPageProps) {
  const kpis = calculateKPIs(data);
  
  const defaultByGender = prepareChartData(data, 'default_by_gender');
  const defaultByEducation = prepareChartData(data, 'default_by_education');
  const defaultByHousing = prepareChartData(data, 'default_by_housing');
  
  // Calculate additional risk metrics
  const defaulters = data.filter(r => r.TARGET === 1);
  const nonDefaulters = data.filter(r => r.TARGET === 0);
  
  const avgCreditDefaulters = defaulters.reduce((sum, r) => sum + r.AMT_CREDIT, 0) / defaulters.length;
  const avgAnnuityDefaulters = defaulters.reduce((sum, r) => sum + r.AMT_ANNUITY, 0) / defaulters.length;
  const avgEmploymentDefaulters = defaulters
    .filter(r => r.EMPLOYMENT_YEARS && r.EMPLOYMENT_YEARS > 0)
    .reduce((sum, r) => sum + r.EMPLOYMENT_YEARS!, 0) / defaulters.filter(r => r.EMPLOYMENT_YEARS && r.EMPLOYMENT_YEARS > 0).length;

  // Box plot data for income by target
  const incomeByTarget = [
    {
      category: 'Non-Defaulters',
      data: nonDefaulters.map(r => r.AMT_INCOME_TOTAL).sort((a, b) => a - b)
    },
    {
      category: 'Defaulters', 
      data: defaulters.map(r => r.AMT_INCOME_TOTAL).sort((a, b) => a - b)
    }
  ];

  const creditByTarget = [
    {
      category: 'Non-Defaulters',
      data: nonDefaulters.map(r => r.AMT_CREDIT).sort((a, b) => a - b)
    },
    {
      category: 'Defaulters',
      data: defaulters.map(r => r.AMT_CREDIT).sort((a, b) => a - b)
    }
  ];

  // Age vs target distribution
  const ageTargetData = data
    .filter(r => r.AGE_YEARS)
    .reduce((acc, r) => {
      const ageBin = Math.floor(r.AGE_YEARS! / 5) * 5;
      const key = `${ageBin}-${ageBin + 5}`;
      if (!acc[key]) {
        acc[key] = { ageRange: key, defaults: 0, total: 0 };
      }
      acc[key].total++;
      if (r.TARGET === 1) acc[key].defaults++;
      return acc;
    }, {} as Record<string, { ageRange: string; defaults: number; total: number }>);

  const ageTargetChart = Object.values(ageTargetData).map(item => ({
    ...item,
    defaultRate: (item.defaults / item.total) * 100,
    nonDefaults: item.total - item.defaults
  }));

  // Contract type distribution
  const contractTypeData = data.reduce((acc, r) => {
    if (!acc[r.NAME_CONTRACT_TYPE]) {
      acc[r.NAME_CONTRACT_TYPE] = { defaults: 0, total: 0 };
    }
    acc[r.NAME_CONTRACT_TYPE].total++;
    if (r.TARGET === 1) acc[r.NAME_CONTRACT_TYPE].defaults++;
    return acc;
  }, {} as Record<string, { defaults: number; total: number }>);

  const contractTypeChart = Object.entries(contractTypeData).map(([type, data]) => ({
    contractType: type,
    defaults: data.defaults,
    nonDefaults: data.total - data.defaults,
    defaultRate: (data.defaults / data.total) * 100
  }));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Target & Risk Segmentation</h1>
        <p className="text-muted-foreground">
          Understanding how default risk varies across key demographic and financial segments
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard 
          title="Total Defaults"
          value={kpis.totalDefaults?.toLocaleString() || '0'}
          variant="danger"
          subtitle="Loan defaults"
        />
        <KPICard 
          title="Default Rate"
          value={`${kpis.defaultRate || 0}%`}
          variant="danger"
          trend={kpis.defaultRate > 8 ? "up" : "down"}
          trendValue="portfolio avg"
        />
        <KPICard 
          title="Male Default Rate"
          value={`${(defaultByGender as any[]).find(g => g.category === 'M')?.defaultRate?.toFixed(1) || 0}%`}
          variant="warning"
        />
        <KPICard 
          title="Female Default Rate"
          value={`${(defaultByGender as any[]).find(g => g.category === 'F')?.defaultRate?.toFixed(1) || 0}%`}
          variant="warning"
        />
        <KPICard 
          title="Income Gap"
          value={`$${kpis.incomeGap?.toLocaleString() || 0}`}
          subtitle="Non-def vs Def"
          trend="up"
          trendValue="significant"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard 
          title="Avg Income - Defaulters"
          value={`$${kpis.avgIncomeDefaulters?.toLocaleString() || 0}`}
          variant="danger"
        />
        <KPICard 
          title="Avg Credit - Defaulters"
          value={`$${avgCreditDefaulters?.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') || 0}`}
          variant="danger"
        />
        <KPICard 
          title="Avg Annuity - Defaulters"
          value={`$${avgAnnuityDefaulters?.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') || 0}`}
          variant="danger"
        />
        <KPICard 
          title="Avg Employment - Defaulters"
          value={`${avgEmploymentDefaulters?.toFixed(1) || 0} yrs`}
          variant="warning"
        />
        <KPICard 
          title="Highest Risk Segment"
          value="Low Education"
          subtitle={`${Math.max(...defaultByEducation.map(e => e.defaultRate)).toFixed(1)}% default rate`}
          variant="danger"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Default Counts */}
        <ChartCard 
          title="Default vs Repaid Counts"
          description="Absolute numbers of defaults and repayments"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { status: 'Repaid', count: data.length - kpis.totalDefaults, fill: 'hsl(var(--success))' },
              { status: 'Default', count: kpis.totalDefaults, fill: 'hsl(var(--destructive))' }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Default Rate by Gender */}
        <ChartCard 
          title="Default Rate by Gender"
          description="Risk comparison across gender groups"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={defaultByGender}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Default Rate']}
              />
              <Bar dataKey="defaultRate" fill="hsl(var(--chart-1))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Default Rate by Education */}
        <ChartCard 
          title="Default Rate by Education Level"
          description="Educational background impact on default risk"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={defaultByEducation}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={11}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Default Rate']}
              />
              <Bar dataKey="defaultRate" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Default Rate by Housing Type */}
        <ChartCard 
          title="Default Rate by Housing Type"
          description="Housing situation impact on repayment ability"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={defaultByHousing}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={11}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Default Rate']}
              />
              <Bar dataKey="defaultRate" fill="hsl(var(--chart-3))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Age vs Default Rate */}
        <ChartCard 
          title="Default Rate by Age Range"
          description="Age groups and associated default risk"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ageTargetChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ageRange" fontSize={12} />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'defaultRate') return [`${Number(value).toFixed(1)}%`, 'Default Rate'];
                  return [value, name];
                }}
              />
              <Bar dataKey="defaultRate" fill="hsl(var(--chart-4))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Contract Type Stacked */}
        <ChartCard 
          title="Contract Type vs Target"
          description="Loan type distribution and default patterns"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={contractTypeChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="contractType" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="nonDefaults" stackId="a" fill="hsl(var(--success))" name="Repaid" />
              <Bar dataKey="defaults" stackId="a" fill="hsl(var(--destructive))" name="Default" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Insights Section */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Risk Segmentation Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-destructive">High Risk Segments</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Lower secondary education shows highest default rates</li>
              <li>• Young adults (20-25) demonstrate elevated risk</li>
              <li>• Applicants living with parents have higher default rates</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-success">Low Risk Segments</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Higher education and academic degrees show lower defaults</li>
              <li>• Middle-aged applicants (35-50) are most reliable</li>
              <li>• Homeowners demonstrate better repayment patterns</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-primary">Key Findings</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• ${kpis.incomeGap?.toLocaleString()} income gap between defaulters and non-defaulters</li>
              <li>• Female applicants show slightly lower default rates</li>
              <li>• Cash loans have different risk profile than revolving credit</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}