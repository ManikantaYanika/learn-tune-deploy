import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  Target, 
  Users, 
  DollarSign, 
  TrendingUp,
  Upload,
  Brain,
  Settings
} from "lucide-react"

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navigationItems = [
  {
    id: "overview",
    label: "Overview & Data Quality",
    icon: BarChart3,
    description: "Dataset overview and quality metrics"
  },
  {
    id: "risk",
    label: "Target & Risk Segmentation", 
    icon: Target,
    description: "Default risk analysis by segments"
  },
  {
    id: "demographics",
    label: "Demographics & Household",
    icon: Users,
    description: "Applicant profiles and household factors"
  },
  {
    id: "financial",
    label: "Financial Health",
    icon: DollarSign,
    description: "Income, credit and affordability analysis"
  },
  {
    id: "correlations",
    label: "Correlations & Drivers",
    icon: TrendingUp,
    description: "Key factors driving default risk"
  },
  {
    id: "data",
    label: "Data Management",
    icon: Upload,
    description: "Upload and manage datasets"
  },
  {
    id: "modeling",
    label: "Model Training",
    icon: Brain,
    description: "Train and evaluate ML models"
  }
]

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <div className="w-64 border-r bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Credit Risk</h1>
            <p className="text-xs text-muted-foreground">Analytics Dashboard</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start text-left h-auto p-3",
                  isActive && "bg-primary text-primary-foreground shadow-md"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.label}</div>
                  <div className="text-xs opacity-70 truncate mt-1">
                    {item.description}
                  </div>
                </div>
              </Button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}