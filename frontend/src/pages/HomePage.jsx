import { useEffect, useRef, useState } from "react"
import { fetchBooks } from "../api/gutendex"
import { Link, useNavigate } from "react-router-dom"
import Header from "../components/Header"

export default function HomePage() {
  const [books, setBooks] = useState([])
  const [filteredBooks, setFilteredBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [featuredBooks, setFeaturedBooks] = useState([])
  const booksPerPage = 12
  const booksGridRef = useRef(null);

  const suggestions = [
  "Atomic Habits",
  "Clean Code",
  "Harry Potter",
  "JavaScript",
  "React",
  "Dune",
  "The Alchemist",
  "George Orwell",
  "Science Fiction",
];

const filteredSuggestions = searchTerm
  ? suggestions.filter((s) =>
      s.toLowerCase().includes(searchTerm.toLowerCase())
    )
  : [];

  const genres = [
    "all",
    "fiction",
    "poetry",
    "drama",
    "philosophy",
    "history",
    "science",
    "adventure",
    "romance",
    "mystery",
  ]

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const data = await fetchBooks()
        setBooks(data.results)
        setFilteredBooks(data.results)
        // Set featured books as the first 6 most downloaded
        const featured = [...data.results].sort((a, b) => b.download_count - a.download_count).slice(0, 6)
        setFeaturedBooks(featured)
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch books:", error)
        setLoading(false)
      }
    }

    loadBooks()
  }, [])

  useEffect(() => {
    let filtered = books

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.authors.some((author) => author.name.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filter by genre
    if (selectedGenre !== "all") {
      filtered = filtered.filter((book) =>
        book.subjects.some((subject) => subject.toLowerCase().includes(selectedGenre.toLowerCase())),
      )
    }

    setFilteredBooks(filtered)
    setCurrentPage(1)
  }, [searchTerm, selectedGenre, books])

  // Remove the useEffect that scrolls on every searchTerm change

const handleSearchKeyDown = (e) => {
  if (e.key === "Enter" && booksGridRef.current) {
      booksGridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      handleSearch(searchTerm);
  }
};


  const totalPages = Math.ceil(filteredBooks.length / booksPerPage)
  const currentBooks = filteredBooks.slice((currentPage - 1) * booksPerPage, currentPage * booksPerPage)

  const getBookCover = (book) => {
    // Try to get cover from formats, fallback to placeholder
    const coverUrl =
      book.formats["image/jpeg"] || `/placeholder.svg?height=300&width=200&text=${encodeURIComponent(book.title)}`
    return coverUrl
  }

  const getAuthorNames = (authors) => {
    if (!authors || authors.length === 0) return "Unknown Author"
    return authors.map((author) => author.name).join(", ")
  }

  const getMainSubject = (subjects) => {
    if (!subjects || subjects.length === 0) return "Literature"
    return subjects[0].split(" -- ")[0]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-12 bg-indigo-200 rounded-lg w-64 mx-auto mb-4"></div>
              <div className="h-6 bg-indigo-100 rounded w-96 mx-auto"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
      {/* Header Bar */}
      <Header user={user} />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Discover Classic
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
              Literature
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Explore thousands of free classic books from Project Gutenberg. Dive into timeless stories, poetry, and
            knowledge.
          </p>

          {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-8">
          <div className="relative group">
            <input
              type="text"
              placeholder="Search books, authors, or subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full px-6 py-4 pl-12 text-white text-lg rounded-full backdrop-blur-md bg-white/20 border border-white/30 shadow-lg placeholder-white/70 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-xl pointer-events-none">
              🔍
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute cursor-pointer right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-red-400 transition duration-300"
              >
                ✖
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {filteredSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full mt-2 bg-white/30 backdrop-blur-md text-gray-800 font-medium rounded-lg shadow-lg border border-white/20">
              {filteredSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setSearchTerm(suggestion);
                    handleSearch(suggestion);
                  }}
                  className="px-4 py-2 cursor-pointer hover:bg-white/40 transition"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>



          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-bold text-black">{books.length.toLocaleString()}</div>
              <div className="text-indigo-500">Books Available</div>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-bold text-black">
                {books.reduce((sum, book) => sum + book.download_count, 0).toLocaleString()}
              </div>
              <div className="text-indigo-500">Total Downloads</div>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-bold text-black">Free</div>
              <div className="text-indigo-500">Always & Forever</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Books */}
        {featuredBooks.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">📚 Most Popular Books</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredBooks.map((book) => (
                <Link
                  key={book.id}
                  to={`/book/${book.id}`}
                  className="group block bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={getBookCover(book) || "/placeholder.svg"}
                      alt={book.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      ⭐ Featured
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                      📥 {book.download_count.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{getAuthorNames(book.authors)}</p>
                    <div className="flex items-center justify-between">
                      <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                        {getMainSubject(book.subjects)}
                      </span>
                      <span className="text-indigo-600 font-semibold group-hover:text-indigo-800">Read Now →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Filters */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-semibold">Filter by Genre:</span>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre.charAt(0).toUpperCase() + genre.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-gray-600">
                Showing {filteredBooks.length} of {books.length} books
              </div>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        <section ref={booksGridRef}>
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">📖 All Books</h2>

          {currentBooks.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-600 mb-2">No books found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {currentBooks.map((book) => (
                  <Link
                    key={book.id}
                    to={`/book/${book.id}`}
                    className="group block bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                  >
                    <div className="relative">
                      <img
                        src={getBookCover(book) || "/placeholder.svg"}
                        alt={book.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                        📥 {book.download_count.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-1">{getAuthorNames(book.authors)}</p>
                      <div className="flex items-center justify-between">
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {getMainSubject(book.subjects)}
                        </span>
                        <span className="text-indigo-600 text-sm font-semibold group-hover:text-indigo-800">
                          Read →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 cursor-pointer bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>

                  <div className="flex gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 cursor-pointer rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? "bg-indigo-600 text-white"
                              : "bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 cursor-pointer bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
