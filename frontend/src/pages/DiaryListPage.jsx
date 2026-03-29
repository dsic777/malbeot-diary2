import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

const EMOTION_EMOJI = {
  기쁨: '😊', 슬픔: '😢', 화남: '😠', 평온: '😌',
  설렘: '🥰', 불안: '😰', 피곤: '😴', 감사: '🙏',
}
const INPUT_ICON = { text: '📝', voice: '🎤', mixed: '📝🎤' }

function DiaryCard({ diary, onClick }) {
  return (
    <div
      onClick={onClick}
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
  )
}

export default function DiaryListPage() {
  const navigate = useNavigate()
  const [diaries, setDiaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [searchResults, setSearchResults] = useState(null)  // null = 검색 안 함
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    api.get('/diaries/')
      .then(setDiaries)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = useCallback(async () => {
    if (!keyword.trim()) {
      setSearchResults(null)
      return
    }
    setSearching(true)
    try {
      const results = await api.get(`/diaries/search?q=${encodeURIComponent(keyword.trim())}`)
      setSearchResults(results)
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [keyword])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleClear = () => {
    setKeyword('')
    setSearchResults(null)
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    navigate('/login')
  }

  const displayList = searchResults !== null ? searchResults : diaries

  return (
    <div className="flex-1 bg-black flex flex-col">
      {/* 헤더 */}
      <header className="bg-black border-b border-gray-800 px-5 flex items-center justify-between sticky top-0 z-10" style={{paddingTop: '18px', paddingBottom: '18px'}}>
        <h1 className="text-lg font-black text-white" style={{marginLeft: '10px'}}>🌿 말벗이 내 손 안에</h1>
        <div className="flex items-center gap-3" style={{marginRight: '20px'}}>
          <button onClick={() => navigate('/personas')} className="text-gray-400 font-bold text-sm">🎭 말벗</button>
          <button onClick={handleLogout} className="text-gray-500 font-bold text-sm">로그아웃</button>
        </div>
      </header>

      {/* 검색바 */}
      <div className="bg-black border-b border-gray-800 overflow-hidden" style={{paddingTop: '12px', paddingBottom: '12px', paddingLeft: '15px', paddingRight: '15px'}}>
        <div className="flex gap-2 w-full">
          <div className="flex items-center bg-gray-900 border border-gray-700 rounded-md px-3 gap-2" style={{flex: 1, minWidth: 0}}>
            <span className="text-gray-500">🔍</span>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="제목 또는 내용 검색..."
              className="flex-1 bg-transparent text-sm text-white font-bold placeholder-gray-600 focus:outline-none"
              style={{paddingTop: '12px', paddingBottom: '12px'}}
            />
            {keyword && (
              <button onClick={handleClear} className="text-gray-500 text-base px-1">✕</button>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={searching}
            className="text-white font-black text-sm rounded-md disabled:opacity-40 whitespace-nowrap flex-shrink-0"
            style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', backgroundColor: 'rgba(52, 145, 217, 0.99)' }}
          >
            {searching ? '...' : '검 색'}
          </button>
        </div>
        {searchResults !== null && (
          <p className="text-gray-600 font-bold text-xs" style={{marginTop: '8px'}}>
            "{keyword}" 검색 결과 {searchResults.length}건
          </p>
        )}
      </div>

      {/* 본문 */}
      <main className="flex-1 py-4" style={{paddingLeft: '15px', paddingRight: '15px'}}>
        {loading ? (
          <p className="text-center text-gray-600 mt-10 font-bold">불러오는 중...</p>
        ) : displayList.length === 0 ? (
          <div className="text-center mt-20 text-gray-600">
            <div className="text-5xl mb-4">{searchResults !== null ? '🔍' : '📓'}</div>
            <p className="text-lg font-black text-gray-400">
              {searchResults !== null ? '검색 결과가 없어요' : '아직 작성한 기록이 없어요'}
            </p>
            <p className="text-base font-bold mt-1 text-gray-600">
              {searchResults !== null ? '다른 키워드로 검색해 보세요' : '오늘의 이야기를 들려주세요'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {displayList.map((diary) => (
              <DiaryCard
                key={diary.id}
                diary={diary}
                onClick={() => navigate(`/diary/${diary.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      {/* 하단 버튼 */}
      <div className="border-t border-gray-800" style={{paddingTop: '16px', paddingBottom: '20px', paddingLeft: '10px', paddingRight: '10px'}}>
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
