import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { HomeCreditRecord, generateCompleteDataset } from '@/lib/synthetic-data';

interface DataUploaderProps {
  onDataLoaded: (data: HomeCreditRecord[]) => void;
}

export function DataUploader({ onDataLoaded }: DataUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<any[] | null>(null);
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      if (!file.name.endsWith('.csv')) {
        throw new Error('Please upload a CSV file');
      }

      Papa.parse(file, {
        header: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setError(`CSV parsing error: ${results.errors[0].message}`);
            return;
          }

          const data = results.data as any[];
          if (data.length === 0) {
            setError('File appears to be empty');
            return;
          }

          // Validate required columns
          const requiredColumns = ['TARGET', 'CODE_GENDER', 'DAYS_BIRTH', 'AMT_INCOME_TOTAL', 'AMT_CREDIT'];
          const columns = Object.keys(data[0] || {});
          const missingColumns = requiredColumns.filter(col => !columns.includes(col));
          
          if (missingColumns.length > 0) {
            setError(`Missing required columns: ${missingColumns.join(', ')}`);
            return;
          }

          setPreview(data.slice(0, 5));
          setProgress(100);
          setUploading(false);

          // Convert to proper format
          const processedData = data.map((row, index) => ({
            SK_ID_CURR: row.SK_ID_CURR || 100000 + index,
            TARGET: parseInt(row.TARGET) as 0 | 1,
            CODE_GENDER: row.CODE_GENDER,
            DAYS_BIRTH: parseInt(row.DAYS_BIRTH),
            DAYS_EMPLOYED: parseInt(row.DAYS_EMPLOYED || '0'),
            NAME_FAMILY_STATUS: row.NAME_FAMILY_STATUS || 'Unknown',
            CNT_CHILDREN: parseInt(row.CNT_CHILDREN || '0'),
            CNT_FAM_MEMBERS: parseInt(row.CNT_FAM_MEMBERS || '1'),
            NAME_EDUCATION_TYPE: row.NAME_EDUCATION_TYPE || 'Unknown',
            OCCUPATION_TYPE: row.OCCUPATION_TYPE || '',
            NAME_HOUSING_TYPE: row.NAME_HOUSING_TYPE || 'Unknown',
            AMT_INCOME_TOTAL: parseFloat(row.AMT_INCOME_TOTAL),
            AMT_CREDIT: parseFloat(row.AMT_CREDIT),
            AMT_ANNUITY: parseFloat(row.AMT_ANNUITY || '0'),
            AMT_GOODS_PRICE: parseFloat(row.AMT_GOODS_PRICE || '0'),
            NAME_CONTRACT_TYPE: row.NAME_CONTRACT_TYPE || 'Cash loans',
            REGION_RATING_CLIENT: parseInt(row.REGION_RATING_CLIENT || '1'),
            FLAG_OWN_CAR: row.FLAG_OWN_CAR || 'N',
            FLAG_OWN_REALTY: row.FLAG_OWN_REALTY || 'N'
          })) as HomeCreditRecord[];

          onDataLoaded(processedData);
          
          toast({
            title: "Data loaded successfully",
            description: `Loaded ${data.length} records from ${file.name}`,
          });
        },
        error: (error) => {
          setError(`Failed to parse CSV: ${error.message}`);
          setUploading(false);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setUploading(false);
    }
  }, [onDataLoaded, toast]);

  const loadSampleData = () => {
    const sampleData = generateCompleteDataset(10000);
    onDataLoaded(sampleData);
    setPreview(sampleData.slice(0, 5));
    
    toast({
      title: "Sample data loaded",
      description: "Loaded 10,000 synthetic Home Credit records for demonstration",
    });
  };

  const downloadSampleCSV = () => {
    const sampleData = generateCompleteDataset(100);
    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'home_credit_sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Data Upload
          </CardTitle>
          <CardDescription>
            Upload your Home Credit dataset CSV file or use sample data for exploration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drag and Drop Area */}
          <div 
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add('border-primary');
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove('border-primary');
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('border-primary');
              const files = Array.from(e.dataTransfer.files);
              if (files[0]) {
                handleFileUpload(files[0]);
              }
            }}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.csv';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleFileUpload(file);
              };
              input.click();
            }}
          >
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Drop your CSV file here</p>
            <p className="text-sm text-muted-foreground mb-4">
              Or click to browse and select a file
            </p>
            <p className="text-xs text-muted-foreground">
              Supports CSV files with Home Credit schema (TARGET, CODE_GENDER, DAYS_BIRTH, etc.)
            </p>
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success/Preview */}
          {preview && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                File uploaded successfully! Preview of first 5 rows shown below.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <Button onClick={loadSampleData} variant="default">
              Load Sample Data
            </Button>
            <Button onClick={downloadSampleCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Sample CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Preview */}
      {preview && (
        <Card>
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
            <CardDescription>
              First 5 rows of the uploaded dataset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {Object.keys(preview[0] || {}).slice(0, 8).map(key => (
                      <th key={key} className="text-left p-2 font-medium">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, index) => (
                    <tr key={index} className="border-b">
                      {Object.values(row).slice(0, 8).map((value, i) => (
                        <td key={i} className="p-2 text-muted-foreground">
                          {String(value).substring(0, 20)}
                          {String(value).length > 20 ? '...' : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {Object.keys(preview[0] || {}).length > 8 && (
              <p className="text-xs text-muted-foreground mt-2">
                Showing first 8 columns of {Object.keys(preview[0] || {}).length} total columns
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Schema Information */}
      <Card>
        <CardHeader>
          <CardTitle>Expected Schema</CardTitle>
          <CardDescription>
            Required and optional columns for the Home Credit dataset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-primary mb-2">Required Columns</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <code>TARGET</code> - 0 (repaid) or 1 (default)</li>
                <li>• <code>CODE_GENDER</code> - M, F, or XNA</li>
                <li>• <code>DAYS_BIRTH</code> - Age in negative days</li>
                <li>• <code>AMT_INCOME_TOTAL</code> - Annual income</li>
                <li>• <code>AMT_CREDIT</code> - Credit amount</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-primary mb-2">Optional Columns</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <code>NAME_EDUCATION_TYPE</code> - Education level</li>
                <li>• <code>NAME_FAMILY_STATUS</code> - Marital status</li>
                <li>• <code>NAME_HOUSING_TYPE</code> - Housing situation</li>
                <li>• <code>AMT_ANNUITY</code> - Loan annuity</li>
                <li>• <code>DAYS_EMPLOYED</code> - Employment history</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}