import { AdminWrapper } from '@/components/admin/AdminWrapper'
import { AnalyticsManager } from '@/components/admin/analytics/AnalyticsManager'

export default function AdminAnalyticsPage() {
  return (
    <AdminWrapper>
      <div className="mx-auto max-w-[1400px]">
        <AnalyticsManager />
      </div>
    </AdminWrapper>
  )
}
