import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

const EMOTIONS = ['기쁨', '슬픔', '화남', '평온', '설렘', '불안', '피곤', '감사']
const WEATHERS = ['맑음', '흐림', '비', '눈', '바람']
const EMOTION_EMOJI = {
  기쁨: '😊', 슬픔: '😢', 화남: '😠', 평온: '😌',
  설렘: '🥰', 불안: '😰', 피곤: '😴', 감사: '🙏',
}
const WEATHER_EMOJI = { 맑음: '☀️', 흐림: '☁️', 비: '🌧️', 눈: '❄️', 바람: '💨' }

export default function DiaryWritePage() {
  const navigate = useNavigate()
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    title: '',
    content: '',
    emotion: '',
    weather: '',
    diary_date: today,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.content.trim()) {
      setError('일기 내용을 입력해주세요.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const diary = await api.post('/diaries/', form)
      navigate(`/diary/${diary.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col max-w-lg mx-auto">
      {/* 헤더 */}
      <header className="bg-white border-b border-amber-100 px-5 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-2xl text-gray-400">←</button>
        <h1 className="text-xl font-bold text-amber-800">오늘 일기 쓰기</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col px-4 py-5 gap-5">
        {/* 날짜 */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 font-medium">날짜</label>
          <input
            type="date"
            value={form.diary_date}
            onChange={(e) => setForm({ ...form, diary_date: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-3 text-lg bg-white focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* 제목 */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 font-medium">제목 (선택)</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="제목을 입력하세요"
            className="border border-gray-200 rounded-xl px-4 py-3 text-lg bg-white focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* 감정 */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-500 font-medium">오늘의 감정</label>
          <div className="flex flex-wrap gap-2">
            {EMOTIONS.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setForm({ ...form, emotion: form.emotion === em ? '' : em })}
                className={`px-4 py-2 rounded-full text-base border transition
                  ${form.emotion === em
                    ? 'bg-amber-400 border-amber-400 text-white font-bold'
                    : 'bg-white border-gray-200 text-gray-600'}`}
              >
                {EMOTION_EMOJI[em]} {em}
              </button>
            ))}
          </div>
        </div>

        {/* 날씨 */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-500 font-medium">오늘의 날씨</label>
          <div className="flex flex-wrap gap-2">
            {WEATHERS.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setForm({ ...form, weather: form.weather === w ? '' : w })}
                className={`px-4 py-2 rounded-full text-base border transition
                  ${form.weather === w
                    ? 'bg-sky-400 border-sky-400 text-white font-bold'
                    : 'bg-white border-gray-200 text-gray-600'}`}
              >
                {WEATHER_EMOJI[w]} {w}
              </button>
            ))}
          </div>
        </div>

        {/* 내용 */}
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-gray-500 font-medium">오늘의 이야기 <span className="text-red-400">*</span></label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="오늘 있었던 일을 자유롭게 적어보세요..."
            rows={8}
            className="border border-gray-200 rounded-xl px-4 py-3 text-lg bg-white focus:outline-none focus:border-amber-400 resize-none flex-1"
          />
        </div>

        {error && <p className="text-red-500 text-base">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl py-4 text-xl disabled:opacity-50"
        >
          {loading ? '저장 중...' : '💾 일기 저장'}
        </button>
      </form>
    </div>
  )
}
