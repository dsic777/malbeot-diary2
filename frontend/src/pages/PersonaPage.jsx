import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

const PRESETS = [
  {
    preset_type: 'empathy',
    name: '공감형 말벗',
    icon: '🤗',
    desc: '따뜻하게 들어주는 할머니 스타일',
    custom_description: '따뜻하고 공감적인 할머니처럼 말해주세요. 판단 없이 들어주고 위로해주세요.',
  },
  {
    preset_type: 'advice',
    name: '조언형 말벗',
    icon: '💡',
    desc: '솔직한 친구 스타일',
    custom_description: '솔직하고 현실적인 친구처럼 말해주세요. 필요하면 가벼운 조언도 해주세요.',
  },
]

export default function PersonaPage() {
  const navigate = useNavigate()
  const [personas, setPersonas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customDesc, setCustomDesc] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/personas/')
      .then(setPersonas)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleAddPreset = async (preset) => {
    // 이미 같은 타입이 있으면 추가 안 함
    if (personas.some((p) => p.preset_type === preset.preset_type)) return
    setSaving(true)
    try {
      const created = await api.post('/personas/', {
        name: preset.name,
        preset_type: preset.preset_type,
        custom_description: preset.custom_description,
      })
      setPersonas((prev) => [...prev, created])
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAddCustom = async (e) => {
    e.preventDefault()
    if (!customName.trim() || !customDesc.trim()) return
    setSaving(true)
    try {
      const created = await api.post('/personas/', {
        name: customName.trim(),
        preset_type: 'custom',
        custom_description: customDesc.trim(),
      })
      setPersonas((prev) => [...prev, created])
      setCustomName('')
      setCustomDesc('')
      setShowCustomForm(false)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('이 말벗을 삭제할까요?')) return
    try {
      await api.delete(`/personas/${id}`)
      setPersonas((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  const getIcon = (p) => {
    if (p.preset_type === 'empathy') return '🤗'
    if (p.preset_type === 'advice') return '💡'
    return '✏️'
  }

  return (
    <div className="flex-1 bg-black flex flex-col">
      {/* 헤더 */}
      <header className="bg-black border-b border-gray-800 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => navigate('/')} className="text-gray-500 font-black text-xl">←</button>
        <h1 className="text-xl font-black text-white">말벗 설정</h1>
        <div style={{width: '24px'}} />
      </header>

      <div className="flex-1 py-4 flex flex-col gap-5" style={{paddingLeft: '15px', paddingRight: '15px'}}>

        {/* 프리셋 추가 */}
        <div>
          <p className="text-gray-500 font-bold text-lg mb-3">프리셋 말벗 추가</p>
          <div className="flex flex-col gap-2">
            {PRESETS.map((preset) => {
              const already = personas.some((p) => p.preset_type === preset.preset_type)
              return (
                <button
                  key={preset.preset_type}
                  onClick={() => handleAddPreset(preset)}
                  disabled={already || saving}
                  className={`flex items-center gap-3 p-4 rounded-md border text-left transition
                    ${already
                      ? 'bg-gray-900 border-gray-700 opacity-40 cursor-not-allowed'
                      : 'bg-gray-900 border-gray-700 hover:border-amber-400'}`}
                >
                  <span className="text-2xl">{preset.icon}</span>
                  <div className="flex-1">
                    <p className="text-white font-black text-lg">{preset.name}</p>
                    <p className="text-gray-500 font-bold text-base mt-0.5">{preset.desc}</p>
                  </div>
                  {already
                    ? <span className="text-green-500 font-bold text-base">추가됨</span>
                    : <span className="text-amber-400 font-bold text-base">+ 추가</span>
                  }
                </button>
              )
            })}

            {/* 직접 설정 버튼 */}
            <button
              onClick={() => setShowCustomForm((v) => !v)}
              className="flex items-center gap-3 p-4 rounded-md border border-gray-700 bg-gray-900 hover:border-amber-400 text-left transition"
            >
              <span className="text-2xl">✏️</span>
              <div className="flex-1">
                <p className="text-white font-black text-lg">직접 설정</p>
                <p className="text-gray-500 font-bold text-base mt-0.5">나만의 말벗 캐릭터 만들기</p>
              </div>
              <span className="text-amber-400 font-bold text-base">{showCustomForm ? '▲' : '+ 추가'}</span>
            </button>

            {/* 직접 설정 폼 */}
            {showCustomForm && (
              <form onSubmit={handleAddCustom} className="bg-gray-900 border border-amber-400 border-opacity-30 rounded-md p-4 flex flex-col gap-3">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="말벗 이름 (예: 든든한 언니)"
                  className="bg-black border border-gray-700 rounded-md py-2 text-xl text-white font-bold placeholder-gray-600 focus:outline-none focus:border-amber-400"
                  style={{paddingLeft: '10px'}}
                  required
                />
                <textarea
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="말벗 성격 설명 (예: 유머 있고 솔직한 언니처럼 말해주세요)"
                  rows={3}
                  className="bg-black border border-gray-700 rounded-md py-2 text-xl text-white font-bold placeholder-gray-600 focus:outline-none focus:border-amber-400 resize-none"
                  style={{paddingLeft: '10px'}}
                  required
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-amber-400 text-black font-black rounded-md disabled:opacity-40" style={{height:'50px', fontSize:'24px'}}
                >
                  {saving ? '저장 중...' : '말벗 추가'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 내 말벗 목록 */}
        <div>
          <p className="text-gray-500 font-bold text-lg mb-3">내 말벗 목록</p>
          {loading ? (
            <p className="text-gray-600 font-bold text-lg text-center py-4">불러오는 중...</p>
          ) : personas.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <div className="text-4xl mb-3">🌿</div>
              <p className="font-bold text-lg">아직 말벗이 없어요</p>
              <p className="font-bold text-base mt-1">위에서 말벗을 추가해 보세요</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {personas.map((p) => (
                <div key={p.id} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-md p-4">
                  <span className="text-2xl">{getIcon(p)}</span>
                  <div className="flex-1">
                    <p className="text-white font-black text-lg">{p.name}</p>
                    {p.custom_description && (
                      <p className="text-gray-500 font-bold text-base mt-0.5 line-clamp-1">{p.custom_description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-500 font-bold text-base"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
