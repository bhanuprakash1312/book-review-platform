import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import { fetchBookById } from "../api/gutendex"
import ReviewSection from "../components/ReviewSection"

function cleanGutenbergText(rawText) {
  const startMarker = "*** START OF THIS PROJECT GUTENBERG EBOOK"
  const endMarker = "*** END OF THIS PROJECT GUTENBERG EBOOK"

  const startIndex = rawText.indexOf(startMarker)
  const endIndex = rawText.indexOf(endMarker)

  if (startIndex !== -1 && endIndex !== -1) {
    return rawText.substring(startIndex + startMarker.length, endIndex).trim()
  }
  return rawText
}

function estimateReadingTime(text) {
  const wordsPerMinute = 200
  const words = text.split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

function detectChapters(text) {
  const chapterRegex = /^(CHAPTER|Chapter|chapter)\s+([IVXLCDM]+|\d+)/gm
  const matches = []
  let match

  while ((match = chapterRegex.exec(text)) !== null) {
    matches.push({
      title: match[0],
      position: match.index,
      line: text.substring(0, match.index).split("\n").length,
    })
  }

  return matches
}

export default function BookPage() {
  const { id } = useParams()
  const [book, setBook] = useState(null)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [contentLoading, setContentLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fontSize, setFontSize] = useState(16)
  const [lineHeight, setLineHeight] = useState(1.6)
  const [readingProgress, setReadingProgress] = useState(0)
  const [chapters, setChapters] = useState([])
  const [showControls, setShowControls] = useState(false)
  const [readingTime, setReadingTime] = useState(0)
  const [wordsRead, setWordsRead] = useState(0)
  const contentRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    fetchBookById(id)
      .then((data) => {
        setBook(data)
        setLoading(false)

        const txtUrl =
          data.formats["text/plain; charset=utf-8"] ||
          data.formats["text/plain; charset=us-ascii"] ||
          data.formats["text/plain"]

        if (txtUrl) {
          setContentLoading(true)
          fetch(`${import.meta.env.VITE_API_URL}/api/gutenberg/${id}`)
            .then((res) => res.text())
            .then((rawText) => {
              const cleaned = cleanGutenbergText(rawText)
              setContent(cleaned)
              setReadingTime(estimateReadingTime(cleaned))
              setChapters(detectChapters(cleaned))
              setContentLoading(false)
            })
            .catch((err) => {
              console.error("Failed to fetch book content:", err)
              setContent("Failed to load book content.")
              setContentLoading(false)
            })
        } else {
          setContent("No plain text content available for this book.")
        }
      })
      .catch(() => {
        setError("Failed to fetch book data.")
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100
        setReadingProgress(Math.min(progress, 100))

        // Estimate words read based on scroll position
        const totalWords = content.split(/\s+/).length
        const wordsReadEstimate = Math.floor((progress / 100) * totalWords)
        setWordsRead(wordsReadEstimate)
      }
    }

    const contentElement = contentRef.current
    if (contentElement) {
      contentElement.addEventListener("scroll", handleScroll)
      return () => contentElement.removeEventListener("scroll", handleScroll)
    }
  }, [content])

  const scrollToChapter = (position) => {
    if (contentRef.current) {
      const lines = content.substring(0, position).split("\n").length
      const lineHeight = fontSize * 1.6
      const scrollPosition = lines * lineHeight
      contentRef.current.scrollTop = scrollPosition
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-800 text-lg font-medium">Loading book details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-6xl mb-4">📚</div>
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-amber-200 z-50">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        ></div>
      </div>

      {/* Header */}
      <div className="bg-white shadow-lg border-b border-amber-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2 leading-tight">{book.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <span className="flex items-center gap-2">
                  <span className="text-amber-500">✍️</span>
                  <strong>Author:</strong> {book.authors[0]?.name || "Unknown"}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-green-500">📥</span>
                  <strong>Downloads:</strong> {book.download_count?.toLocaleString()}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-blue-500">⏱️</span>
                  <strong>Est. Reading Time:</strong> {readingTime} minutes
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowControls(!showControls)}
                className="px-4 py-2 bg-amber-500 cursor-pointer hover:bg-amber-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <span>⚙️</span>
                Reading Controls
              </button>
            </div>
          </div>

          {/* Reading Stats */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="bg-amber-100 px-3 py-1 rounded-full">Progress: {readingProgress.toFixed(1)}%</span>
            <span className="bg-green-100 px-3 py-1 rounded-full">Words read: ~{wordsRead.toLocaleString()}</span>
            {chapters.length > 0 && (
              <span className="bg-blue-100 px-3 py-1 rounded-full">{chapters.length} chapters detected</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block w-80 space-y-6">
            {/* Reading Controls */}
            {showControls && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-amber-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span>⚙️</span>
                  Reading Settings
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Font Size: {fontSize}px</label>
                    <input
                      type="range"
                      min="12"
                      max="24"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Line Height: {lineHeight}</label>
                    <input
                      type="range"
                      min="1.2"
                      max="2.0"
                      step="0.1"
                      value={lineHeight}
                      onChange={(e) => setLineHeight(Number(e.target.value))}
                      className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Table of Contents */}
            {chapters.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-amber-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span>📖</span>
                  Table of Contents
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {chapters.map((chapter, index) => (
                    <button
                      key={index}
                      onClick={() => scrollToChapter(chapter.position)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-amber-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-amber-200"
                    >
                      {chapter.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-lg border border-amber-200 overflow-hidden">
              <div className="p-6 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <span>📚</span>
                  Read Book
                </h2>
              </div>

              {contentLoading ? (
                <div className="p-12 text-center">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-amber-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-amber-200 rounded w-1/2 mx-auto"></div>
                    <div className="h-4 bg-amber-200 rounded w-5/6 mx-auto"></div>
                  </div>
                  <p className="text-amber-600 mt-6 font-medium">Loading book content...</p>
                </div>
              ) : (
                <div
                  ref={contentRef}
                  className="h-96 lg:h-[600px] overflow-y-auto p-8 bg-gradient-to-b from-white to-amber-50"
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: lineHeight,
                  }}
                >
                  <pre className="whitespace-pre-wrap font-serif text-gray-800 leading-relaxed">{content}</pre>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <ReviewSection bookId={id} />
          </div>
        </div>
      </div>

      {/* Mobile Controls */}
      {showControls && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 cursor-pointer">Reading Settings</h3>
              <button onClick={() => setShowControls(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Font Size: {fontSize}px</label>
              <input
                type="range"
                min="12"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Line Height: {lineHeight}</label>
              <input
                type="range"
                min="1.2"
                max="2.0"
                step="0.1"
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #f59e0b;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #f59e0b;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  )
}
