'use client'

import { Badge } from '@/components/ui/badge'
import { Brand } from '@prisma/client'

// Brand display configuration
const BRAND_CONFIG: Record<Brand, { label: string; className: string }> = {
  NIKE: {
    label: 'Nike',
    className: 'bg-black text-white hover:bg-black/90',
  },
  ADIDAS: {
    label: 'Adidas',
    className: 'bg-blue-600 text-white hover:bg-blue-600/90',
  },
  PUMA: {
    label: 'Puma',
    className: 'bg-red-500 text-white hover:bg-red-500/90',
  },
  NEW_BALANCE: {
    label: 'New Balance',
    className: 'bg-orange-500 text-white hover:bg-orange-500/90',
  },
  CONVERSE: {
    label: 'Converse',
    className: 'bg-red-600 text-white hover:bg-red-600/90',
  },
  VANS: {
    label: 'Vans',
    className: 'bg-neutral-800 text-white hover:bg-neutral-800/90',
  },
}

interface BrandBadgeProps {
  brand: Brand | string
  size?: 'sm' | 'default'
  showLogo?: boolean
}

export function BrandBadge({ brand, size = 'default', showLogo = false }: BrandBadgeProps) {
  const config = BRAND_CONFIG[brand as Brand]

  if (!config) {
    return (
      <Badge
        variant='outline'
        className={`${
          size === 'sm' ? 'text-xs px-1.5 py-0' : 'text-xs'
        }`}
      >
        {brand}
      </Badge>
    )
  }

  return (
    <Badge
      className={`
        ${config.className}
        ${size === 'sm' ? 'text-[10px] px-1.5 py-0 font-bold tracking-wider' : 'text-xs font-bold tracking-wider uppercase'}
        border-0
      `}
    >
      {showLogo ? (
        <BrandLogo brand={brand} />
      ) : (
        config.label
      )}
    </Badge>
  )
}

// Simple brand logo using text (SVG logos would be more complex)
function BrandLogo({ brand }: { brand: string }) {
  const logos: Record<string, string> = {
    NIKE: '√',
    ADIDAS: 'Adidas',
    PUMA: 'P',
    NEW_BALANCE: 'NB',
    CONVERSE: '★',
    VANS: 'V',
  }
  return <span>{logos[brand] || brand}</span>
}

// Gender badge
const GENDER_CONFIG: Record<string, { label: string; className: string }> = {
  MEN: { label: 'Men', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80' },
  WOMEN: { label: 'Women', className: 'bg-pink-100 text-pink-800 hover:bg-pink-100/80' },
  UNISEX: { label: 'Unisex', className: 'bg-purple-100 text-purple-800 hover:bg-purple-100/80' },
}

interface GenderBadgeProps {
  gender: string
  size?: 'sm' | 'default'
}

export function GenderBadge({ gender, size = 'default' }: GenderBadgeProps) {
  const config = GENDER_CONFIG[gender]

  if (!config) {
    return (
      <Badge variant='secondary' className={size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs'}>
        {gender}
      </Badge>
    )
  }

  return (
    <Badge
      className={`
        ${config.className}
        ${size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs'}
      `}
    >
      {config.label}
    </Badge>
  )
}

// Shoe type badge
const SHOE_TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  RUNNING: { label: 'Running', className: 'bg-green-100 text-green-800' },
  CASUAL: { label: 'Casual', className: 'bg-gray-100 text-gray-800' },
  BOOTS: { label: 'Boots', className: 'bg-amber-100 text-amber-800' },
  FORMAL: { label: 'Formal', className: 'bg-slate-100 text-slate-800' },
  SLIPPERS: { label: 'Slippers', className: 'bg-rose-100 text-rose-800' },
  BASKETBALL: { label: 'Basketball', className: 'bg-orange-100 text-orange-800' },
  SKATEBOARDING: { label: 'Skateboarding', className: 'bg-indigo-100 text-indigo-800' },
  TRAINING: { label: 'Training', className: 'bg-cyan-100 text-cyan-800' },
  HIKING: { label: 'Hiking', className: 'bg-lime-100 text-lime-800' },
}

interface ShoeTypeBadgeProps {
  shoeType: string
  size?: 'sm' | 'default'
}

export function ShoeTypeBadge({ shoeType, size = 'default' }: ShoeTypeBadgeProps) {
  const config = SHOE_TYPE_CONFIG[shoeType]

  if (!config) {
    return (
      <Badge variant='secondary' className={size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs'}>
        {shoeType}
      </Badge>
    )
  }

  return (
    <Badge
      className={`
        ${config.className}
        ${size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs'}
      `}
    >
      {config.label}
    </Badge>
  )
}
