import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { LucideIcon } from "lucide-react"

interface TaskCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  progress?: number
  subtitle?: string
}

export default function TaskCard({ title, value, icon: Icon, progress, subtitle }: TaskCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
        {progress !== undefined && (
          <Progress 
            value={progress} 
            className="h-2 mt-4" 
          />
        )}
      </CardContent>
    </Card>
  )
}