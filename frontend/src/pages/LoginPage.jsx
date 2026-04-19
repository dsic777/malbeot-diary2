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
    <div className="flex-1 bg-black flex flex-col items-center justify-center px-6">
      <div className="w-full">

        {/* 로고 영역 */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-5">🌿</div>
          <h1 className="text-3xl font-black text-white mb-3">말벗이 내 손 안에</h1>
          <p className="text-gray-400 text-xl leading-relaxed">
            언제든 말을 걸 수 있는<br />
            <span className="text-gray-300 font-bold">내 손 안의 </span>
            <span className="text-amber-400 font-black text-2xl">절친</span>
          </p>
          <p className="text-base mt-2" style={{color: 'rgb(44, 173, 100)'}}>나만의 일기와 메모를 남겨보세요.</p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3" style={{marginTop: '30px'}} autoComplete="off">

          {/* 아이디 */}
          <div className="w-[70%] flex flex-col gap-2">
            <label className="text-gray-300 font-bold text-lg">아이디</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="아이디를 입력하세요"
              autoComplete="off"
              className="w-full bg-gray-900 border border-gray-700 rounded-md pr-4 text-xl text-white font-bold placeholder-gray-600 focus:outline-none focus:border-amber-400" style={{height: '54px', paddingLeft: '10px'}}
              required
            />
          </div>

          {/* 비밀번호 */}
          <div className="w-[70%] flex flex-col gap-2">
            <label className="text-gray-300 font-bold text-lg">비밀번호</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="비밀번호를 입력하세요"
              autoComplete="new-password"
              className="w-full bg-gray-900 border border-gray-700 rounded-md pr-4 text-xl text-white font-bold placeholder-gray-600 focus:outline-none focus:border-amber-400" style={{height: '54px', paddingLeft: '10px'}}
              required
            />
          </div>

          {error && (
            <p className="text-red-400 font-bold text-base text-center">{error}</p>
          )}

          {/* 로그인 버튼 */}
          <div className="w-[70%]" style={{marginTop: '24px'}}>
            <button
              type="submit"
              disabled={loading}
              className="w-full font-black rounded-xl disabled:opacity-40 transition" style={{height: '58px', backgroundColor: 'rgb(74, 222, 128)', color: 'rgb(0, 30, 80)', fontSize: '28px'}}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </div>

          <p className="text-center text-gray-300 font-bold mt-1 text-lg">
            계정이 없으신가요?{' '}
            <Link to="/register" className="text-amber-400 font-black text-xl">회원가입</Link>
          </p>
        </form>

      </div>
    </div>
  )
}
