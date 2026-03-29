import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'

const EMOTION_EMOJI = {
  기쁨: '😊', 슬픔: '😢', 화남: '😠', 평온: '😌',
  설렘: '🥰', 불안: '😰', 피곤: '😴', 감사: '🙏',
}
const WEATHER_EMOJI = { 맑음: '☀️', 흐림: '☁️', 비: '🌧️', 눈: '❄️', 바람: '💨' }

export default function DiaryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [diary, setDiary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [feedbackLoading, setFeedbackLoading] = useState(false)

  useEffect(() => {
    api.get(`/diaries/${id}`)
      .then(setDiary)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id])

  const handleGetFeedback = async () => {
    setFeedbackLoading(true)
    try {
      const result = await api.post(`/feedback/${id}`, {})
      setDiary((prev) => ({ ...prev, ai_feedback: result.ai_feedback }))
    } catch (err) {
      alert(err.message)
    } finally {
      setFeedbackLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('일기를 삭제할까요?')) return
    await api.delete(`/diaries/${id}`)
    navigate('/')
  }

  if (loading) return <div className="min-h-screen bg-amber-50 flex items-center justify-center text-gray-400 text-lg">불러오는 중...</div>
  if (!diary) return null

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col max-w-lg mx-auto">
      {/* 헤더 */}
      <header className="bg-white border-b border-amber-100 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => navigate('/')} className="text-2xl text-gray-400">←</button>
        <h1 className="text-xl font-bold text-amber-800">일기 보기</h1>
        <button onClick={handleDelete} className="text-red-400 text-base">삭제</button>
      </header>

      <div className="flex-1 px-4 py-5 flex flex-col gap-5">
        {/* 날짜 + 감정/날씨 */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-gray-400 text-base mb-2">{diary.diary_date}</p>
          <div className="flex gap-3 text-2xl">
            {diary.emotion && <span title={diary.emotion}>{EMOTION_EMOJI[diary.emotion] || diary.emotion}</span>}
            {diary.weather && <span title={diary.weather}>{WEATHER_EMOJI[diary.weather] || diary.weather}</span>}
          </div>
          {diary.title && (
            <h2 className="text-xl font-bold text-gray-800 mt-3">{diary.title}</h2>
          )}
        </div>

        {/* 일기 내용 */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">{diary.content}</p>
        </div>

        {/* AI 피드백 */}
        <div className="bg-amber-100 rounded-2xl p-5">
          <p className="text-amber-800 font-bold mb-3">🌿 말벗의 이야기</p>
          {diary.ai_feedback ? (
            <p className="text-gray-700 text-lg leading-relaxed">{diary.ai_feedback}</p>
          ) : (
            <div className="text-center">
              <p className="text-gray-500 text-base mb-4">아직 말벗의 이야기가 없어요</p>
              <button
                onClick={handleGetFeedback}
                disabled={feedbackLoading}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl px-6 py-3 text-lg disabled:opacity-50"
              >
                {feedbackLoading ? '생각 중...' : '💬 말벗에게 물어보기'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
