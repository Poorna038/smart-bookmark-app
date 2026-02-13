'use client'

import { useEffect } from 'react'
import { supabase } from './lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace('/dashboard')
      }
    }

    checkSession()
  }, [router])

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">

      <div className="bg-gray-900 p-10 rounded-xl shadow-lg border border-gray-700 text-center w-96">

        {/* 🔴 Title */}
        <h1 className="text-3xl font-bold mb-2 text-red-500">
          Smart Bookmark 🔖
        </h1>

        <p className="text-gray-400 text-sm mb-8">
          Organize your links securely with real-time sync
        </p>

        {/* 🔐 Login Button */}
        <button
          onClick={loginWithGoogle}
          className="w-full bg-red-600 text-white py-3 rounded-lg 
                     hover:bg-red-700 transition duration-200"
        >
          Sign in with Google
        </button>

      </div>

    </div>
  )
}
