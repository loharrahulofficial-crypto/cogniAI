import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts'

const mockData = [
  { competency: 'Sampling Theory', current: 3, target: 5 },
  { competency: 'Data Collection', current: 4, target: 5 },
  { competency: 'Statistical Analysis', current: 2, target: 4 },
  { competency: 'Report Writing', current: 4, target: 5 },
  { competency: 'GIS/Remote Sensing', current: 1, target: 3 },
  { competency: 'Data Governance', current: 3, target: 4 },
]

interface CompetencyRadarProps {
  showTarget?: boolean
}

export function CompetencyRadar({ showTarget = true }: CompetencyRadarProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={mockData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="competency" tick={{ fontSize: 12 }} />
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
