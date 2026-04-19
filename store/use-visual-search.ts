'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface VisualSearchResult {
  id: string
  name: string
  price: number
  originalPrice?: number
  images: string[]
  colorImages?: Record<string, string[]> | null
  brand: string
  gender: string
  shoeType: string
  colors: string[]
  stock: number
  similarityScore: number
  finalScore: number
}

export interface MLAnalysis {
  predictedBrand: string
  brandScores: Array<{ brand: string; score: number }>
  dominantColors: Array<{ name: string; hex: string; rgb: number[]; percentage: number }>
  productColors: string[]
  processingTimeMs: number
}

type VisualSearchState = 'idle' | 'analyzing' | 'results' | 'error'

interface VisualSearchStore {
  state: VisualSearchState
  preview: string | null
  results: VisualSearchResult[]
  mlInfo: MLAnalysis | null
  errorMessage: string | null
  retryCount: number

  setPreview: (preview: string | null) => void
  setState: (state: VisualSearchState) => void
  setResults: (results: VisualSearchResult[]) => void
  setMlInfo: (mlInfo: MLAnalysis | null) => void
  setError: (message: string | null) => void
  incrementRetry: () => void
  reset: () => void
}

export const useVisualSearchStore = create<VisualSearchStore>()(
  persist(
    (set) => ({
      state: 'idle',
      preview: null,
      results: [],
      mlInfo: null,
      errorMessage: null,
      retryCount: 0,

      setPreview: (preview) => set({ preview }),

      setState: (state) => set({ state }),

      setResults: (results) => set({ results }),

      setMlInfo: (mlInfo) => set({ mlInfo }),

      setError: (errorMessage) => set({ errorMessage, state: errorMessage ? 'error' : 'idle' }),

      incrementRetry: () => set((s) => ({ retryCount: s.retryCount + 1 })),

      reset: () =>
        set({
          state: 'idle',
          preview: null,
          results: [],
          mlInfo: null,
          errorMessage: null,
          retryCount: 0,
        }),
    }),
    {
      name: 'visual-search-store',
      storage: createJSONStorage(() => localStorage),
      // Don't persist preview (base64 image) - it's too large for localStorage
      // Only persist results and ML info so users can return to see their search results
      partialize: (state) => ({
        state: state.results.length > 0 ? state.state : 'idle',
        preview: null,
        results: state.results,
        mlInfo: state.mlInfo,
        errorMessage: null,
        retryCount: 0,
      }),
    }
  )
)
