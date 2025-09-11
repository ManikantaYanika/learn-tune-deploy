import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { RotateCcw } from "lucide-react"

export interface FilterState {
  gender: string[]
  education: string[]
  familyStatus: string[]
  housingType: string[]
  ageRange: [number, number]
  incomeBracket: string
  employmentRange: [number, number]
}

interface FilterSidebarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onReset: () => void
}

const genderOptions = ["M", "F", "XNA"]
const educationOptions = [
  "Secondary / secondary special",
  "Higher education", 
  "Incomplete higher",
  "Lower secondary",
  "Academic degree"
]
const familyStatusOptions = [
  "Married",
  "Single / not married",
  "Civil marriage",
  "Separated",
  "Widow"
]
const housingTypeOptions = [
  "House / apartment",
  "With parents",
  "Municipal apartment",
  "Rented apartment",
  "Office apartment",
  "Co-op apartment"
]
const incomeBracketOptions = [
  { value: "all", label: "All Income Levels" },
  { value: "low", label: "Low (Q1)" },
  { value: "mid", label: "Mid (Q2-Q3)" },
  { value: "high", label: "High (Q4)" }
]

export function FilterSidebar({ filters, onFiltersChange, onReset }: FilterSidebarProps) {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const toggleArrayFilter = (key: "gender" | "education" | "familyStatus" | "housingType", value: string) => {
    const current = filters[key]
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value]
    updateFilter(key, updated)
  }

  return (
    <div className="w-80 border-r bg-card/50 backdrop-blur p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="h-8 px-2 text-xs"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Reset
        </Button>
      </div>

      <div className="space-y-6">
        {/* Gender Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Gender</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {genderOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`gender-${option}`}
                  checked={filters.gender.includes(option)}
                  onCheckedChange={() => toggleArrayFilter("gender", option)}
                />
                <Label htmlFor={`gender-${option}`} className="text-sm">
                  {option === "XNA" ? "Not Specified" : option === "M" ? "Male" : "Female"}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Age Range */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Age Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Slider
                value={filters.ageRange}
                onValueChange={(value) => updateFilter("ageRange", value as [number, number])}
                min={18}
                max={80}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{filters.ageRange[0]} years</span>
                <span>{filters.ageRange[1]} years</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Income Bracket */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Income Bracket</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={filters.incomeBracket}
              onValueChange={(value) => updateFilter("incomeBracket", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {incomeBracketOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Employment Range */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Employment Years</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Slider
                value={filters.employmentRange}
                onValueChange={(value) => updateFilter("employmentRange", value as [number, number])}
                min={0}
                max={40}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{filters.employmentRange[0]} years</span>
                <span>{filters.employmentRange[1]} years</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Education Level</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-40 overflow-y-auto">
            {educationOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`education-${option}`}
                  checked={filters.education.includes(option)}
                  onCheckedChange={() => toggleArrayFilter("education", option)}
                />
                <Label htmlFor={`education-${option}`} className="text-xs leading-tight">
                  {option}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Family Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Family Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {familyStatusOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`family-${option}`}
                  checked={filters.familyStatus.includes(option)}
                  onCheckedChange={() => toggleArrayFilter("familyStatus", option)}
                />
                <Label htmlFor={`family-${option}`} className="text-xs">
                  {option}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Housing Type */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Housing Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-40 overflow-y-auto">
            {housingTypeOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`housing-${option}`}
                  checked={filters.housingType.includes(option)}
                  onCheckedChange={() => toggleArrayFilter("housingType", option)}
                />
                <Label htmlFor={`housing-${option}`} className="text-xs">
                  {option}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}