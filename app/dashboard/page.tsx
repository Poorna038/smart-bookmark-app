'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [bookmarks, setBookmarks] = useState<any[]>([])

  // 🔐 Session Check
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/')
        return
      }

      setUser(session.user)
      setLoading(false)
    }

    checkSession()
  }, [router])

  // 📥 Fetch Bookmarks
  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setBookmarks(data)
  }

  useEffect(() => {
    if (user) fetchBookmarks()
  }, [user])

  // 🔄 Realtime
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('bookmarks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookmarks' },
        () => fetchBookmarks()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const addBookmark = async (e: any) => {
    e.preventDefault()
    if (!title || !url) return

    await supabase.from('bookmarks').insert([
      { title, url, user_id: user.id }
    ])

    setTitle('')
    setUrl('')
  }

  const deleteBookmark = async (id: string) => {
    await supabase.from('bookmarks').delete().eq('id', id)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <div className="p-10 text-center text-white bg-black min-h-screen">Loading...</div>

  return (
    <div className="min-h-screen bg-black text-white p-10">

      <div className="max-w-2xl mx-auto bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-700">

        
        <h1 className="text-3xl font-bold mb-2 text-red-500">
          My Bookmarks 🔖
        </h1>

        <p className="mb-6 text-gray-400 text-sm">
          Logged in as: <span className="text-white">{user?.email}</span>
        </p>

        {/* 📝 Add Form */}
        <form onSubmit={addBookmark} className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="Title"
            className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-md 
                       placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="text"
            placeholder="URL"
            className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-md 
                       placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition"
          >
            Add Bookmark
          </button>
        </form>

        {/* 📚 Bookmark List */}
        <div className="space-y-3">
          {bookmarks.length === 0 && (
            <p className="text-gray-500">No bookmarks yet.</p>
          )}

          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="p-4 bg-gray-800 border border-gray-700 rounded-lg flex justify-between items-center"
            >
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 font-semibold hover:text-red-400 transition"
              >
                {bookmark.title}
              </a>

              <button
                onClick={() => deleteBookmark(bookmark.id)}
                className="text-red-500 hover:text-red-400 text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 text-gray-400 hover:text-red-500 text-sm"
        >
          Logout
        </button>

      </div>
    </div>
  )
}
