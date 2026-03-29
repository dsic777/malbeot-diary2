import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

const EMOTION_EMOJI = {
  기쁨: '😊', 슬픔: '😢', 화남: '😠', 평온: '😌',
  설렘: '🥰', 불안: '😰', 피곤: '😴', 감사: '🙏',
}

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
    <div className="min-h-screen bg-amber-50 flex flex-col max-w-lg mx-auto">
      {/* 헤더 */}
      <header className="bg-white border-b border-amber-100 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-amber-800">🌿 말벗이 내 손 안에</h1>
        <button onClick={handleLogout} className="text-gray-400 text-base">로그아웃</button>
      </header>

      {/* 본문 */}
      <main className="flex-1 px-4 py-5">
        {loading ? (
          <p className="text-center text-gray-400 mt-10">불러오는 중...</p>
        ) : diaries.length === 0 ? (
          <div className="text-center mt-20 text-gray-400">
            <div className="text-5xl mb-4">📓</div>
            <p className="text-lg">아직 작성한 일기가 없어요</p>
            <p className="text-base mt-1">오늘의 이야기를 들려주세요</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {diaries.map((diary) => (
              <div
                key={diary.id}
                onClick={() => navigate(`/diary/${diary.id}`)}
                className="bg-white rounded-2xl shadow-sm p-5 cursor-pointer hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-base">{diary.diary_date}</span>
                  <span className="text-2xl">{EMOTION_EMOJI[diary.emotion] || '📝'}</span>
                </div>
                <p className="font-semibold text-gray-800 text-lg">
                  {diary.title || '제목 없음'}
                </p>
                {diary.weather && (
                  <p className="text-gray-400 text-base mt-1">{diary.weather}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 하단 글쓰기 버튼 */}
      <div className="p-5">
        <button
          onClick={() => navigate('/write')}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl py-4 text-xl shadow-lg"
        >
          ✏️ 오늘 일기 쓰기
        </button>
      </div>
    </div>
  )
}
