import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api/client'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '', nickname: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/register', form)
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌿</div>
          <h1 className="text-2xl font-bold text-amber-800">회원가입</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-7 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-gray-600 font-medium">아이디</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="아이디 (영문/숫자)"
              className="border border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-amber-400"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-gray-600 font-medium">닉네임</label>
            <input
              type="text"
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              placeholder="앱에서 사용할 이름"
              className="border border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-amber-400"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-gray-600 font-medium">비밀번호</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="8자 이상"
              className="border border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-base text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl py-4 text-lg mt-2 disabled:opacity-50"
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>

          <p className="text-center text-gray-500">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-amber-600 font-medium">로그인</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
