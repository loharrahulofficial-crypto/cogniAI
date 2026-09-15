import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, Assessment } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, XCircle } from 'lucide-react'

// Hardcoded demo officer for now — swap to auth'd user later
const DEMO_OFFICER_ID = '6e5f26b0-1cd8-4669-90db-d9d3f543d2b9'

export function QuizTaking() {
  const queryClient = useQueryClient()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [startedAt] = useState(() => Date.now())

  const { data, isLoading, isError } = useQuery({
    queryKey: ['quiz', DEMO_OFFICER_ID],
    queryFn: () => api.generateQuiz(DEMO_OFFICER_ID, 10),
  })

  const questions = useMemo(() => {
    if (!data?.questions?.length) return []
    return data.questions.map((q: Assessment) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      explanation: q.explanation,
      competencyId: q.competencyId,
      targetLevel: q.targetLevel,
      bloomLevel: q.bloomLevel,
      rationale: q.rationale,
    }))
  }, [data])

  const submitMutation = useMutation({
    mutationFn: () =>
      api.submitQuiz({
        officerId: DEMO_OFFICER_ID,
        answers: questions.map((q) => ({
          assessmentId: q.id,
          selectedOption: answers[q.id] ?? -1,
          timeTakenMs: Math.round((Date.now() - startedAt) / questions.length),
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gaps', DEMO_OFFICER_ID] })
      queryClient.invalidateQueries({ queryKey: ['recommendations', DEMO_OFFICER_ID] })
      queryClient.invalidateQueries({ queryKey: ['officer', DEMO_OFFICER_ID] })
    },
  })

  if (isLoading) return <p className="text-muted-foreground">Loading questions…</p>
  if (isError) return <p className="text-danger">Failed to load quiz. Check that MCQs are seeded.</p>
  if (questions.length === 0) {
    return (
      <p className="text-muted-foreground">
        No approved MCQs available for your gap competencies yet. Content admin review queue must approve MCQs first.
      </p>
    )
  }

  // Result view
  if (submitMutation.data) {
    const { quizResult, rationale } = submitMutation.data
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quiz Results</h1>
          <p className="text-muted-foreground">{rationale}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {quizResult.score} / {quizResult.maxScore}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Percentage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quizResult.percentage}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Proficiency Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quizResult.proficiencyUpdates.length}</div>
              <p className="text-xs text-muted-foreground">competencies advanced</p>
            </CardContent>
          </Card>
        </div>

        {quizResult.proficiencyUpdates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Before / After Proficiency (Closed Loop)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quizResult.proficiencyUpdates.map((u) => (
                  <div key={u.competencyId} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                    <span className="text-muted-foreground">Level {u.oldLevel}</span>
                    <ChevronRight className="h-4 w-4 text-primary" />
                    <span className="font-medium">Level {u.newLevel}</span>
                    <span className="text-xs text-muted-foreground">
                      (evidence: QUIZ — #{quizResult.results.filter((r) => r.correct).length} correct)
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                Gap model and recommendations re-run automatically — check your dashboard for updated courses.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.map((q, i) => {
                const r = quizResult.results.find((x) => x.assessmentId === q.id)
                return (
                  <div key={q.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium">
                        {i + 1}. {q.question}
                      </p>
                      {r?.correct ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 shrink-0 text-danger" />
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{q.explanation}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const question = questions[currentIdx]!
  const selected = answers[question.id]

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Competency Quiz</h1>
          <p className="text-muted-foreground">
            {questions.length} questions · {data?.competencyNames?.[question.competencyId] ?? 'competency'} · Level {question.targetLevel}
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {currentIdx + 1} / {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${((currentIdx + (selected ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-frac-domain/10 px-2 py-0.5 text-xs font-medium text-frac-domain">
              Bloom: {question.bloomLevel}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              Target level {question.targetLevel}
            </span>
          </div>
          <CardTitle className="mt-3 text-lg leading-snug">{question.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => setAnswers((a) => ({ ...a, [question.id]: i }))}
              className={cn(
                'flex w-full items-start gap-3 rounded-lg border p-4 text-left text-sm transition-colors',
                selected === i
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'hover:border-primary/40 hover:bg-muted'
              )}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {String.fromCharCode(65 + i)}
              </span>
              {option}
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>

        {currentIdx < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIdx((i) => i + 1)}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => submitMutation.mutate()}
            disabled={Object.keys(answers).length < questions.length || submitMutation.isPending}
            className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitMutation.isPending ? 'Submitting…' : `Submit Quiz (${Object.keys(answers).length}/${questions.length})`}
          </button>
        )}
      </div>
    </div>
  )
}