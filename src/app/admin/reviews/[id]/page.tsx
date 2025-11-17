'use client'

import { useParams } from 'next/navigation'
import { AdminWrapper } from '@/components/admin/AdminWrapper'
import { ReviewForm } from '@/components/admin/reviews/ReviewForm'

export default function EditReviewPage() {
  const params = useParams()
  const reviewId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params?.id[0] : undefined

  if (!reviewId) {
    return (
      <AdminWrapper>
        <div className="rounded-lg border border-neutral-200 bg-white p-10 text-center text-neutral-500">
          Review identifier is missing.
        </div>
      </AdminWrapper>
    )
  }

  return (
    <AdminWrapper>
      <ReviewForm mode="edit" reviewId={reviewId} />
    </AdminWrapper>
  )
}
