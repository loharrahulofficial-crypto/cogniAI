import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export function Placeholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </div>
  )
}