'use client'

import { Label } from '@/components/ui/label'
import { Check } from 'lucide-react'

const COLOR_CONFIG: Record<string, { label: string; bg: string; border?: string }> = {
  black:   { label: 'Black',   bg: 'bg-neutral-900' },
  white:   { label: 'White',   bg: 'bg-white', border: 'border-gray-300' },
  red:     { label: 'Red',      bg: 'bg-red-500' },
  blue:    { label: 'Blue',     bg: 'bg-blue-500' },
  green:   { label: 'Green',   bg: 'bg-green-500' },
  gray:    { label: 'Gray',     bg: 'bg-gray-500' },
  grey:    { label: 'Grey',    bg: 'bg-gray-400' },
  brown:   { label: 'Brown',   bg: 'bg-amber-800' },
  pink:    { label: 'Pink',    bg: 'bg-pink-400' },
  yellow:  { label: 'Yellow',   bg: 'bg-yellow-400' },
  orange:  { label: 'Orange',   bg: 'bg-orange-500' },
  purple:  { label: 'Purple',   bg: 'bg-purple-500' },
  navy:    { label: 'Navy',    bg: 'bg-blue-900' },
  cream:   { label: 'Cream',   bg: 'bg-amber-100' },
  beige:   { label: 'Beige',   bg: 'bg-stone-200' },
  tan:     { label: 'Tan',     bg: 'bg-amber-200' },
  burgundy:{ label: 'Burgundy',bg: 'bg-red-900' },
  olive:   { label: 'Olive',   bg: 'bg-green-800' },
  cobalt:  { label: 'Cobalt',  bg: 'bg-blue-600' },
  coral:   { label: 'Coral',   bg: 'bg-rose-400' },
  silver:  { label: 'Silver',  bg: 'bg-slate-300' },
  gold:    { label: 'Gold',    bg: 'bg-yellow-500' },
  teal:    { label: 'Teal',    bg: 'bg-teal-500' },
  ivory:   { label: 'Ivory',   bg: 'bg-amber-50', border: 'border-gray-200' },
  mint:    { label: 'Mint',    bg: 'bg-emerald-300' },
  salmon:  { label: 'Salmon',  bg: 'bg-orange-300' },
  sky:     { label: 'Sky',     bg: 'bg-sky-400' },
  lime:    { label: 'Lime',    bg: 'bg-lime-400' },
  maroon:  { label: 'Maroon',  bg: 'bg-red-800' },
  khaki:   { label: 'Khaki',   bg: 'bg-stone-400' },
  sand:    { label: 'Sand',    bg: 'bg-stone-300' },
  denim:   { label: 'Denim',   bg: 'bg-blue-700' },
}

interface ColorSelectorProps {
  availableColors: string[]
  selectedColor: string
  onColorChange: (color: string) => void
  error?: boolean
}

export function ColorSelector({
  availableColors,
  selectedColor,
  onColorChange,
  error,
}: ColorSelectorProps) {
  if (availableColors.length === 0) {
    return null
  }

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <Label className={error ? 'text-red-500' : ''}>
          Màu sắc
          {error && (
            <span className='text-xs text-red-500 ml-2'>
              Vui lòng chọn màu sắc
            </span>
          )}
        </Label>
        {selectedColor && (
          <span className='text-sm text-muted-foreground'>
            ({COLOR_CONFIG[selectedColor]?.label || selectedColor})
          </span>
        )}
      </div>

      <div className='flex flex-wrap gap-3'>
        {availableColors.map((color) => {
          const config = COLOR_CONFIG[color.toLowerCase()] || {
            label: color,
            bg: 'bg-gray-400',
          }
          const isSelected = selectedColor === color.toLowerCase()

          return (
            <button
              key={color}
              type='button'
              onClick={() => onColorChange(color.toLowerCase())}
              className={`
                relative w-10 h-10 rounded-full border-2 transition-all duration-150
                flex items-center justify-center
                ${config.border || 'border-transparent'}
                ${isSelected
                  ? 'ring-2 ring-offset-2 ring-black scale-110'
                  : 'hover:scale-105 hover:ring-2 hover:ring-offset-1 hover:ring-gray-300'
                }
              `}
              style={{ backgroundColor: getComputedColor(color) }}
              title={config.label}
              aria-label={`Select ${config.label} color`}
            >
              {isSelected && (
                <Check
                  className={`h-5 w-5 ${
                    isLightColor(color) ? 'text-gray-800' : 'text-white'
                  }`}
                />
              )}
            </button>
          )
        })}
      </div>

      {selectedColor && (
        <p className='text-sm text-muted-foreground'>
          Đã chọn màu:{' '}
          <span className='font-medium text-foreground'>
            {COLOR_CONFIG[selectedColor]?.label || selectedColor}
          </span>
        </p>
      )}
    </div>
  )
}

function getComputedColor(color: string): string {
  const colorLower = color.toLowerCase()
  const config = COLOR_CONFIG[colorLower]
  if (!config) {
    if (colorLower.startsWith('#')) return colorLower
    if (/^\d+,\d+,\d+$/.test(colorLower)) {
      return `rgb(${colorLower})`
    }
    return '#9ca3af'
  }
  const tailwindToHex: Record<string, string> = {
    'bg-neutral-900': '#171717',
    'bg-white': '#ffffff',
    'bg-red-500': '#ef4444',
    'bg-red-900': '#7f1d1d',
    'bg-red-800': '#991b1b',
    'bg-red-400': '#fb7185',
    'bg-red-300': '#fca5a5',
    'bg-blue-500': '#3b82f6',
    'bg-blue-600': '#2563eb',
    'bg-blue-700': '#1d4ed8',
    'bg-blue-900': '#1e3a8a',
    'bg-blue-400': '#60a5fa',
    'bg-green-500': '#22c55e',
    'bg-green-800': '#166534',
    'bg-green-400': '#4ade80',
    'bg-gray-500': '#6b7280',
    'bg-gray-400': '#9ca3af',
    'bg-gray-300': '#d1d5db',
    'bg-amber-800': '#92400e',
    'bg-amber-200': '#fde68a',
    'bg-amber-100': '#fef3c7',
    'bg-amber-50': '#fffbeb',
    'bg-pink-400': '#f472b6',
    'bg-yellow-400': '#facc15',
    'bg-yellow-500': '#eab308',
    'bg-orange-500': '#f97316',
    'bg-orange-400': '#fb923c',
    'bg-orange-300': '#fdba74',
    'bg-purple-500': '#a855f7',
    'bg-slate-300': '#cbd5e1',
    'bg-stone-200': '#e7e5e4',
    'bg-stone-300': '#d6d3d1',
    'bg-stone-400': '#a8a29e',
    'bg-emerald-300': '#6ee7b7',
    'bg-teal-500': '#14b8a6',
    'bg-rose-400': '#fb7185',
    'bg-lime-400': '#a3e635',
    'bg-sky-400': '#38bdf8',
  }
  return tailwindToHex[config.bg] || '#9ca3af'
}

function isLightColor(color: string): boolean {
  const lightColors = [
    'white', 'cream', 'beige', 'ivory', 'yellow', 'pink', 'orange', 'tan', 'sand',
    'silver', 'gold', 'light-gray', 'light-grey', 'sky', 'mint', 'salmon', 'lime',
    'coral', 'peach', 'lavender', 'light-blue', 'light-green', 'light-pink', 'light-yellow',
  ]
  return lightColors.includes(color.toLowerCase()) || isLightHex(color)
}

function isLightHex(color: string): boolean {
  if (!color.startsWith('#')) return false
  try {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 155
  } catch {
    return false
  }
}
