import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { CompetencyRadar } from '@/components/CompetencyRadar'
import { TrendingUp, AlertTriangle, BookOpen } from 'lucide-react'

// Hardcoded demo officer for now — swap to auth'd user later
const DEMO_OFFICER_ID = '6e5f26b0-1cd8-4669-90db-d9d3f543d2b9'

export function Dashboard() {
  const { data: officer } = useQuery({ queryKey: ['officer', DEMO_OFFICER_ID], queryFn: () => api.officer(DEMO_OFFICER_ID) })
  const { data: gaps } = useQuery({ queryKey: ['gaps', DEMO_OFFICER_ID], queryFn: () => api.gaps(DEMO_OFFICER_ID) })

  const competencies = officer?.competencies ?? []
  const avgProficiency = competencies.length > 0
    ? (competencies.reduce((s, c) => s + c.currentLevel, 0) / competencies.length).toFixed(1)
    : '—'

  const highGaps = gaps?.filter((g) => g.priority === 'HIGH') ?? []
  const medGaps = gaps?.filter((g) => g.priority === 'MED') ?? []

  const stats = [
    { label: 'Overall Proficiency', value: `${avgProficiency} / 5`, icon: TrendingUp, trend: `${competencies.length} competencies tracked` },
    { label: 'Critical Gaps', value: String(highGaps.length + medGaps.length), icon: AlertTriangle, trend: `${highGaps.length} high priority` },
    { label: 'Courses Available', value: String(officer?.competencies?.length ?? 0), icon: BookOpen, trend: 'Mapped to your gaps' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{officer ? `, ${officer.name}` : ''}. Here's your competency overview.
        </p>
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
            <CompetencyRadar competencies={competencies} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Priority Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {gaps && gaps.length > 0 ? gaps.slice(0, 5).map((gap) => (
                <div key={gap.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{gap.competency.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Gap: {gap.gapSize} levels
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      gap.priority === 'HIGH'
                        ? 'bg-danger/10 text-danger'
                        : gap.priority === 'MED'
                        ? 'bg-warning/10 text-warning'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {gap.priority}
                  </span>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">No gaps computed yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
