import { AnalysisResult } from '../types/index.js'

// Simple in-memory store for development
// In production, use Redis, MongoDB, or another database
class ResultsStore {
  private store: Map<string, AnalysisResult> = new Map()
  private readonly TTL = 60 * 60 * 1000 // 1 hour in milliseconds

  set(id: string, result: AnalysisResult): void {
    this.store.set(id, result)

    // Auto-cleanup after TTL
    setTimeout(() => {
      this.store.delete(id)
    }, this.TTL)
  }

  get(id: string): AnalysisResult | undefined {
    return this.store.get(id)
  }

  delete(id: string): boolean {
    return this.store.delete(id)
  }

  clear(): void {
    this.store.clear()
  }
}

export const resultsStore = new ResultsStore()
