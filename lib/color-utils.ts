/**
 * Color matching utilities for visual search.
 * ML service returns CSS color names (red, blue, white).
 * Database stores product colors as standardized names (Black, White, Red).
 */

export interface DetectedColor {
  name: string
  hex: string
  rgb: number[]
  percentage: number
}

type ColorMapping = {
  standard: string
  aliases: string[]
  hexes: string[]
}

/**
 * Standard color names used in the database.
 */
const COLOR_MAPPINGS: ColorMapping[] = [
  {
    standard: 'Black',
    aliases: ['black', 'đen', 'noir'],
    hexes: ['#000000', '#0a0a0a', '#111111', '#1a1a1a'],
  },
  {
    standard: 'White',
    aliases: ['white', 'trắng', 'blanc'],
    hexes: ['#ffffff', '#f8f8f8', '#fafafa', '#fefefe'],
  },
  {
    standard: 'Red',
    aliases: ['red', 'đỏ', 'rouge'],
    hexes: ['#ff0000', '#e53935', '#d32f2f', '#c62828', '#ff4444', '#cc0000'],
  },
  {
    standard: 'Blue',
    aliases: ['blue', 'xanh dương', 'bleu'],
    hexes: ['#0000ff', '#1e88e5', '#1565c0', '#1976d2', '#2196f3', '#0d47a1'],
  },
  {
    standard: 'Navy',
    aliases: ['navy', 'navy blue', 'xanh navy', 'dark blue', 'xanh đậm'],
    hexes: ['#000080', '#001f3f', '#001a33', '#0d1b2a', '#1b263b', '#1a237e'],
  },
  {
    standard: 'Grey',
    aliases: ['grey', 'gray', 'xám', 'gris', 'silver'],
    hexes: ['#808080', '#9e9e9e', '#757575', '#616161', '#bdbdbd', '#c0c0c0', '#a0a0a0'],
  },
  {
    standard: 'Brown',
    aliases: ['brown', 'nâu', 'marron', 'coffee'],
    hexes: ['#795548', '#6d4c41', '#5d4037', '#4e342e', '#8d6e63', '#a1887f'],
  },
  {
    standard: 'Green',
    aliases: ['green', 'xanh lá', 'vert', 'xanh', 'forest green'],
    hexes: ['#008000', '#2e7d32', '#388e3c', '#4caf50', '#43a047', '#1b5e20'],
  },
  {
    standard: 'Orange',
    aliases: ['orange', 'cam'],
    hexes: ['#ff9800', '#f57c00', '#ef6c00', '#e65100', '#ff8f00'],
  },
  {
    standard: 'Pink',
    aliases: ['pink', 'hồng', 'rose'],
    hexes: ['#ff69b4', '#e91e63', '#f06292', '#ec407a', '#ff80ab'],
  },
  {
    standard: 'Purple',
    aliases: ['purple', 'tím', 'violet', 'violet'],
    hexes: ['#800080', '#9c27b0', '#ab47bc', '#7b1fa2', '#6a1b9a'],
  },
  {
    standard: 'Yellow',
    aliases: ['yellow', 'vàng', 'jaune'],
    hexes: ['#ffff00', '#fdd835', '#fbc02d', '#ffeb3b', '#f9a825'],
  },
  {
    standard: 'Beige',
    aliases: ['beige', 'kem', 'cream', 'nude', 'taupe'],
    hexes: ['#f5f5dc', '#d7ccc8', '#efe8d8', '#e8dcc8', '#c9b99a'],
  },
  {
    standard: 'Cream',
    aliases: ['cream', 'off-white'],
    hexes: ['#fffdd0', '#fffaf0', '#f0e68c'],
  },
  {
    standard: 'Burgundy',
    aliases: ['burgundy', 'đỏ rượu', 'maroon', 'wine'],
    hexes: ['#800020', '#722f37', '#6e2c2c', '#4a0404'],
  },
  {
    standard: 'Teal',
    aliases: ['teal', 'xanh ngọc', 'turquoise'],
    hexes: ['#008080', '#009688', '#00796b', '#006064', '#20b2aa'],
  },
  {
    standard: 'Olive',
    aliases: ['olive', 'xanh olive', 'olive green'],
    hexes: ['#808000', '#6b8e23', '#556b2f', '#4a5d23'],
  },
]

/**
 * Normalize a color name for comparison.
 */
function normalize(name: string): string {
  return name.toLowerCase().trim().replace(/[_-]/g, ' ')
}

/**
 * Find the best matching standard color for a detected color.
 * Tries: alias match first, then hex approximation.
 */
export function matchColor(detected: DetectedColor): string | null {
  const normalized = normalize(detected.name)

  // 1. Try exact alias match
  for (const mapping of COLOR_MAPPINGS) {
    if (mapping.aliases.some((alias) => normalize(alias) === normalized)) {
      return mapping.standard
    }
  }

  // 2. Try hex approximation (RGB distance)
  const detectedRgb = detected.rgb
  if (detectedRgb.length >= 3) {
    let bestMatch: { color: string; distance: number } | null = null

    for (const mapping of COLOR_MAPPINGS) {
      for (const hex of mapping.hexes) {
        const mappedRgb = hexToRgb(hex)
        if (!mappedRgb) continue

        const distance = colorDistance(detectedRgb, mappedRgb)
        // Threshold: 50 seems reasonable for "similar enough"
        if (distance < 50) {
          if (!bestMatch || distance < bestMatch.distance) {
            bestMatch = { color: mapping.standard, distance }
          }
        }
      }
    }

    if (bestMatch) return bestMatch.color
  }

  return null
}

/**
 * Convert hex to RGB array [r, g, b].
 */
function hexToRgb(hex: string): number[] | null {
  const clean = hex.replace('#', '')
  if (clean.length !== 6) return null
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ]
}

/**
 * Simple Euclidean distance between two RGB colors.
 */
function colorDistance(a: number[], b: number[]): number {
  return Math.sqrt(
    Math.pow(a[0] - b[0], 2) +
    Math.pow(a[1] - b[1], 2) +
    Math.pow(a[2] - b[2], 2)
  )
}

/**
 * Given detected colors and product colors, return the best-matched product color.
 */
export function findBestMatchingColor(
  detectedColors: DetectedColor[],
  productColors: string[]
): string | undefined {
  if (!detectedColors.length || !productColors.length) return undefined

  // Sort detected colors by percentage (most dominant first)
  const sorted = [...detectedColors].sort((a, b) => b.percentage - a.percentage)

  for (const detected of sorted) {
    const matched = matchColor(detected)
    if (!matched) continue

    // Try exact match first
    const exact = productColors.find(
      (pc) => normalize(pc) === normalize(matched!)
    )
    if (exact) return exact

    // Try partial match (e.g., "Navy Blue" contains "Blue")
    const partial = productColors.find(
      (pc) => normalize(pc).includes(normalize(matched!)) ||
             normalize(matched!).includes(normalize(pc))
    )
    if (partial) return partial
  }

  // Fallback: return first product color
  return productColors[0]
}
