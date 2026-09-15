import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { CategoryBadge } from '@/components/CategoryBadge'
import { ExternalLink } from 'lucide-react'

const courses = [
  {
    id: 'do_1138807022249635841370',
    name: 'Sampling Theory and Practice',
    competencies: ['Sampling Theory'],
    level: 'Level 3-4',
    source: 'NSSTA TPAC',
    duration: '8h',
  },
  {
    id: 'do_1138807022249635841371',
    name: 'Advanced Statistical Methods',
    competencies: ['Statistical Analysis'],
    level: 'Level 3-4',
    source: 'iGOT Karmayogi',
    duration: '12h',
  },
  {
    id: 'do_1138807022249635841372',
    name: 'GIS Fundamentals for Surveys',
    competencies: ['GIS/Remote Sensing'],
    level: 'Level 2-3',
    source: 'iGOT Karmayogi',
    duration: '10h',
  },
  {
    id: 'do_1138807022249635841373',
    name: 'Data Governance Framework',
    competencies: ['Data Governance'],
    level: 'Level 4',
    source: 'NSSTA TPAC',
    duration: '6h',
  },
]

export function Courses() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Recommended Courses</h1>
        <p className="text-muted-foreground">Courses mapped to your competency gaps from iGOT Karmayogi</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{course.name}</CardTitle>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {course.competencies.map((c) => (
                  <CategoryBadge key={c} category="DOMAIN" />
                ))}
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Target: {course.level}</span>
                <span>{course.duration}</span>
              </div>
              <p className="text-xs text-muted-foreground">Source: {course.source}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
