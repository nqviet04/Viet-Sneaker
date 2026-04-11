'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, Calendar } from 'lucide-react'

type TimeRange = '7d' | '30d' | '90d' | 'all'

interface TimeRangeSelectorProps {
  value: TimeRange
  onChange: (value: TimeRange) => void
  className?: string
}

const labels: Record<TimeRange, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  'all': 'All time',
}

export function TimeRangeSelector({ value, onChange, className }: TimeRangeSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className={`h-8 text-xs gap-1 ${className}`}
        >
          <Calendar className='h-3 w-3' />
          {labels[value]}
          <ChevronDown className='h-3 w-3 ml-1' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {(Object.keys(labels) as TimeRange[]).map((range) => (
          <DropdownMenuItem
            key={range}
            onClick={() => onChange(range)}
            className={`text-xs ${value === range ? 'bg-gray-100 font-medium' : ''}`}
          >
            {labels[range]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
