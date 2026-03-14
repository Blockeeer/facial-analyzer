import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAnalysisHistory, deleteAnalysisResult } from '../services/api'
import { Calendar, Trash2, Eye, AlertCircle, Dna, Clock, X, Plus, ChevronLeft, ChevronRight } from 'lucide-react'

export default function HistoryPage() {
  const { accessToken } = useAuth()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleting, setDeleting] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    const loadHistory = async () => {
      if (!accessToken) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const data = await getAnalysisHistory(accessToken, page)
        setResults(data.results || [])
        setTotalPages(data.pagination?.pages || 1)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history')
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [accessToken, page])

  const handleDeleteClick = (id) => setDeleteConfirm(id)
  const handleDeleteCancel = () => setDeleteConfirm(null)

  const handleDeleteConfirm = async () => {
    if (!accessToken || !deleteConfirm) return
    const id = deleteConfirm
    setDeleteConfirm(null)
    setDeleting(id)
    try {
      await deleteAnalysisResult(id, accessToken)
      setResults(results.filter((r) => r.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 60) return 'text-amber-400'
    return 'text-red-400'
  }

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-emerald-900/30 border-emerald-700/40'
    if (score >= 60) return 'bg-amber-900/30 border-amber-700/40'
    return 'bg-red-900/30 border-red-700/40'
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="w-16 h-16 rounded-full border-4 border-dark-700"></div>
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-dark-400">Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Analysis History</h1>
            <p className="text-dark-400 mt-1 text-sm">View and manage your past analyses</p>
          </div>
          <Link
            to="/analyze"
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium rounded-xl shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            New Analysis
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {results.length === 0 ? (
          <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl border border-dark-700 p-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-dark-700/50 flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-dark-500" />
            </div>
            <h3 className="text-white font-semibold mb-2">No analyses yet</h3>
            <p className="text-dark-400 text-sm mb-6">Start your first skin analysis to see results here</p>
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium rounded-xl shadow-glow hover:shadow-glow-lg transition-all"
            >
              <Dna className="w-4 h-4" />
              Start Your First Analysis
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="group bg-dark-800/50 backdrop-blur-sm rounded-2xl border border-dark-700 hover:border-primary-600/40 hover:bg-dark-800/70 transition-all duration-200"
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0">
                      {result.imageData ? (
                        <img
                          src={result.imageData}
                          alt="Analysis"
                          className="w-16 h-16 rounded-xl object-cover border-2 border-dark-600 group-hover:border-primary-600/40 transition-colors"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-dark-700 border-2 border-dark-600 flex items-center justify-center">
                          <Dna className="w-6 h-6 text-dark-500" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-dark-400 mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(result.createdAt)}
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        {result.overallScore !== undefined && (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-semibold border ${getScoreBg(result.overallScore)} ${getScoreColor(result.overallScore)}`}>
                            Score: {result.overallScore}%
                          </span>
                        )}
                        {result.mainIssues && result.mainIssues.slice(0, 2).map((issue, index) => (
                          <span
                            key={issue._id || index}
                            className="px-2.5 py-1 bg-dark-700/60 text-dark-300 rounded-lg text-xs border border-dark-600"
                          >
                            {issue.title}
                          </span>
                        ))}
                        {result.mainIssues && result.mainIssues.length > 2 && (
                          <span className="px-2.5 py-1 bg-dark-700/40 text-dark-500 rounded-lg text-xs border border-dark-600">
                            +{result.mainIssues.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        to={`/results/${result.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary-600/10 text-primary-400 font-medium rounded-xl border border-primary-600/30 hover:bg-primary-600/20 hover:text-primary-300 transition-all text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(result.id)}
                        disabled={deleting === result.id}
                        className="p-2 text-dark-500 hover:text-red-400 hover:bg-red-900/20 rounded-xl border border-transparent hover:border-red-700/30 transition-all disabled:opacity-50"
                        title="Delete"
                      >
                        {deleting === result.id ? (
                          <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin block" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 bg-dark-700/50 text-dark-300 rounded-xl border border-dark-600 hover:border-primary-600/50 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-dark-400 text-sm px-2">
                  Page <span className="text-white font-medium">{page}</span> of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 bg-dark-700/50 text-dark-300 rounded-xl border border-dark-600 hover:border-primary-600/50 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleDeleteCancel}
          />
          <div className="relative bg-dark-800 rounded-2xl border border-dark-700 shadow-2xl max-w-sm w-full p-6">
            <button
              onClick={handleDeleteCancel}
              className="absolute top-4 right-4 text-dark-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-900/30 border border-red-700/40 mb-4">
                <Trash2 className="w-7 h-7 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Delete Analysis?</h3>
              <p className="text-dark-400 text-sm mb-6">
                This action cannot be undone. The analysis result will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  className="flex-1 py-2.5 bg-dark-700/50 text-white font-medium rounded-xl border border-dark-600 hover:bg-dark-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
