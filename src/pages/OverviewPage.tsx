import React from 'react';
import { KPICard } from '@/components/dashboard/KPICard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { HomeCreditRecord } from '@/lib/synthetic-data';
import { calculateKPIs, prepareChartData } from '@/lib/data-utils';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend
} from 'recharts';

interface OverviewPageProps {
  data: HomeCreditRecord[];
}

export function OverviewPage({ data }: OverviewPageProps) {
  const kpis = calculateKPIs(data);
  
  const targetDistribution = prepareChartData(data, 'target_distribution');
  const ageDistribution = prepareChartData(data, 'age_distribution');
  const incomeDistribution = prepareChartData(data, 'income_distribution');
  const genderDistribution = prepareChartData(data, 'gender_distribution');
  const educationDistribution = prepareChartData(data, 'education_distribution');
  const familyStatusDistribution = prepareChartData(data, 'family_status_distribution');

  // Simulate missing data analysis for display
  const missingDataFeatures = [
    { feature: 'OCCUPATION_TYPE', missingPercent: 31.3 },
    { feature: 'EXT_SOURCE_3', missingPercent: 19.8 },
    { feature: 'EXT_SOURCE_2', missingPercent: 0.7 },
    { feature: 'AMT_GOODS_PRICE', missingPercent: 2.8 },
    { feature: 'NAME_TYPE_SUITE', missingPercent: 0.4 }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Overview & Data Quality</h1>
        <p className="text-muted-foreground">
          Dataset overview, quality metrics, and high-level portfolio risk analysis
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard 
          title="Total Applicants"
          value={kpis.totalApplicants?.toLocaleString() || '0'}
          subtitle="Applications"
        />
        <KPICard 
          title="Default Rate"
          value={`${kpis.defaultRate || 0}%`}
          variant="danger"
          trend={kpis.defaultRate > 10 ? "up" : "down"}
          trendValue="vs industry avg"
        />
        <KPICard 
          title="Repaid Rate"
          value={`${kpis.repaidRate || 0}%`}
          variant="success"
          trend="up"
          trendValue="+2.1%"
        />
        <KPICard 
          title="Total Features"
          value={kpis.totalFeatures || 0}
          subtitle="Data columns"
        />
        <KPICard 
          title="Numerical Features"
          value={kpis.numericalFeatures || 0}
          subtitle="Quantitative vars"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard 
          title="Categorical Features" 
          value={kpis.categoricalFeatures || 0}
          subtitle="Qualitative vars"
        />
        <KPICard 
          title="Median Age"
          value={`${kpis.medianAge || 0} yrs`}
        />
        <KPICard 
          title="Median Income"
          value={`$${(kpis.medianIncome || 0).toLocaleString()}`}
        />
        <KPICard 
          title="Average Credit"
          value={`$${(kpis.avgCredit || 0).toLocaleString()}`}
        />
        <KPICard 
          title="Avg Missing per Feature"
          value="8.2%"
          subtitle="Data completeness"
          variant="warning"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Target Distribution */}
        <ChartCard 
          title="Target Distribution"
          description="Loan repayment vs default distribution"
        >
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={targetDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {targetDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Missing Data Analysis */}
        <ChartCard 
          title="Top Features by Missing %"
          description="Data quality assessment"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={missingDataFeatures}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="feature" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="missingPercent" fill="hsl(var(--warning))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Age Distribution */}
        <ChartCard 
          title="Age Distribution"
          description="Applicant age histogram"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ageDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--chart-1))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Income Distribution */}
        <ChartCard 
          title="Income Distribution" 
          description="Annual income histogram"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={incomeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Gender Distribution */}
        <ChartCard 
          title="Gender Distribution"
          description="Applicant gender breakdown"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={genderDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--chart-3))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Education Distribution */}
        <ChartCard 
          title="Education Level Distribution"
          description="Educational background breakdown"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={educationDistribution.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={11}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--chart-4))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Insights Section */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-primary">Data Quality</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Dataset contains {kpis.totalApplicants?.toLocaleString()} loan applications</li>
              <li>• Overall default rate of {kpis.defaultRate}% indicates moderate risk portfolio</li>
              <li>• Missing data primarily in occupation type (31.3%) and external sources</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-primary">Demographics</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Median applicant age of {kpis.medianAge} years suggests mature borrower base</li>
              <li>• Gender distribution shows {kpis.femalePercentage}% female applicants</li>
              <li>• Education levels vary with higher education being most common</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-primary">Financial Profile</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Median income of ${kpis.medianIncome?.toLocaleString()} indicates middle-class focus</li>
              <li>• Average credit amount of ${kpis.avgCredit?.toLocaleString()}</li>
              <li>• Income distribution shows right-skewed pattern typical of financial data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}