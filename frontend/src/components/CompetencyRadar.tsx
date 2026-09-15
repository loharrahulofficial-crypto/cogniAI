import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts'
import type { OfficerCompetency } from '@/lib/api'

interface CompetencyRadarProps {
  competencies?: OfficerCompetency[]
  showTarget?: boolean
}

export function CompetencyRadar({ competencies = [], showTarget = true }: CompetencyRadarProps) {
  const data = competencies.map((oc) => ({
    competency: oc.competency.name.length > 18 ? oc.competency.name.slice(0, 16) + '…' : oc.competency.name,
    current: oc.currentLevel,
    target: oc.targetLevel,
  }))

  if (data.length === 0) {
    return <div className="flex h-[300px] items-center justify-center text-muted-foreground text-sm">No competency data</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="competency" tick={{ fontSize: 11 }} />
        <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
        <Radar name="Current" dataKey="current" stroke="#1B4B91" fill="#1B4B91" fillOpacity={0.3} />
        {showTarget && (
          <Radar name="Target" dataKey="target" stroke="#C4732A" fill="#C4732A" fillOpacity={0.1} />
        )}
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  )
}
