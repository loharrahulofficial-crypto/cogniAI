import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { CategoryBadge } from '@/components/CategoryBadge'
import { ExternalLink } from 'lucide-react'

export function Courses() {
  const { data: courses, isLoading } = useQuery({ queryKey: ['courses'], queryFn: api.courses })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Recommended Courses</h1>
        <p className="text-muted-foreground">Courses mapped to your competency gaps from iGOT Karmayogi</p>
      </div>

      {isLoading && <p className="text-muted-foreground text-sm">Loading courses…</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {courses?.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{course.name}</CardTitle>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {course.competencies.map((cc) => (
                  <CategoryBadge key={cc.id} category={cc.competency.category} />
                ))}
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {course.competencies.length > 0
                    ? `Level ${Math.min(...course.competencies.map((c) => c.targetLevel))}–${Math.max(...course.competencies.map((c) => c.targetLevel))}`
                    : 'All levels'}
                </span>
                <span>{course.duration}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Source: {course.source} · {course.organisation}
              </p>
              {course.learningOutcome && (
                <p className="text-xs text-muted-foreground italic">{course.learningOutcome}</p>
              )}
            </CardContent>
          </Card>
        ))}
        {!isLoading && courses?.length === 0 && (
          <p className="text-sm text-muted-foreground">No courses available yet.</p>
        )}
      </div>
    </div>
  )
}
