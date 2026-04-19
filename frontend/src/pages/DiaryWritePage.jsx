import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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
  맑음: '#fbbf24', // amber-400
  흐림: '#94a3b8', // slate-400
  비:   '#60a5fa', // blue-400
  눈:   '#7dd3fc', // sky-300
  바람: '#22d3ee', // cyan-400
}

const WEEKDAYS_SHORT = ['일', '월', '화', '수', '목', '금', '토']
const WEEKDAYS_FULL = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

function DatePicker({ value, onChange }) {
  const [show, setShow] = useState(false)
  const parsed = value ? new Date(value + 'T00:00:00') : new Date()
  const [year, setYear] = useState(parsed.getFullYear())
  const [month, setMonth] = useState(parsed.getMonth())
  const swipeRef = useRef(null)

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

  const onSwipeStart = (x) => { swipeRef.current = x }
  const onSwipeEnd = (x) => {
    if (swipeRef.current === null) return
    const diff = swipeRef.current - x
    if (Math.abs(diff) > 80) { diff > 0 ? nextMonth() : prevMonth() }
    swipeRef.current = null
  }

  return (
    <div className="relative">
      {/* 날짜 표시 */}
      <div
        onClick={() => setShow(s => !s)}
        className="bg-gray-900 border border-gray-800 rounded-md py-3 cursor-pointer hover:border-amber-400 flex items-center justify-between transition"
        style={{paddingLeft: '10px', paddingRight: '12px'}}
      >
        <span className="text-white font-bold text-2xl">{value}</span>
        <div className="flex items-center gap-2">
          {dayName && <span className="text-amber-400 font-bold text-xl">({dayName})</span>}
          <span className="text-gray-500 text-base">📅</span>
        </div>
      </div>

      {/* 달력 팝업 */}
      {show && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShow(false)} />
          <div
            className="absolute left-0 right-0 z-50 bg-gray-900 border border-gray-700 rounded-md mt-1 p-3"
            style={{top: '100%', userSelect: 'none'}}
            onTouchStart={(e) => onSwipeStart(e.touches[0].clientX)}
            onTouchEnd={(e) => onSwipeEnd(e.changedTouches[0].clientX)}
            onMouseDown={(e) => onSwipeStart(e.clientX)}
            onMouseUp={(e) => onSwipeEnd(e.clientX)}
          >
            {/* 월 이동 */}
            <div className="flex items-center justify-between mb-2" style={{paddingLeft: '8px', paddingRight: '8px'}}>
              <button type="button" onClick={prevMonth} className="text-2xl px-1 hover:opacity-60 transition">👈</button>
              <span className="text-white font-black text-sm">{year}년 {month+1}월</span>
              <button type="button" onClick={nextMonth} className="text-2xl px-1 hover:opacity-60 transition">👉</button>
            </div>
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS_SHORT.map((w, i) => (
                <div key={w} className={`text-center text-xs font-black pb-1 ${i===0?'text-red-400':i===6?'text-blue-400':'text-gray-500'}`}>{w}</div>
              ))}
            </div>
            {/* 날짜 셀 — 날짜만, 심플하게 */}
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
                    className={`text-sm font-bold py-2 rounded-md transition
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
  const location = useLocation()
  const editDiary = location.state?.diary || null
  const isEdit = !!editDiary

  const _d = new Date()
  const today = `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, '0')}-${String(_d.getDate()).padStart(2, '0')}`
  const [form, setForm] = useState({
    title:      editDiary?.title      || '',
    content:    editDiary?.content    || '',
    emotion:    editDiary?.emotion    || '평온',
    weather:    editDiary?.weather    || '맑음',
    diary_date: editDiary?.diary_date || today,
    input_type: editDiary?.input_type || 'text',
    persona_id: editDiary?.persona_id || null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [voiceTarget, setVoiceTarget] = useState('content') // 'title' | 'content'
  const [voiceStatus, setVoiceStatus] = useState('')
  const [savedDiary, setSavedDiary] = useState(null)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [aiFeedback, setAiFeedback] = useState('')
  const [personas, setPersonas] = useState([])
  const recognitionRef = useRef(null)
  const voiceTimeoutRef = useRef(null)
  const voiceStoppedRef = useRef(false)
  const { enabled, speaking, speak, toggle } = useTTS()

  const clearVoiceTimeout = () => {
    if (voiceTimeoutRef.current) { clearTimeout(voiceTimeoutRef.current); voiceTimeoutRef.current = null }
  }

  const killVoice = (statusMsg) => {
    voiceStoppedRef.current = true
    clearVoiceTimeout()
    if (recognitionRef.current) {
      recognitionRef.current.onstart = null
      recognitionRef.current.onresult = null
      recognitionRef.current.onerror = null
      recognitionRef.current.onend = null
      try { recognitionRef.current.abort() } catch (_) {}
      recognitionRef.current = null
    }
    setIsListening(false)
    if (statusMsg !== undefined) setVoiceStatus(statusMsg)
  }

  // 페이지 떠날 때 TTS + 음성 중단
  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); killVoice(undefined) }
  }, [])

  // 내 말벗 목록 로드
  useEffect(() => {
    api.get('/personas/').then(setPersonas).catch(() => {})
  }, [])

  // 신규 작성 진입 시 자동 음성 시작
  useEffect(() => {
    if (!isEdit) {
      const t = setTimeout(() => startVoice('title'), 500)
      return () => clearTimeout(t)
    }
  }, [])

  const stopVoice = () => { killVoice('⏹ 중지됐어요. 버튼을 다시 누르세요.') }

  const startVoice = (target = 'content') => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setVoiceStatus('크롬 브라우저를 사용해주세요.')
      return
    }
    killVoice('')  // 기존 인식 완전 종료
    voiceStoppedRef.current = false
    setVoiceTarget(target)

    const recognition = new SpeechRecognition()
    recognition.lang = 'ko-KR'
    recognition.continuous = false
    recognition.interimResults = true
    recognitionRef.current = recognition

    recognition.onstart = () => {
      if (voiceStoppedRef.current) return
      setIsListening(true)
      setVoiceStatus('듣고 있어요... 🎤')
      // 10초 타이머
      clearVoiceTimeout()
      voiceTimeoutRef.current = setTimeout(() => {
        killVoice('⏱ 20초 무응답으로 종료됐어요. 버튼을 다시 누르세요.')
      }, 20000)
    }
    recognition.onresult = (event) => {
      if (voiceStoppedRef.current) return
      // 음성 감지 시 타이머 리셋 (말하는 중에는 계속 연장)
      clearVoiceTimeout()
      voiceTimeoutRef.current = setTimeout(() => {
        killVoice('⏱ 20초 무응답으로 종료됐어요. 버튼을 다시 누르세요.')
      }, 20000)
      let finalText = '', interim = ''
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalText += event.results[i][0].transcript
        else interim += event.results[i][0].transcript
      }
      if (finalText) {
        if (target === 'title') {
          setForm((prev) => ({ ...prev, title: prev.title + (prev.title ? ' ' : '') + finalText }))
        } else {
          setForm((prev) => ({
            ...prev,
            content: prev.content + (prev.content ? ' ' : '') + finalText,
            input_type: 'voice',
          }))
        }
      }
      if (interim) setVoiceStatus(`인식 중: ${interim}`)
    }
    recognition.onerror = (e) => {
      if (voiceStoppedRef.current) return
      if (e.error === 'no-speech') {
        killVoice('⏱ 무응답으로 종료됐어요. 버튼을 다시 누르세요.')
      } else {
        killVoice('다시 시도해주세요.')
      }
    }
    recognition.onend = () => {
      if (voiceStoppedRef.current) return
      killVoice('✅ 입력 완료. 더 쓰려면 버튼을 누르세요.')
    }
    try { recognition.start() } catch (_) { setVoiceStatus('버튼을 눌러 말로 쓰기를 시작하세요.') }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.content.trim()) { setError('내용을 입력해주세요.'); return }
    setLoading(true); setError('')
    try {
      if (isEdit) {
        // 수정 모드: PATCH 후 피드백 재생성
        await api.patch(`/diaries/${editDiary.id}`, form)
        setSavedDiary({ ...editDiary, ...form })
        setFeedbackLoading(true)
        try {
          const result = await api.delete(`/feedback/${editDiary.id}`)
          setAiFeedback(result.ai_feedback)
          if (enabled) speak(result.ai_feedback)
        } catch {
          setAiFeedback('')
        } finally {
          setFeedbackLoading(false)
        }
      } else {
        // 신규 작성: POST 후 피드백 화면
        const diary = await api.post('/diaries/', form)
        setSavedDiary(diary)
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
          <h1 className="text-2xl font-black text-white">이야기 남기기</h1>
          <div style={{width: '40px'}} />
        </header>

        <div className="flex-1 flex flex-col gap-4 overflow-y-auto" style={{paddingLeft: '15px', paddingRight: '15px', paddingTop: '18px', paddingBottom: '20px'}}>
          {/* 저장 완료 메시지 */}
          <div className="bg-gray-900 border border-gray-800 rounded-md p-4 text-center">
            <p className="text-green-400 font-black text-xl">{isEdit ? '✅ 이야기가 수정되었어요' : '✅ 이야기가 저장되었어요'}</p>
            <p className="text-gray-600 font-bold text-xl mt-1">{savedDiary.diary_date}</p>
          </div>

          {/* 말벗의 이야기 */}
          <div className="bg-gray-900 border border-amber-400 border-opacity-30 rounded-md p-4 flex-1">
            <p className="text-amber-400 font-black text-xl mb-3">🌿 말벗의 이야기</p>
            {feedbackLoading ? (
              <p className="text-gray-500 font-bold text-xl text-center py-4">말벗이 생각 중이에요... 🌿</p>
            ) : aiFeedback ? (
              <p className="text-gray-300 font-bold text-xl leading-relaxed" style={{paddingLeft: '5px', paddingRight: '5px'}}>{aiFeedback}</p>
            ) : (
              <p className="text-gray-600 font-bold text-xl text-center py-4">피드백을 가져오지 못했어요</p>
            )}
          </div>

          {/* 하단 버튼 */}
          <button
            onClick={() => navigate(`/diary/${savedDiary.id}`)}
            className="bg-slate-400 hover:bg-slate-300 text-white font-black rounded-md transition" style={{height:'50px', fontSize:'24px'}}
          >
            📖 기록 보러 가기
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-black rounded-md transition" style={{height:'50px', fontSize:'24px'}}
          >
            📋 목록으로 돌아가기
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
        <h1 className="text-2xl font-black text-white">{isEdit ? '이야기 수정하기' : '이야기 남기기'}</h1>
        <div style={{width: '40px'}} />
      </header>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-3 overflow-y-auto" style={{paddingLeft: '15px', paddingRight: '15px', paddingTop: '12px', paddingBottom: '12px'}}>
        {/* 날짜 */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 font-bold text-2xl">날짜</label>
          <DatePicker
            value={form.diary_date}
            onChange={(date) => setForm({ ...form, diary_date: date })}
          />
        </div>

        {/* 제목 */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-gray-500 font-bold text-2xl">제목 (선택)</label>
            <button type="button"
              onClick={() => isListening && voiceTarget === 'title' ? stopVoice() : startVoice('title')}
              className={`px-2 py-0.5 rounded-md text-xl font-black transition
                ${isListening && voiceTarget === 'title' ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-800 text-amber-400 border border-amber-400'}`}
            >
              🎤 {isListening && voiceTarget === 'title' ? '중지' : '말로 쓰기'}
            </button>
          </div>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="제목을 입력하세요"
            className="bg-gray-900 border border-gray-800 rounded-md py-2 text-2xl text-white font-bold placeholder-gray-600 focus:outline-none focus:border-amber-400"
            style={{paddingLeft: '10px'}}
          />
        </div>

        {/* 감정 */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 font-bold text-2xl">오늘의 감정</label>
          <div className="flex flex-wrap gap-1.5">
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
                  className={`pl-2 pr-3 py-1.5 rounded-full text-xl font-bold border transition
                    ${selected ? '' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                >
                  {EMOTION_EMOJI[em]} {em}
                </button>
              )
            })}
          </div>
        </div>

        {/* 날씨 */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 font-bold text-2xl">오늘의 날씨</label>
          <div className="flex flex-wrap gap-1.5">
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
                  className={`pl-2 pr-3 py-1.5 rounded-full text-xl font-bold border transition
                    ${selected ? '' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                >
                  {WEATHER_EMOJI[w]} {w}
                </button>
              )
            })}
          </div>
        </div>

        {/* 내용 + 음성 */}
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center justify-between">
            <label className="text-gray-500 font-bold text-2xl">오늘의 이야기 <span className="text-red-500">*</span></label>
            <button type="button" onClick={() => isListening && voiceTarget === 'content' ? stopVoice() : startVoice('content')}
              className={`px-2 py-0.5 rounded-md text-xl font-black transition
                ${isListening && voiceTarget === 'content' ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-800 text-amber-400 border border-amber-400'}`}
            >
              🎤 {isListening && voiceTarget === 'content' ? '중지' : '말로 쓰기'}
            </button>
          </div>

          {voiceStatus && (
            <p className={`text-xl font-bold px-2 py-1 rounded-md ${isListening ? 'bg-gray-900 text-amber-400' : 'bg-gray-900 text-gray-500'}`}>
              {voiceStatus}
            </p>
          )}

          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="오늘 있었던 일을 자유롭게 적어보세요..."
            className="bg-gray-900 border border-gray-800 rounded-md py-3 text-2xl text-white font-bold placeholder-gray-600 focus:outline-none focus:border-amber-400 resize-none"
            style={{paddingLeft: '10px', paddingRight: '10px', flex: 1, minHeight: '120px'}}
          />
        </div>

        {/* 말벗 선택 */}
        {personas.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-gray-500 font-bold text-2xl">말벗 선택 (선택)</label>
              <button type="button" onClick={() => navigate('/personas')} className="text-amber-400 font-bold text-xl">+ 말벗 관리</button>
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
                  className={`px-3 py-1 rounded-md text-2xl font-bold border transition
                    ${form.persona_id === p.id ? 'bg-amber-400 border-amber-400 text-black' : 'bg-gray-900 border-gray-700 text-gray-400'}`}
                >
                  {PERSONA_ICON[p.preset_type] || '✏️'} {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-red-400 font-bold text-2xl">{error}</p>}

        <button type="submit" disabled={loading}
          className="bg-slate-400 hover:bg-slate-300 text-white font-black rounded-md disabled:opacity-40 transition" style={{height:'50px', fontSize:'24px'}}
        >
          {loading ? (isEdit ? '수정 중...' : '저장 중...') : isEdit ? '✅ 수정 완료' : '💾 저장'}
        </button>
      </form>
    </div>
  )
}
