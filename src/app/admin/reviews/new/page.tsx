'use client'

export const dynamic = 'force-dynamic'

import { AdminWrapper } from '@/components/admin/AdminWrapper'
import { ReviewForm } from '@/components/admin/reviews/ReviewForm'

export default function CreateReviewPage() {
  return (
    <AdminWrapper>
      <ReviewForm mode="create" />
    </AdminWrapper>
  )
}
