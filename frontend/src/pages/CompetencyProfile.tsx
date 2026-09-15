import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { CompetencyRadar } from '@/components/CompetencyRadar'
import { CategoryBadge } from '@/components/CategoryBadge'
import { cn } from '@/lib/utils'

const DEMO_OFFICER_ID = '6e5f26b0-1cd8-4669-90db-d9d3f543d2b9'

function getLevelColor(current: number, target: number) {
  if (current >= target) return 'text-success'
  if (target - current === 1) return 'text-warning'
  return 'text-danger'
}

export function CompetencyProfile() {
  const { data: officer, isLoading } = useQuery({
    queryKey: ['officer', DEMO_OFFICER_ID],
    queryFn: () => api.officer(DEMO_OFFICER_ID),
  })

  const competencies = officer?.competencies ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Competency Profile</h1>
        <p className="text-muted-foreground">
          {officer ? `${officer.name} — ${officer.cadre}, ${officer.division.name}` : 'Loading…'}
        </p>
      </div>

      {isLoading && <p className="text-muted-foreground text-sm">Loading competencies…</p>}

      {!isLoading && (
        <div className="grid gap-6 lg:grid-cols-2">
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
              <CardTitle>Competency Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {competencies.map((oc) => (
                  <div key={oc.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{oc.competency.name}</p>
                        <CategoryBadge category={oc.competency.category} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {oc.competency.subjectTag && `${oc.competency.subjectTag} · `}
                        Source: {oc.evidenceSource.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn('text-lg font-bold', getLevelColor(oc.currentLevel, oc.targetLevel))}>
                        {oc.currentLevel}
                      </p>
                      <p className="text-xs text-muted-foreground">/ {oc.targetLevel}</p>
                    </div>
                  </div>
                ))}
                {competencies.length === 0 && (
                  <p className="text-sm text-muted-foreground">No competency data yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
