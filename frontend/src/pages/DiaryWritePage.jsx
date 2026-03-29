import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useTTS } from '../hooks/useTTS'

const EMOTIONS = ['기쁨', '슬픔', '화남', '평온', '설렘', '불안', '피곤', '감사']
const WEATHERS = ['맑음', '흐림', '비', '눈', '바람']
const EMOTION_EMOJI = {
  기쁨: '😊', 슬픔: '😢', 화남: '😠', 평온: '😌',
  설렘: '🥰', 불안: '😰', 피곤: '😴', 감사: '🙏',
}
const WEATHER_EMOJI = { 맑음: '☀️', 흐림: '☁️', 비: '🌧️', 눈: '❄️', 바람: '💨' }

// 감정별 선택 색상 (밝은 배경 + 검은 글씨)
const EMOTION_COLOR = {
  기쁨:  '#fbbf24', // amber
  슬픔:  '#93c5fd', // blue-300
  화남:  '#fca5a5', // red-300
  평온:  '#86efac', // green-300
  설렘:  '#f9a8d4', // pink-300
  불안:  '#fdba74', // orange-300
  피곤:  '#c4b5fd', // violet-300
  감사:  '#5eead4', // teal-300
}
// 날씨별 선택 색상
const WEATHER_COLOR = {
  맑음: '#fde68a', // amber-200
  흐림: '#d1d5db', // gray-300
  비:   '#93c5fd', // blue-300
  눈:   '#e0f2fe', // sky-100
  바람: '#a5f3fc', // cyan-200
}

const WEEKDAYS_SHORT = ['일', '월', '화', '수', '목', '금', '토']
const WEEKDAYS_FULL = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

