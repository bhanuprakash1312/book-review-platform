import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function UserProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ username: "", bio: "" })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [toast, setToast] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem("user"))
    if (!localUser) {
      navigate("/login")
      return
    }
    axios
      .get(`${import.meta.env.VITE_API_URL}/users/${localUser._id}`)
      .then((res) => {
        setUser(res.data)
        setForm({ username: res.data.username, bio: res.data.bio || "" })
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [navigate])

  const handleEdit = () => setEditing(true)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const localUser = JSON.parse(localStorage.getItem("user"))
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/users/${localUser._id}`, form)
      setUser(res.data)
      // Update localStorage with new user info
      localStorage.setItem("user", JSON.stringify(res.data))
      setEditing(false)
      setToast("Profile updated successfully!")
      setTimeout(() => {
        setToast("")
        navigate('/')
    }, 1500)
    } catch (err) {
      setError("Failed to update profile.")
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-2xl text-gray-600">Loading profile...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-2xl text-red-500">User not found.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col items-center py-16">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50 transition-all">
          {toast}
        </div>
      )}
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold mb-4">
          {user.username?.charAt(0).toUpperCase()}
        </div>
        {editing ? (
          <form onSubmit={handleSave} className="w-full flex flex-col items-center gap-4">
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full"
              placeholder="Username"
              required
            />
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full"
              placeholder="Bio"
              rows={3}
            />
            {error && <div className="text-red-500">{error}</div>}
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-indigo-500 cursor-pointer text-white px-4 py-2 rounded hover:bg-indigo-600"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className="bg-gray-200 cursor-pointer text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-2">{user.username}</h2>
            <p className="text-gray-600 mb-2">{user.email}</p>
            {user.bio && <p className="text-gray-500 italic mb-4">{user.bio}</p>}
            <button
              className="mt-4 bg-indigo-500 cursor-pointer text-white px-4 py-2 rounded hover:bg-indigo-600"
              onClick={handleEdit}
            >
              Edit Profile
            </button>
          </>
        )}
      </div>
    </div>
  )
}