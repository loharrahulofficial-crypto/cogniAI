import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { Check, Eye, X } from 'lucide-react'

const categoryColors: Record<string, string> = {
  BEHAVIOURAL: 'bg-frac-behavioural/10 text-frac-behavioural',
  DOMAIN: 'bg-frac-domain/10 text-frac-domain',
  FUNCTIONAL: 'bg-frac-functional/10 text-frac-functional',
}

function heatColor(avgGap: number) {
  if (avgGap >= 2.5) return 'bg-red-100 text-red-800'
  if (avgGap >= 1.5) return 'bg-orange-100 text-orange-800'
  if (avgGap >= 0.5) return 'bg-amber-100 text-amber-800'
  return 'bg-green-100 text-green-800'
}

function ReviewQueue() {
  const queryClient = useQueryClient()
  const { data: queue, isLoading } = useQuery({
    queryKey: ['review-queue'],
    queryFn: api.reviewQueue,
  })

  const reviewMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) =>
      action === 'approve' ? api.approveAssessment(id) : api.rejectAssessment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-queue'] })
      queryClient.invalidateQueries({ queryKey: ['quiz'] })
    },
  })

  if (isLoading) return <p className="text-muted-foreground">Loading review queue…</p>

  return (
    <div className="space-y-3">
      {queue && queue.length > 0 ? (
        queue.map((mcq) => (
          <div key={mcq.id} className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', categoryColors[mcq.competency?.category ?? 'DOMAIN'])}>
                    {mcq.competency?.name ?? 'Unknown competency'}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    Level {mcq.targetLevel} · Bloom: {mcq.bloomLevel}
                  </span>
                  {mcq.sourceDocumentChunkId && (
                    <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" /> sourced
                    </span>
                  )}
                </div>
                <p className="mt-2 font-medium">{mcq.question}</p>
                <ul className="mt-2 space-y-1">
                  {mcq.options.map((opt, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                      {i === mcq.correctAnswer && (
                        <Check className="h-3.5 w-3.5 text-success" />
                      )}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 rounded-lg bg-muted p-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Rationale: </span>
                  {mcq.rationale}
                </p>
                {mcq.explanation && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Explanation: </span>
                    {mcq.explanation}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <button
                  onClick={() => reviewMutation.mutate({ id: mcq.id, action: 'approve' })}
                  disabled={reviewMutation.isPending}
                  className="flex items-center gap-2 rounded-md bg-success px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  <Check className="h-4 w-4" /> Approve
                </button>
                <button
                  onClick={() => reviewMutation.mutate({ id: mcq.id, action: 'reject' })}
                  disabled={reviewMutation.isPending}
                  className="flex items-center gap-2 rounded-md border border-danger/30 px-3 py-1.5 text-sm font-medium text-danger disabled:opacity-50"
                >
                  <X className="h-4 w-4" /> Reject
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">
          Review queue is empty — every pending MCQ is now approved or rejected. All changes are written to the audit log.
        </p>
      )}
    </div>
  )
}

function DivisionHeatmap() {
  const { data: divisions } = useQuery({ queryKey: ['divisions'], queryFn: api.divisions })
  const [selectedDivision, setSelectedDivision] = useState<string>(divisions?.[0]?.id ?? '')

  const { data: heatmap } = useQuery({
    queryKey: ['heatmap', selectedDivision],
    queryFn: () => api.heatmap(selectedDivision),
    enabled: !!selectedDivision,
  })

  const division = divisions?.find((d) => d.id === selectedDivision)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label htmlFor="division" className="text-sm font-medium">Division:</label>
        <select
          id="division"
          value={selectedDivision}
          onChange={(e) => setSelectedDivision(e.target.value)}
          className="rounded-md border bg-background px-3 py-1.5 text-sm"
        >
          {divisions?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {division?.code ?? ''} · NSS/Statistics wing
        </span>
      </div>

      {heatmap && heatmap.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {heatmap.map((entry) => (
            <div key={entry.competency.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', categoryColors[entry.competency.category])}>
                  {entry.competency.category}
                </span>
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', heatColor(entry.avgGap))}>
                  avg gap {entry.avgGap.toFixed(1)}
                </span>
              </div>
              <p className="mt-2 font-medium">{entry.competency.name}</p>
              <div className="mt-3 space-y-1">
                {entry.gaps.map((g) => (
                  <div key={g.officerId} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{g.officer.name}</span>
                    <span className={cn('font-medium', g.gapSize >= 2 ? 'text-danger' : 'text-warning')}>
                      +{g.gapSize}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No gaps for this division yet.</p>
      )}
    </div>
  )
}

export function Admin() {
  const [tab, setTab] = useState<'heatmap' | 'review'>('heatmap')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Division Admin</h1>
        <p className="text-muted-foreground">
          Division heatmap, AI-generated MCQ review, and forecasting.
        </p>
      </div>

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setTab('heatmap')}
          className={cn(
            'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
            tab === 'heatmap'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Division Heatmap
        </button>
        <button
          onClick={() => setTab('review')}
          className={cn(
            'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
            tab === 'review'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          MCQ Review Queue
        </button>
      </div>

      <dl className="grid gap-4 text-sm md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Division</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{'Field Operations Division'}</p>
            <p className="text-xs text-muted-foreground">FOD — demo division</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Training Nominees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">—</p>
            <p className="text-xs text-muted-foreground">Pending auth integration</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">ACBP Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">Draft</p>
            <p className="text-xs text-muted-foreground">Auto-draft after auth</p>
          </CardContent>
        </Card>
      </dl>

      {tab === 'heatmap' ? <DivisionHeatmap /> : <ReviewQueue />}
    </div>
  )
}