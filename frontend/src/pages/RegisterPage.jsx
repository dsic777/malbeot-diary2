import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api/client'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '', nickname: '' })
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
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
    <div className="flex-1 bg-black flex flex-col items-center justify-center px-6">
      <div className="w-full">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🌿</div>
          <h1 className="text-3xl font-black text-white mb-2">회원가입</h1>
          <p className="text-gray-500 text-base">말벗과 함께 시작해요</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3" style={{marginTop: '30px'}} autoComplete="off">
          <div className="w-[70%] flex flex-col gap-2">
            <label className="text-gray-300 font-bold text-base">아이디</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="아이디 (영문/숫자)"
              className="w-full bg-gray-900 border border-gray-700 rounded-md pr-4 py-4 text-lg text-white font-bold placeholder-gray-600 placeholder:text-sm focus:outline-none focus:border-amber-400"
              style={{paddingLeft: '10px'}}
              required
            />
          </div>

          <div className="w-[70%] flex flex-col gap-2">
            <label className="text-gray-300 font-bold text-base">닉네임</label>
            <input
              type="text"
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              placeholder="닉네임"
              autoComplete="off"
              className="w-full bg-gray-900 border border-gray-700 rounded-md pr-4 py-4 text-lg text-white font-bold placeholder-gray-600 placeholder:text-sm focus:outline-none focus:border-amber-400"
              style={{paddingLeft: '10px'}}
              required
            />
          </div>

          <div className="w-[70%] flex flex-col gap-2">
            <label className="text-gray-300 font-bold text-base">비밀번호</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="비밀번호 (8자 이상)"
              autoComplete="new-password"
              className="w-full bg-gray-900 border border-gray-700 rounded-md pr-4 py-4 text-lg text-white font-bold placeholder-gray-600 placeholder:text-sm focus:outline-none focus:border-amber-400"
              style={{paddingLeft: '10px'}}
              required
            />
          </div>

          <div className="w-[70%] flex flex-col gap-2">
            <label className="text-gray-300 font-bold text-base">비밀번호 확인</label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              autoComplete="new-password"
              className={`w-full bg-gray-900 border rounded-md pr-4 py-4 text-lg text-white font-bold placeholder-gray-600 placeholder:text-sm focus:outline-none transition
                ${passwordConfirm && form.password !== passwordConfirm ? 'border-red-500' : 'border-gray-700 focus:border-amber-400'}`}
              style={{paddingLeft: '10px'}}
              required
            />
            {passwordConfirm && form.password !== passwordConfirm && (
              <p className="text-red-400 font-bold text-sm">비밀번호가 일치하지 않습니다.</p>
            )}
          </div>

          {error && <p className="text-red-400 font-bold text-base text-center">{error}</p>}

          <div className="w-[70%]" style={{marginTop: '24px'}}>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-400 hover:bg-slate-300 text-white font-black rounded-md py-4 text-lg disabled:opacity-40 transition"
            >
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </div>

          <p className="text-center text-gray-500 font-bold mt-1">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-amber-400 font-black">로그인</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
