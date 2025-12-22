import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAnalysisHistory, deleteAnalysisResult } from '../services/api'
import { Calendar, Trash2, Eye, AlertCircle, Dna, Clock } from 'lucide-react'

export default function HistoryPage() {
  const { accessToken } = useAuth()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleting, setDeleting] = useState(null)

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

  const handleDelete = async (id) => {
    if (!accessToken || !confirm('Are you sure you want to delete this result?')) {
      return
    }

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Analysis History</h1>
            <p className="text-dark-400 mt-1">View and manage your past analyses</p>
          </div>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium rounded-xl shadow-glow hover:shadow-glow-lg transition-all"
          >
            <Dna className="w-4 h-4" />
            New Analysis
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {results.length === 0 ? (
          <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl border border-dark-700 p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-dark-700/50 flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-dark-500" />
            </div>
            <p className="text-dark-400 mb-6">No analysis history yet</p>
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
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="bg-dark-800/50 backdrop-blur-sm rounded-2xl border border-dark-700 p-5 hover:border-primary-600/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Image Thumbnail */}
                    <div className="flex-shrink-0">
                      {result.imageData ? (
                        <img
                          src={result.imageData}
                          alt="Analysis"
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-dark-600"
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-dark-700 border-2 border-dark-600 flex items-center justify-center">
                          <Dna className="w-6 h-6 text-dark-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm text-dark-400 mb-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(result.createdAt)}
                      </div>
                      <div className="flex items-center gap-4">
                        {result.overallScore !== undefined && (
                          <p className="font-medium text-white">
                            Score: <span className="text-primary-400">{result.overallScore}%</span>
                          </p>
                        )}
                      </div>
                      {result.mainIssues && result.mainIssues.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {result.mainIssues.slice(0, 2).map((issue, index) => (
                            <span
                              key={issue._id || index}
                              className="px-2.5 py-1 bg-red-900/30 text-red-400 rounded-lg text-xs border border-red-700/30"
                            >
                              {issue.title}
                            </span>
                          ))}
                          {result.mainIssues.length > 2 && (
                            <span className="px-2.5 py-1 bg-dark-700/50 text-dark-400 rounded-lg text-xs border border-dark-600">
                              +{result.mainIssues.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/results/${result.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-dark-700/50 text-dark-200 font-medium rounded-xl border border-dark-600 hover:border-primary-600/50 hover:text-white transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(result.id)}
                        disabled={deleting === result.id}
                        className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
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
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-dark-700/50 text-dark-200 font-medium rounded-xl border border-dark-600 hover:border-primary-600/50 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-dark-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-dark-700/50 text-dark-200 font-medium rounded-xl border border-dark-600 hover:border-primary-600/50 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
