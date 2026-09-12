import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ActivityItem } from '@/features/dashboard/types'

interface RecentActivityTableProps {
  activities: ActivityItem[]
}

export function RecentActivityTable({ activities }: RecentActivityTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>담당자</TableHead>
          <TableHead>활동</TableHead>
          <TableHead>대상</TableHead>
          <TableHead className="text-right">시각</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activities.map((activity) => (
          <TableRow key={activity.id}>
            <TableCell className="font-medium">{activity.actor}</TableCell>
            <TableCell>{activity.action}</TableCell>
            <TableCell>{activity.target}</TableCell>
            <TableCell className="text-right text-muted-foreground">
              {activity.createdAt}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
