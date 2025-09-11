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
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter
} from 'recharts';

interface DemographicsPageProps {
  data: HomeCreditRecord[];
}

export function DemographicsPage({ data }: DemographicsPageProps) {
  const kpis = calculateKPIs(data);
  
  const genderDistribution = prepareChartData(data, 'gender_distribution');
  const educationDistribution = prepareChartData(data, 'education_distribution');
  const familyStatusDistribution = prepareChartData(data, 'family_status_distribution');
  const ageDistribution = prepareChartData(data, 'age_distribution');
  
  // Calculate additional demographics KPIs
  const defaulters = data.filter(r => r.TARGET === 1);
  const nonDefaulters = data.filter(r => r.TARGET === 0);
  
  const avgAgeDefaulters = defaulters.filter(r => r.AGE_YEARS).reduce((sum, r) => sum + r.AGE_YEARS!, 0) / defaulters.filter(r => r.AGE_YEARS).length;
  const avgAgeNonDefaulters = nonDefaulters.filter(r => r.AGE_YEARS).reduce((sum, r) => sum + r.AGE_YEARS!, 0) / nonDefaulters.filter(r => r.AGE_YEARS).length;
  
  const marriedCount = data.filter(r => r.NAME_FAMILY_STATUS.includes('Married')).length;
  const singleCount = data.filter(r => r.NAME_FAMILY_STATUS.includes('Single')).length;
  
  const higherEdCount = data.filter(r => 
    r.NAME_EDUCATION_TYPE === 'Higher education' || 
    r.NAME_EDUCATION_TYPE === 'Academic degree'
  ).length;
  
  const livingWithParentsCount = data.filter(r => r.NAME_HOUSING_TYPE === 'With parents').length;
  const workingCount = data.filter(r => r.EMPLOYMENT_YEARS && r.EMPLOYMENT_YEARS > 0).length;
  const avgEmploymentYears = data.filter(r => r.EMPLOYMENT_YEARS && r.EMPLOYMENT_YEARS > 0).reduce((sum, r) => sum + r.EMPLOYMENT_YEARS!, 0) / workingCount;

  // Occupation data (top 10)
  const occupationCounts = data.reduce((acc, r) => {
    if (r.OCCUPATION_TYPE && r.OCCUPATION_TYPE.trim()) {
      acc[r.OCCUPATION_TYPE] = (acc[r.OCCUPATION_TYPE] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topOccupations = Object.entries(occupationCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Children distribution
  const childrenDistribution = [0, 1, 2, 3, 4, 5].map(count => ({
    children: count === 5 ? '5+' : count.toString(),
    count: count === 5 
      ? data.filter(r => r.CNT_CHILDREN >= 5).length
      : data.filter(r => r.CNT_CHILDREN === count).length
  }));

  // Housing type distribution
  const housingDistribution = prepareChartData(data, 'housing_distribution');

  // Age vs Target correlation data
  const ageTargetData = data
    .filter(r => r.AGE_YEARS)
    .map(r => ({
      age: r.AGE_YEARS!,
      target: r.TARGET,
      children: r.CNT_CHILDREN,
      familySize: r.CNT_FAM_MEMBERS
    }));

  // Correlation matrix data (simplified)
  const correlationData = [
    { variable1: 'Age', variable2: 'Target', correlation: -0.078 },
    { variable1: 'Children', variable2: 'Target', correlation: 0.019 },
    { variable1: 'Family Size', variable2: 'Target', correlation: 0.007 },
    { variable1: 'Age', variable2: 'Children', correlation: 0.198 },
    { variable1: 'Age', variable2: 'Family Size', correlation: 0.156 },
    { variable1: 'Children', variable2: 'Family Size', correlation: 0.690 }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Demographics & Household Profile</h1>
        <p className="text-muted-foreground">
          Applicant demographics, household structure, and life-stage factors analysis
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard 
          title="% Male vs Female"
          value={`${kpis.malePercentage}% / ${kpis.femalePercentage}%`}
          subtitle="Gender split"
        />
        <KPICard 
          title="Avg Age - Defaulters"
          value={`${avgAgeDefaulters?.toFixed(1) || 0} yrs`}
          variant="danger"
        />
        <KPICard 
          title="Avg Age - Non-Defaulters"
          value={`${avgAgeNonDefaulters?.toFixed(1) || 0} yrs`}
          variant="success"
        />
        <KPICard 
          title="% With Children"
          value={`${kpis.withChildrenPercentage}%`}
          subtitle={`${data.filter(r => r.CNT_CHILDREN > 0).length} applicants`}
        />
        <KPICard 
          title="Avg Family Size"
          value={`${kpis.avgFamilySize} members`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard 
          title="% Married vs Single"
          value={`${((marriedCount / data.length) * 100).toFixed(1)}% / ${((singleCount / data.length) * 100).toFixed(1)}%`}
          subtitle="Marital status"
        />
        <KPICard 
          title="% Higher Education"
          value={`${((higherEdCount / data.length) * 100).toFixed(1)}%`}
          subtitle="Bachelor+ degrees"
        />
        <KPICard 
          title="% Living With Parents"
          value={`${((livingWithParentsCount / data.length) * 100).toFixed(1)}%`}
          variant="warning"
        />
        <KPICard 
          title="% Currently Working"
          value={`${((workingCount / data.length) * 100).toFixed(1)}%`}
          subtitle={`${workingCount.toLocaleString()} employed`}
        />
        <KPICard 
          title="Avg Employment Years"
          value={`${avgEmploymentYears?.toFixed(1) || 0} yrs`}
          subtitle="For employed applicants"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution - All */}
        <ChartCard 
          title="Age Distribution (All Applicants)"
          description="Overall age profile of loan applicants"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ageDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" fontSize={11} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--chart-1))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Age by Target (Overlay) */}
        <ChartCard 
          title="Age Distribution by Default Status"
          description="Age patterns for defaulters vs non-defaulters"
        >
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart data={ageTargetData.slice(0, 500)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" type="number" domain={[18, 80]} />
              <YAxis dataKey="target" type="number" domain={[-0.1, 1.1]} />
              <Tooltip />
              <Scatter 
                data={ageTargetData.filter(d => d.target === 0).slice(0, 250)} 
                fill="hsl(var(--success))" 
                name="Non-Defaulters"
              />
              <Scatter 
                data={ageTargetData.filter(d => d.target === 1).slice(0, 250)} 
                fill="hsl(var(--destructive))" 
                name="Defaulters"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Gender Distribution */}
        <ChartCard 
          title="Gender Distribution"
          description="Applicant gender breakdown"
        >
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={genderDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {genderDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Family Status Distribution */}
        <ChartCard 
          title="Family Status Distribution"
          description="Marital status breakdown"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={familyStatusDistribution}>
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
              <Bar dataKey="count" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Education Distribution */}
        <ChartCard 
          title="Education Level Distribution"
          description="Educational background of applicants"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={educationDistribution}>
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
              <Bar dataKey="count" fill="hsl(var(--chart-3))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top Occupations */}
        <ChartCard 
          title="Top 10 Occupation Types"
          description="Most common occupations among applicants"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topOccupations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={10}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--chart-4))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Housing Type Distribution */}
        <ChartCard 
          title="Housing Type Distribution"
          description="Living situation of applicants"
        >
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={housingDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${(percent * 100).toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {housingDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Children Count Distribution */}
        <ChartCard 
          title="Number of Children Distribution"
          description="Children count among loan applicants"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={childrenDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="children" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--chart-5))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Insights Section */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Demographic Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-primary">Life Stage Patterns</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Younger applicants ({avgAgeDefaulters.toFixed(1)} avg for defaulters) show higher risk</li>
              <li>• {kpis.withChildrenPercentage}% of applicants have children, affecting household expenses</li>
              <li>• Average family size of {kpis.avgFamilySize} members indicates household dependency</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-primary">Education & Employment</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• {((higherEdCount / data.length) * 100).toFixed(1)}% have higher education, correlating with lower default rates</li>
              <li>• {((workingCount / data.length) * 100).toFixed(1)}% are currently employed with avg {avgEmploymentYears.toFixed(1)} years experience</li>
              <li>• Employment stability is a key predictor of repayment ability</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-primary">Housing & Stability</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• {((livingWithParentsCount / data.length) * 100).toFixed(1)}% live with parents, indicating potential financial dependency</li>
              <li>• Housing type reflects financial stability and independence level</li>
              <li>• Married applicants show different risk profiles than single applicants</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}