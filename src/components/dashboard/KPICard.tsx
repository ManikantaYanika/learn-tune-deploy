import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  className?: string
  variant?: "default" | "success" | "warning" | "danger"
}

const variantStyles = {
  default: "border-border",
  success: "border-success/20 bg-success/5",
  warning: "border-warning/20 bg-warning/5", 
  danger: "border-destructive/20 bg-destructive/5"
}

const trendColors = {
  up: "text-success",
  down: "text-destructive",
  neutral: "text-muted-foreground"
}

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendValue, 
  className,
  variant = "default" 
}: KPICardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-hover",
      variantStyles[variant],
      className
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="text-2xl font-bold">{value}</div>
          
          {(subtitle || trend) && (
            <div className="flex items-center justify-between text-sm">
              {subtitle && (
                <span className="text-muted-foreground">{subtitle}</span>
              )}
              
              {trend && trendValue && (
                <div className={cn("flex items-center gap-1", trendColors[trend])}>
                  <TrendIcon className="w-3 h-3" />
                  <span className="text-xs font-medium">{trendValue}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}