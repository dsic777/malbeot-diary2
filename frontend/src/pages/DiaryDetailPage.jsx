import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useTTS } from '../hooks/useTTS'

const EMOTION_EMOJI = {
  기쁨: '😊', 슬픔: '😢', 화남: '😠', 평온: '😌',
  설렘: '🥰', 불안: '😰', 피곤: '😴', 감사: '🙏',
}
const WEATHER_EMOJI = { 맑음: '☀️', 흐림: '☁️', 비: '🌧️', 눈: '❄️', 바람: '💨' }

function TTSToggle({ enabled, speaking, onToggle, onSpeak, hasFeedback }) {
  return (
    <div className="flex items-center gap-2">
      {/* 스피커 아이콘 */}
      <button
        onClick={hasFeedback ? (speaking ? undefined : onSpeak) : undefined}
        className="leading-none"
        title={speaking ? '읽는 중...' : enabled ? '읽어주기' : '음소거'}
      >
        {enabled
          ? <span style={{color: speaking ? '#60a5fa' : '#3b82f6', fontSize: '24px'}}>🔊</span>
          : <span style={{fontSize: '24px'}}>🔇</span>
        }
      </button>

      {/* 토글 스위치 */}
      <button
        onClick={onToggle}
        style={{
          width: '44px', height: '24px', borderRadius: '12px',
          backgroundColor: enabled ? '#3b82f6' : '#4b5563',
          position: 'relative', transition: 'background-color 0.2s',
          border: 'none', cursor: 'pointer', flexShrink: 0,
        }}
        title={enabled ? '읽어주기 끄기' : '읽어주기 켜기'}
      >
        <span style={{
          position: 'absolute', top: '3px',
          left: enabled ? '23px' : '3px',
          width: '18px', height: '18px', borderRadius: '50%',
          backgroundColor: '#fff', transition: 'left 0.2s',
          display: 'block',
        }} />
      </button>
    </div>
  )
}

export default function DiaryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [diary, setDiary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const { enabled, speaking, speak, toggle } = useTTS()

  useEffect(() => {
    api.get(`/diaries/${id}`)
      .then((data) => {
        setDiary(data)
        if (data.ai_feedback && enabled) {
          setTimeout(() => speak(data.ai_feedback), 500)
        }
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
    // 페이지 떠날 때 TTS 중단
    return () => { window.speechSynthesis?.cancel() }
  }, [id])

  const handleGetFeedback = async () => {
    setFeedbackLoading(true)
    try {
      const result = await api.post(`/feedback/${id}`, {})
      setDiary((prev) => ({ ...prev, ai_feedback: result.ai_feedback }))
      if (enabled) speak(result.ai_feedback)
    } catch (err) {
      alert(err.message)
    } finally {
      setFeedbackLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('이 기록을 삭제할까요?')) return
    await api.delete(`/diaries/${id}`)
    navigate('/')
  }

  if (loading) return (
    <div className="flex-1 bg-black flex items-center justify-center text-gray-600 font-bold">
      불러오는 중...
    </div>
  )
  if (!diary) return null

  return (
    <div className="flex-1 bg-black flex flex-col">
      {/* 헤더 */}
      <header className="bg-black border-b border-gray-800 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-gray-500 font-black text-xl">←</button>
          <TTSToggle
            enabled={enabled}
            speaking={speaking}
            onToggle={toggle}
            onSpeak={() => speak(diary.ai_feedback)}
            hasFeedback={!!diary.ai_feedback}
          />
        </div>
        <h1 className="text-2xl font-black text-white">기록 보기</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/write', { state: { diary } })} className="text-blue-400 font-bold text-xl">✏️ 수정</button>
          <button onClick={handleDelete} className="text-red-500 font-bold text-xl">🗑️ 삭제</button>
        </div>
      </header>

      <div className="flex-1 py-4 flex flex-col gap-4" style={{paddingLeft: '15px', paddingRight: '15px'}}>
        {/* 날짜 + 감정/날씨 */}
        <div className="bg-gray-900 border border-gray-800 rounded-md p-4">
          <p className="text-gray-600 font-bold text-xl mb-2">{diary.diary_date}</p>
          <div className="flex gap-3 text-2xl">
            {diary.emotion && <span>{EMOTION_EMOJI[diary.emotion] || diary.emotion}</span>}
            {diary.weather && <span>{WEATHER_EMOJI[diary.weather] || diary.weather}</span>}
          </div>
          {diary.title && (
            <h2 className="text-lg font-black text-white mt-3">{diary.title}</h2>
          )}
        </div>

        {/* 일기 내용 */}
        <div className="bg-gray-900 border border-gray-800 rounded-md p-4">
          <p className="text-gray-300 font-bold text-xl leading-relaxed whitespace-pre-wrap">
            {diary.content}
          </p>
        </div>

        {/* AI 피드백 */}
        <div className="bg-gray-900 border border-amber-400 border-opacity-30 rounded-md p-4">
          <p className="text-amber-400 font-black text-xl mb-3">🌿 말벗의 이야기</p>
          {diary.ai_feedback ? (
            <p className="text-gray-300 font-bold text-xl leading-relaxed" style={{paddingLeft: '5px', paddingRight: '5px'}}>{diary.ai_feedback}</p>
          ) : (
            <div className="text-center py-2">
              <p className="text-gray-600 font-bold text-xl mb-4">아직 말벗의 이야기가 없어요</p>
              <button
                onClick={handleGetFeedback}
                disabled={feedbackLoading}
                className="bg-slate-400 hover:bg-slate-300 text-white font-black rounded-md px-6 disabled:opacity-40 transition" style={{height:'50px', fontSize:'24px'}}
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
