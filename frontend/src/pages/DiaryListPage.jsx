import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

const EMOTION_EMOJI = {
  기쁨: '😊', 슬픔: '😢', 화남: '😠', 평온: '😌',
  설렘: '🥰', 불안: '😰', 피곤: '😴', 감사: '🙏',
}
const EMOTION_COLOR = {
  기쁨:  '#fbbf24', 슬픔:  '#93c5fd', 화남:  '#fca5a5', 평온:  '#86efac',
  설렘:  '#f9a8d4', 불안:  '#fdba74', 피곤:  '#c4b5fd', 감사:  '#5eead4',
}
const INPUT_ICON = { text: '📝', voice: '🎤', mixed: '📝🎤' }
const WEATHER_EMOJI = { 맑음: '☀️', 흐림: '☁️', 비: '🌧️', 눈: '❄️', 바람: '💨' }


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
          {diary.weather && <span>{WEATHER_EMOJI[diary.weather]}</span>}
        </div>
      </div>
      <p className="font-black text-white text-base">
        {diary.title || '제목 없음'}
      </p>
    </div>
  )
}

// 요일 헤더
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function CalendarView({ diaries, onDiaryClick }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth()) // 0-indexed
  const [selectedDate, setSelectedDate] = useState(null)
  const touchStartX = useRef(null)

  // diary_date(YYYY-MM-DD) → Map<string, Diary[]>
  const dateMap = {}
  diaries.forEach((d) => {
    const key = d.diary_date ? d.diary_date.slice(0, 10) : null
    if (!key) return
    if (!dateMap[key]) dateMap[key] = []
    dateMap[key].push(d)
  })

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelectedDate(null)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelectedDate(null)
  }

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) { diff > 0 ? nextMonth() : prevMonth() }
    touchStartX.current = null
  }
  const handleMouseDown = (e) => { touchStartX.current = e.clientX }
  const handleMouseUp = (e) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.clientX
    // 80px 이상 드래그해야 월 이동 (날짜 클릭과 충돌 방지)
    if (Math.abs(diff) > 80) { diff > 0 ? nextMonth() : prevMonth() }
    touchStartX.current = null
  }

  // 해당 달의 첫째날 요일 & 마지막날
  const firstDay = new Date(year, month, 1).getDay()
  const lastDate = new Date(year, month + 1, 0).getDate()

  // 달력 셀 배열 (null = 빈칸)
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= lastDate; d++) cells.push(d)

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const selectedDiaries = selectedDate ? (dateMap[selectedDate] || []) : []

  return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} style={{userSelect: 'none'}}>
      {/* 월 이동 헤더 */}
      <div className="flex items-center justify-between mb-4" style={{paddingLeft: '8px', paddingRight: '8px'}}>
        <button onClick={prevMonth} className="text-2xl px-2 py-1 transition hover:opacity-60">👈</button>
        <span className="text-white font-black text-base">{year}년 {month + 1}월</span>
        <button onClick={nextMonth} className="text-2xl px-2 py-1 transition hover:opacity-60">👉</button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`text-center text-xs font-black pb-2 ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-400' : 'text-gray-500'}`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* 날짜 셀 */}
      <div className="grid grid-cols-7" style={{borderTop: '1px solid rgba(255,255,255,0.07)'}}>
        {cells.map((day, idx) => {
          if (!day) return (
            <div key={`empty-${idx}`} style={{borderBottom: '1px solid rgba(255,255,255,0.07)', minHeight: '62px'}} />
          )
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const count = dateMap[dateStr]?.length || 0
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDate
          const colIdx = idx % 7

          const firstDiary = dateMap[dateStr]?.[0]
          const emotionColor = firstDiary?.emotion ? EMOTION_COLOR[firstDiary.emotion] : null
          const cellBg = isSelected
            ? '#1d4ed8'
            : emotionColor
              ? emotionColor + '2a'
              : isToday
                ? '#1f2937'
                : undefined

          return (
            <div
              key={dateStr}
              onClick={() => setSelectedDate(isSelected ? null : dateStr)}
              style={{
                ...(cellBg ? { backgroundColor: cellBg } : {}),
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                minHeight: '62px',
              }}
              className="flex flex-col items-center pt-1.5 pb-1 cursor-pointer transition hover:opacity-75"
            >
              {/* 날짜 숫자 */}
              <span className={`text-sm font-bold leading-tight
                ${isSelected ? 'text-white' : isToday ? 'text-amber-400' : colIdx === 0 ? 'text-red-400' : colIdx === 6 ? 'text-blue-400' : 'text-gray-300'}`}
              >
                {day}
              </span>

              {count > 0 ? (
                <>
                  {/* 감정 + 날씨 이모지 */}
                  <div className="flex items-center justify-center gap-0.5 mt-1 leading-none">
                    {firstDiary?.emotion && (
                      <span style={{fontSize: '14px'}}>{EMOTION_EMOJI[firstDiary.emotion]}</span>
                    )}
                    {firstDiary?.weather && (
                      <span style={{fontSize: '14px'}}>{WEATHER_EMOJI[firstDiary.weather]}</span>
                    )}
                  </div>
                  {/* 건수 */}
                  <span className={`text-xs font-black mt-0.5 leading-none
                    ${isSelected ? 'text-blue-200' : 'text-gray-500'}`}
                  >
                    {count}건
                  </span>
                </>
              ) : (
                <div style={{minHeight: '38px'}} />
              )}
            </div>
          )
        })}
      </div>

      {/* 선택된 날짜 일기 목록 */}
      {selectedDate && (
        <div className="mt-4">
          <p className="text-gray-500 font-bold text-xs mb-2">
            {selectedDate} ({selectedDiaries.length}건)
          </p>
          {selectedDiaries.length === 0 ? (
            <p className="text-gray-600 font-bold text-sm text-center py-4">이 날의 기록이 없어요</p>
          ) : (
            <div className="flex flex-col gap-3">
              {selectedDiaries.map((d) => (
                <DiaryCard key={d.id} diary={d} onClick={() => onDiaryClick(d.id)} />
              ))}
            </div>
          )}
        </div>
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
  const [tab, setTab] = useState('list') // 'list' | 'calendar'

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
    <div className="flex-1 bg-black flex flex-col overflow-hidden">
      {/* 헤더 */}
      <header className="bg-black border-b border-gray-800 px-5 flex items-center justify-between sticky top-0 z-10" style={{paddingTop: '18px', paddingBottom: '18px'}}>
        <h1 className="text-lg font-black text-white" style={{marginLeft: '10px'}}>🌿 말벗이 내 손 안에</h1>
        <div className="flex items-center gap-3" style={{marginRight: '20px'}}>
          <button onClick={() => navigate('/personas')} className="text-gray-400 font-bold text-sm">🎭 말벗</button>
          <button onClick={handleLogout} className="text-gray-500 font-bold text-sm">로그아웃</button>
        </div>
      </header>

      {/* 탭 */}
      <div className="bg-black border-b border-gray-800 flex" style={{paddingLeft: '15px', paddingRight: '15px'}}>
        <button
          onClick={() => setTab('list')}
          className={`flex-1 py-3 text-sm font-black transition border-b-2 ${tab === 'list' ? 'text-white border-blue-500' : 'text-gray-600 border-transparent'}`}
        >
          📋 목록
        </button>
        <button
          onClick={() => setTab('calendar')}
          className={`flex-1 py-3 text-sm font-black transition border-b-2 ${tab === 'calendar' ? 'text-white border-blue-500' : 'text-gray-600 border-transparent'}`}
        >
          📅 캘린더
        </button>
      </div>

      {/* 검색바 (목록 탭에서만) */}
      {tab === 'list' && (
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
      )}

      {/* 본문 */}
      <main className="flex-1 py-4 overflow-y-auto" style={{paddingLeft: '15px', paddingRight: '15px'}}>
        {loading ? (
          <p className="text-center text-gray-600 mt-10 font-bold">불러오는 중...</p>
        ) : tab === 'calendar' ? (
          <CalendarView diaries={diaries} onDiaryClick={(id) => navigate(`/diary/${id}`)} />
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
