import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { CompetencyRadar } from '@/components/CompetencyRadar'
import { CategoryBadge } from '@/components/CategoryBadge'
import { cn } from '@/lib/utils'

const competencies = [
  { name: 'Sampling Theory', category: 'DOMAIN' as const, current: 3, target: 5, lastAssessed: '2025-01-15' },
  { name: 'Data Collection Design', category: 'FUNCTIONAL' as const, current: 4, target: 5, lastAssessed: '2025-01-10' },
  { name: 'Statistical Analysis', category: 'DOMAIN' as const, current: 2, target: 4, lastAssessed: '2025-01-12' },
  { name: 'Report Writing', category: 'FUNCTIONAL' as const, current: 4, target: 5, lastAssessed: '2025-01-08' },
  { name: 'GIS/Remote Sensing', category: 'DOMAIN' as const, current: 1, target: 3, lastAssessed: '2025-01-05' },
  { name: 'Data Governance', category: 'FUNCTIONAL' as const, current: 3, target: 4, lastAssessed: '2025-01-14' },
  { name: 'Stakeholder Communication', category: 'BEHAVIOURAL' as const, current: 4, target: 5, lastAssessed: '2025-01-11' },
  { name: 'Ethical Decision Making', category: 'BEHAVIOURAL' as const, current: 5, target: 5, lastAssessed: '2025-01-09' },
]

function getLevelColor(current: number, target: number) {
  if (current >= target) return 'text-success'
  if (target - current === 1) return 'text-warning'
  return 'text-danger'
}

export function CompetencyProfile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Competency Profile</h1>
        <p className="text-muted-foreground">Your FRAC competency assessment — SSU–Grade 2, Survey Operations</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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
            <CardTitle>Competency Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {competencies.map((c) => (
                <div key={c.name} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{c.name}</p>
                      <CategoryBadge category={c.category} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Last assessed: {c.lastAssessed}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-lg font-bold', getLevelColor(c.current, c.target))}>
                      {c.current}
                    </p>
                    <p className="text-xs text-muted-foreground">/ {c.target}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
