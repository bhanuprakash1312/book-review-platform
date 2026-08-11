import { useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"

export default function SignupPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/signup`, { username, email, password })
      navigate("/login")
    } catch (err) {
      setError("Signup failed. Try a different email.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-indigo-100">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg mb-2">
            <span className="text-3xl">📚</span>
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Create Account
          </h1>
          <p className="text-gray-500">Join ClassicReads for free</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="text-red-500 mb-2 text-center">{error}</div>}
          <div>
            <label className="block mb-1 font-medium">Username</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-200"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-200"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-200"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-2 rounded-lg font-semibold shadow hover:from-indigo-700 hover:to-pink-700 transition-all"
          >
            Sign Up
          </button>
        </form>
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="mx-2 text-gray-400">or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>
        <div className="text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}