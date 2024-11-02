import React from 'react'
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"

interface Deadline {
  id: number
  title: string
  date: string
}

interface UpcomingDeadlinesListProps {
  deadlines: Deadline[]
}

const UpcomingDeadlinesList: React.FC<UpcomingDeadlinesListProps> = ({ deadlines }) => (
  <Card>
    <CardHeader>
      <CardTitle>🎯 Upcoming Deadlines</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-4">
        {deadlines.map(deadline => (
          <li key={deadline.id} className="flex items-center justify-between">
            <span>{deadline.title}</span>
            <span className="text-sm text-gray-500">
              {new Date(deadline.date).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
)

export default UpcomingDeadlinesList