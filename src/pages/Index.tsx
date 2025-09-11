import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/ui/navigation';
import { FilterSidebar, FilterState } from '@/components/dashboard/FilterSidebar';
import { DataUploader } from '@/components/DataUploader';
import { OverviewPage } from '@/pages/OverviewPage';
import { RiskSegmentationPage } from '@/pages/RiskSegmentationPage';
import { DemographicsPage } from '@/pages/DemographicsPage';
import { FinancialHealthPage } from '@/pages/FinancialHealthPage';
import { HomeCreditRecord, generateCompleteDataset } from '@/lib/synthetic-data';
import { applyFilters } from '@/lib/data-utils';

const Index = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [rawData, setRawData] = useState<HomeCreditRecord[]>([]);
  const [filteredData, setFilteredData] = useState<HomeCreditRecord[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    gender: [],
    education: [],
    familyStatus: [],
    housingType: [],
    ageRange: [18, 80],
    incomeBracket: 'all',
    employmentRange: [0, 40]
  });

  // Load sample data on mount
  useEffect(() => {
    const sampleData = generateCompleteDataset(10000);
    setRawData(sampleData);
    setFilteredData(sampleData);
  }, []);

  // Apply filters whenever filters or raw data change
  useEffect(() => {
    if (rawData.length > 0) {
      const filtered = applyFilters(rawData, filters);
      setFilteredData(filtered);
    }
  }, [rawData, filters]);

  const handleDataLoaded = (data: HomeCreditRecord[]) => {
    setRawData(data);
  };

  const resetFilters = () => {
    setFilters({
      gender: [],
      education: [],
      familyStatus: [],
      housingType: [],
      ageRange: [18, 80],
      incomeBracket: 'all',
      employmentRange: [0, 40]
    });
  };

  const renderContent = () => {
    const dataToUse = filteredData;

    switch (activeTab) {
      case 'overview':
        return <OverviewPage data={dataToUse} />;
      case 'risk':
        return <RiskSegmentationPage data={dataToUse} />;
      case 'demographics':
        return <DemographicsPage data={dataToUse} />;
      case 'financial':
        return <FinancialHealthPage data={dataToUse} />;
      case 'correlations':
        return <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">Correlations & Drivers</h1>
          <p className="text-muted-foreground">Key factors driving default risk - Coming Soon!</p>
        </div>;
      case 'data':
        return <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Data Management</h1>
          <DataUploader onDataLoaded={handleDataLoaded} />
        </div>;
      case 'modeling':
        return <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">Model Training</h1>
          <p className="text-muted-foreground">ML model training interface - Coming Soon!</p>
        </div>;
      default:
        return <OverviewPage data={dataToUse} />;
    }
  };

  // Check if we should show filters (not on data/modeling pages)
  const shouldShowFilters = !['data', 'modeling'].includes(activeTab);

  return (
    <div className="flex h-screen bg-background">
      {/* Navigation Sidebar */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex">
        {/* Filters Sidebar */}
        {shouldShowFilters && (
          <FilterSidebar 
            filters={filters} 
            onFiltersChange={setFilters}
            onReset={resetFilters}
          />
        )}
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {rawData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Welcome to Home Credit Risk Analytics</h2>
                <p className="text-muted-foreground mb-4">
                  Loading sample dataset for demonstration...
                </p>
                <div className="animate-pulse">Loading...</div>
              </div>
            </div>
          ) : (
            <>
              {shouldShowFilters && (
                <div className="bg-muted/50 px-6 py-3 border-b">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Showing {filteredData.length.toLocaleString()} of {rawData.length.toLocaleString()} records
                    </span>
                    {filteredData.length !== rawData.length && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        Filters applied
                      </span>
                    )}
                  </div>
                </div>
              )}
              {renderContent()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
