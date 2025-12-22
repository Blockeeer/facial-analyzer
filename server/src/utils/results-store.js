// Simple in-memory store for development (not used when MongoDB is connected)
// Keeping for backwards compatibility

class ResultsStore {
  constructor() {
    this.store = new Map()
    this.TTL = 60 * 60 * 1000 // 1 hour
  }

  set(id, result) {
    this.store.set(id, result)
    setTimeout(() => {
      this.store.delete(id)
    }, this.TTL)
  }

  get(id) {
    return this.store.get(id)
  }

  delete(id) {
    return this.store.delete(id)
  }

  clear() {
    this.store.clear()
  }
}

export const resultsStore = new ResultsStore()
