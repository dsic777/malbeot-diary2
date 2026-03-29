import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

const EMOTION_EMOJI = {
  기쁨: '😊', 슬픔: '😢', 화남: '😠', 평온: '😌',
  설렘: '🥰', 불안: '😰', 피곤: '😴', 감사: '🙏',
}
const INPUT_ICON = { text: '📝', voice: '🎤', mixed: '📝🎤' }

export default function DiaryListPage() {
  const navigate = useNavigate()
  const [diaries, setDiaries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/diaries/')
      .then(setDiaries)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    navigate('/login')
  }

  return (
    <div className="flex-1 bg-black flex flex-col">
      {/* 헤더 */}
      <header className="bg-black border-b border-gray-800 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-black text-white" style={{marginLeft: '10px'}}>🌿 말벗이 내 손 안에</h1>
        <button onClick={handleLogout} className="text-gray-500 font-bold text-sm" style={{marginRight: '20px'}}>로그아웃</button>
      </header>

      {/* 본문 */}
      <main className="flex-1 py-4" style={{paddingLeft: '15px', paddingRight: '15px'}}>
        {loading ? (
          <p className="text-center text-gray-600 mt-10 font-bold">불러오는 중...</p>
        ) : diaries.length === 0 ? (
          <div className="text-center mt-20 text-gray-600">
            <div className="text-5xl mb-4">📓</div>
            <p className="text-lg font-black text-gray-400">아직 작성한 기록이 없어요</p>
            <p className="text-base font-bold mt-1 text-gray-600">오늘의 이야기를 들려주세요</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {diaries.map((diary) => (
              <div
                key={diary.id}
                onClick={() => navigate(`/diary/${diary.id}`)}
                className="bg-gray-900 border border-gray-800 rounded-md p-4 cursor-pointer hover:border-gray-600 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 font-bold text-sm">{diary.diary_date}</span>
                  <div className="flex gap-2 text-xl">
                    <span>{INPUT_ICON[diary.input_type] || '📝'}</span>
                    {diary.emotion && <span>{EMOTION_EMOJI[diary.emotion]}</span>}
                  </div>
                </div>
                <p className="font-black text-white text-base">
                  {diary.title || '제목 없음'}
                </p>
                {diary.weather && (
                  <p className="text-gray-600 font-bold text-sm mt-1">{diary.weather}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 하단 버튼 */}
      <div className="py-4 border-t border-gray-800" style={{paddingLeft: '10px', paddingRight: '10px'}}>
        <button
          onClick={() => navigate('/write')}
          className="w-full bg-slate-400 hover:bg-slate-300 text-white font-black rounded-md py-4 text-lg transition"
        >
          🎤 오늘 이야기 남기기
        </button>
      </div>
    </div>
  )
}