function DatePicker({ value, onChange }) {
  const [show, setShow] = useState(false)
  const parsed = value ? new Date(value + 'T00:00:00') : new Date()
  const [year, setYear] = useState(parsed.getFullYear())
  const [month, setMonth] = useState(parsed.getMonth())

  const dayName = value ? WEEKDAYS_FULL[new Date(value + 'T00:00:00').getDay()] : ''

  const firstDay = new Date(year, month, 1).getDay()
  const lastDate = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= lastDate; d++) cells.push(d)

  const _t = new Date()
  const todayStr = `${_t.getFullYear()}-${String(_t.getMonth()+1).padStart(2,'0')}-${String(_t.getDate()).padStart(2,'0')}`

  const handleSelect = (day) => {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    onChange(dateStr)
    setShow(false)
  }
  const prevMonth = () => { if (month===0){setYear(y=>y-1);setMonth(11)}else setMonth(m=>m-1) }
  const nextMonth = () => { if (month===11){setYear(y=>y+1);setMonth(0)}else setMonth(m=>m+1) }

  return (
    <div className="relative">
      {/* 날짜 표시 버튼 */}
      <div
        onClick={() => setShow(s => !s)}
        className="bg-gray-900 border border-gray-800 rounded-md py-3 cursor-pointer hover:border-amber-400 flex items-center justify-between transition"
        style={{paddingLeft: '10px', paddingRight: '12px'}}
      >
        <span className="text-white font-bold text-base">{value}</span>
        <div className="flex items-center gap-2">
          {dayName && <span className="text-amber-400 font-bold text-sm">({dayName})</span>}
          <span className="text-gray-500 text-base">📅</span>
        </div>
      </div>

      {/* 달력 팝업 */}
      {show && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShow(false)} />
          <div className="absolute left-0 right-0 z-50 bg-gray-900 border border-gray-700 rounded-md mt-1 p-3" style={{top: '100%'}}>
            {/* 월 이동 */}
            <div className="flex items-center justify-between mb-2">
              <button type="button" onClick={prevMonth} className="text-gray-400 text-xl px-2 py-1 hover:text-white">‹</button>
              <span className="text-white font-black text-sm">{year}년 {month+1}월</span>
              <button type="button" onClick={nextMonth} className="text-gray-400 text-xl px-2 py-1 hover:text-white">›</button>
            </div>
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS_SHORT.map((w, i) => (
                <div key={w} className={`text-center text-xs font-black pb-1 ${i===0?'text-red-400':i===6?'text-blue-400':'text-gray-500'}`}>{w}</div>
              ))}
            </div>
            {/* 날짜 셀 */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {cells.map((day, idx) => {
                if (!day) return <div key={`e-${idx}`} />
                const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
                const isSelected = dateStr === value
                const isToday = dateStr === todayStr
                const col = idx % 7
                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => handleSelect(day)}
                    style={isSelected ? {backgroundColor:'#fbbf24', color:'#000'} : {}}
                    className={`text-sm font-bold py-1.5 rounded-md transition
                      ${isSelected ? '' : isToday ? 'bg-gray-700 text-amber-400' : 'hover:bg-gray-700'}
                      ${!isSelected && !isToday ? (col===0?'text-red-400':col===6?'text-blue-400':'text-gray-300') : ''}`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function TTSToggle({ enabled, speaking, onToggle, onSpeak, hasFeedback }) {
  return (
    <div className="flex items-center gap-2">
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

const PERSONA_ICON = { empathy: '🤗', advice: '💡', custom: '✏️' }

export default function DiaryWritePage() {
  const navigate = useNavigate()
  const _d = new Date()
  const today = `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, '0')}-${String(_d.getDate()).padStart(2, '0')}`
  const [form, setForm] = useState({
    title: '', content: '', emotion: '평온', weather: '맑음',
    diary_date: today, input_type: 'text', persona_id: null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState('')
  const [savedDiary, setSavedDiary] = useState(null)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [aiFeedback, setAiFeedback] = useState('')
  const [personas, setPersonas] = useState([])
  const recognitionRef = useRef(null)
  const { enabled, speaking, speak, toggle } = useTTS()

  // 페이지 떠날 때 TTS 중단
  useEffect(() => {
    return () => { window.speechSynthesis?.cancel() }
  }, [])

  // 내 말벗 목록 로드
  useEffect(() => {
    api.get('/personas/').then(setPersonas).catch(() => {})
  }, [])

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setVoiceStatus('크롬 브라우저를 사용해주세요.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'ko-KR'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onstart = () => { setIsListening(true); setVoiceStatus('듣고 있어요... 🎤') }
    recognition.onresult = (event) => {
      let interim = '', final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript
        else interim += event.results[i][0].transcript
      }
      if (final) {
        setForm((prev) => ({
          ...prev,
          content: prev.content + (prev.content ? ' ' : '') + final,
          input_type: 'voice',
        }))
      }
      if (interim) setVoiceStatus(`인식 중: ${interim}`)
    }
    recognition.onerror = () => { setIsListening(false); setVoiceStatus('다시 시도해주세요.') }
    recognition.onend = () => { setIsListening(false); setVoiceStatus('음성 입력 완료') }
    recognitionRef.current = recognition
    recognition.start()
  }

  const stopVoice = () => recognitionRef.current?.stop()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.content.trim()) { setError('내용을 입력해주세요.'); return }
    setLoading(true); setError('')
    try {
      const diary = await api.post('/diaries/', form)
      setSavedDiary(diary)
      // 피드백 자동 생성
      setFeedbackLoading(true)
      try {
        const result = await api.post(`/feedback/${diary.id}`, {})
        setAiFeedback(result.ai_feedback)
        if (enabled) speak(result.ai_feedback)
      } catch {
        setAiFeedback('')
      } finally {
        setFeedbackLoading(false)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 저장 완료 후 화면
  if (savedDiary) {
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
              onSpeak={() => speak(aiFeedback)}
              hasFeedback={!!aiFeedback}
            />
          </div>
          <h1 className="text-lg font-black text-white">이야기 남기기</h1>
          <div style={{width: '40px'}} />
        </header>

        <div className="flex-1 py-4 flex flex-col gap-4" style={{paddingLeft: '15px', paddingRight: '15px'}}>
          {/* 저장 완료 메시지 */}
          <div className="bg-gray-900 border border-gray-800 rounded-md p-4 text-center">
            <p className="text-green-400 font-black text-base">✅ 이야기가 저장되었어요</p>
            <p className="text-gray-600 font-bold text-sm mt-1">{savedDiary.diary_date}</p>
          </div>

          {/* 말벗의 이야기 */}
          <div className="bg-gray-900 border border-amber-400 border-opacity-30 rounded-md p-4 flex-1">
            <p className="text-amber-400 font-black text-sm mb-3">🌿 말벗의 이야기</p>
            {feedbackLoading ? (
              <p className="text-gray-500 font-bold text-sm text-center py-4">말벗이 생각 중이에요... 🌿</p>
            ) : aiFeedback ? (
              <p className="text-gray-300 font-bold text-base leading-relaxed" style={{paddingLeft: '5px', paddingRight: '5px'}}>{aiFeedback}</p>
            ) : (
              <p className="text-gray-600 font-bold text-sm text-center py-4">피드백을 가져오지 못했어요</p>
            )}
          </div>

          {/* 하단 버튼 */}
          <button
            onClick={() => navigate(`/diary/${savedDiary.id}`)}
            className="bg-slate-400 hover:bg-slate-300 text-white font-black rounded-md py-4 text-lg transition"
          >
            📖 기록 보러 가기
          </button>
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 font-bold text-sm text-center py-2"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  // 작성 화면
  return (
    <div className="flex-1 bg-black flex flex-col">
      {/* 헤더 */}
      <header className="bg-black border-b border-gray-800 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-500 font-black text-xl">←</button>
          <TTSToggle
            enabled={enabled}
            speaking={speaking}
            onToggle={toggle}
            onSpeak={null}
            hasFeedback={false}
          />
        </div>
        <h1 className="text-lg font-black text-white">이야기 남기기</h1>
        <div style={{width: '40px'}} />
      </header>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 overflow-y-auto" style={{paddingLeft: '15px', paddingRight: '15px', paddingTop: '18px', paddingBottom: '20px'}}>
        {/* 날짜 */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 font-bold text-sm">날짜</label>
          <DatePicker
            value={form.diary_date}
            onChange={(date) => setForm({ ...form, diary_date: date })}
          />
        </div>

        {/* 제목 */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 font-bold text-sm">제목 (선택)</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="제목을 입력하세요"
            className="bg-gray-900 border border-gray-800 rounded-md py-3 text-base text-white font-bold placeholder-gray-600 focus:outline-none focus:border-amber-400"
            style={{paddingLeft: '10px'}}
          />
        </div>

        {/* 감정 */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-500 font-bold text-sm">오늘의 감정</label>
          <div className="flex flex-wrap gap-2">
            {EMOTIONS.map((em) => {
              const selected = form.emotion === em
              return (
                <button key={em} type="button"
                  onClick={() => setForm({ ...form, emotion: form.emotion === em ? '' : em })}
                  style={selected ? {
                    backgroundColor: EMOTION_COLOR[em],
                    borderColor: EMOTION_COLOR[em],
                    color: '#000',
                  } : {}}
                  className={`pl-3 pr-4 py-1.5 rounded-full text-sm font-bold border transition
                    ${selected ? '' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                >
                  {EMOTION_EMOJI[em]} {em}
                </button>
              )
            })}
          </div>
        </div>

        {/* 날씨 */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-500 font-bold text-sm">오늘의 날씨</label>
          <div className="flex flex-wrap gap-2">
            {WEATHERS.map((w) => {
              const selected = form.weather === w
              return (
                <button key={w} type="button"
                  onClick={() => setForm({ ...form, weather: form.weather === w ? '' : w })}
                  style={selected ? {
                    backgroundColor: WEATHER_COLOR[w],
                    borderColor: WEATHER_COLOR[w],
                    color: '#000',
                  } : {}}
                  className={`pl-3 pr-4 py-1.5 rounded-full text-sm font-bold border transition
                    ${selected ? '' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                >
                  {WEATHER_EMOJI[w]} {w}
                </button>
              )
            })}
          </div>
        </div>

        {/* 내용 + 음성 */}
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center justify-between">
            <label className="text-gray-500 font-bold text-sm">오늘의 이야기 <span className="text-red-500">*</span></label>
            <button type="button" onClick={isListening ? stopVoice : startVoice}
              className={`px-3 py-1 rounded-md text-sm font-black transition
                ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-800 text-amber-400 border border-amber-400'}`}
            >
              🎤 {isListening ? '중지' : '말로 쓰기'}
            </button>
          </div>

          {voiceStatus && (
            <p className={`text-sm font-bold px-3 py-2 rounded-md ${isListening ? 'bg-gray-900 text-amber-400' : 'bg-gray-900 text-gray-500'}`}>
              {voiceStatus}
            </p>
          )}

          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="오늘 있었던 일을 자유롭게 적어보세요..."
            className="bg-gray-900 border border-gray-800 rounded-md py-3 text-base text-white font-bold placeholder-gray-600 focus:outline-none focus:border-amber-400 resize-none"
            style={{paddingLeft: '10px', paddingRight: '10px', flex: 1, minHeight: '120px'}}
          />
        </div>

        {/* 말벗 선택 */}
        {personas.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-gray-500 font-bold text-sm">말벗 선택 (선택)</label>
              <button type="button" onClick={() => navigate('/personas')} className="text-amber-400 font-bold text-xs">+ 말벗 관리</button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setForm({ ...form, persona_id: null })}
                className={`px-3 py-1 rounded-md text-sm font-bold border transition
                  ${!form.persona_id ? 'bg-amber-400 border-amber-400 text-black' : 'bg-gray-900 border-gray-700 text-gray-400'}`}
              >
                🌿 기본
              </button>
              {personas.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setForm({ ...form, persona_id: form.persona_id === p.id ? null : p.id })}
                  className={`px-3 py-1 rounded-md text-sm font-bold border transition
                    ${form.persona_id === p.id ? 'bg-amber-400 border-amber-400 text-black' : 'bg-gray-900 border-gray-700 text-gray-400'}`}
                >
                  {PERSONA_ICON[p.preset_type] || '✏️'} {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-red-400 font-bold text-sm">{error}</p>}

        <button type="submit" disabled={loading}
          className="bg-slate-400 hover:bg-slate-300 text-white font-black rounded-md py-4 text-lg disabled:opacity-40 transition"
        >
          {loading ? '저장 중...' : '💾 저장'}
        </button>
      </form>
    </div>
  )
}
