import { useEffect, useState, useContext } from "react"
import axios from "axios"
// import { AuthContext } from "../context/AuthContext" // Uncomment if you have auth context

export default function ReviewSection({ bookId }) {
  const [reviews, setReviews] = useState([])
  const [reviewText, setReviewText] = useState("")
  const [rating, setRating] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  // const { user } = useContext(AuthContext) // Uncomment if you have auth context
    const user = JSON.parse(localStorage.getItem("user")) // Temporary user retrieval, replace with context if available
  useEffect(() => {
    if (!bookId) return
    axios
      .get(`${import.meta.env.VITE_API_URL}/reviews?bookId=${bookId}`)
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]))
  }, [bookId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/reviews`, {
        bookId,
        userId: user._id,
        rating,
        comment: reviewText,
      })
      setReviewText("")
      setRating(5)
      // Refresh reviews
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/reviews?bookId=${bookId}`)
      setReviews(res.data)
    } catch (err) {
      setError("Failed to submit review.")
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-amber-200 p-6 mt-8">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span>⭐</span> Reviews
      </h3>
      {reviews.length === 0 && <p className="text-gray-500">No reviews yet.</p>}
      <ul className="space-y-4 mb-6">
        {reviews.map((r) => (
          <li key={r._id} className="border-b pb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {user ? user.username : "User"}
              </span>
              <span className="text-yellow-500">{"★".repeat(r.rating)}</span>
            </div>
            <div className="text-gray-700">{r.comment}</div>
          </li>
        ))}
      </ul>
      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-medium">Your Rating:</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="border rounded px-2 py-1"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} Star{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium">Your Review:</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="border rounded w-full px-2 py-1"
              rows={3}
              required
            />
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <button
            type="submit"
            className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      ) : (
        <div className="text-gray-500">Log in to submit a review.</div>
      )}
    </div>
  )
}