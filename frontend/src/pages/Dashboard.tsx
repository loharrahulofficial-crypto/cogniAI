import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { CompetencyRadar } from '@/components/CompetencyRadar'
import { TrendingUp, AlertTriangle, BookOpen } from 'lucide-react'

const stats = [
  { label: 'Overall Proficiency', value: '3.2 / 5', icon: TrendingUp, trend: '+0.3 this quarter' },
  { label: 'Critical Gaps', value: '3', icon: AlertTriangle, trend: '2 high priority' },
  { label: 'Courses In Progress', value: '2', icon: BookOpen, trend: '1 completing soon' },
]

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Officer. Here's your competency overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Competency Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <CompetencyRadar />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Priority Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'GIS/Remote Sensing', gap: 2, priority: 'HIGH', current: 1, target: 3 },
                { name: 'Statistical Analysis', gap: 2, priority: 'HIGH', current: 2, target: 4 },
                { name: 'Data Governance', gap: 1, priority: 'MED', current: 3, target: 4 },
              ].map((gap) => (
                <div key={gap.name} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{gap.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Level {gap.current} → {gap.target} (gap: {gap.gap})
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      gap.priority === 'HIGH'
                        ? 'bg-danger/10 text-danger'
                        : 'bg-warning/10 text-warning'
                    }`}
                  >
                    {gap.priority}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
