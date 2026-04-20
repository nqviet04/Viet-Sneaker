'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Star, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: Date
  user: {
    name: string | null
    image: string | null
  }
}

interface ProductReviewsProps {
  productId: string
  reviews: Review[]
}

export function ProductReviews({ productId, reviews }: ProductReviewsProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          rating,
          comment,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to submit review')
      }

      setShowThankYou(true)
      setTimeout(() => {
        router.refresh()
        setShowThankYou(false)
        setRating(5)
        setComment('')
      }, 2000)
    } catch (error) {
      setErrorMessage((error as Error).message || 'Đã xảy ra lỗi khi gửi đánh giá')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='space-y-8'>
      <h2 className='text-2xl font-bold'>Đánh giá của khách hàng</h2>

      {/* Review Form */}
      {showThankYou ? (
        <div className='flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg'>
          <CheckCircle className='w-6 h-6 text-green-500' />
          <div>
            <p className='font-medium text-green-700'>Cảm ơn bạn đã đánh giá!</p>
            <p className='text-sm text-green-600'>Đánh giá của bạn sẽ được hiển thị sau khi duyệt.</p>
          </div>
        </div>
      ) : session ? (
        <form onSubmit={handleSubmitReview} className='space-y-4'>
          <div>
            <div className='text-sm font-medium mb-2'>Your Rating</div>
            <div className='flex gap-1'>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type='button'
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className='focus:outline-none transition-transform hover:scale-110'
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-muted text-muted'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className='text-sm font-medium mb-2'>Your Review</div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder='Write your review here...'
              required
            />
          </div>

          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>

          {errorMessage && (
            <p className='text-sm text-red-500'>{errorMessage}</p>
          )}
        </form>
      ) : (
        <div className='bg-muted p-4 rounded-lg'>
          <p>Please sign in to leave a review.</p>
        </div>
      )}

      {/* Reviews List */}
      <div className='space-y-6'>
        {reviews.length === 0 ? (
          <p className='text-muted-foreground'>Chưa có đánh giá nào.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Avatar>
                  <AvatarImage src={review.user.image || undefined} />
                  <AvatarFallback>
                    {review.user.name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className='font-medium'>{review.user.name}</div>
                  <div className='text-sm text-muted-foreground'>
                    {formatDistanceToNow(new Date(review.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>

              <div className='flex gap-1'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>

              {review.comment && <p className='text-sm'>{review.comment}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
