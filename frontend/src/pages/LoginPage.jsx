import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api/client'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.post('/auth/login', form)
      localStorage.setItem('access_token', data.access_token)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        {/* 로고 영역 */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🌿</div>
          <h1 className="text-3xl font-bold text-amber-800">말벗이 내 손 안에</h1>
          <p className="text-gray-500 mt-2 text-lg">오늘 하루 어떠셨나요?</p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-7 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-gray-600 font-medium">아이디</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="아이디를 입력하세요"
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
              placeholder="비밀번호를 입력하세요"
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
            {loading ? '로그인 중...' : '로그인'}
          </button>

          <p className="text-center text-gray-500">
            계정이 없으신가요?{' '}
            <Link to="/register" className="text-amber-600 font-medium">회원가입</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
