import { useState, useCallback, useEffect } from 'react'

export function useTTS() {
  const [enabled, setEnabled] = useState(() => {
    const saved = localStorage.getItem('tts_enabled')
    return saved === null ? true : saved === 'true'
  })
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    localStorage.setItem('tts_enabled', String(enabled))
    if (!enabled) {
      window.speechSynthesis?.cancel()
      setSpeaking(false)
    }
  }, [enabled])

  const speak = useCallback((text) => {
    if (!enabled || !text) return
    window.speechSynthesis?.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ko-KR'
    utterance.rate = 0.9
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }, [enabled])

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }, [])

  const toggle = useCallback(() => {
    setEnabled((prev) => !prev)
  }, [])

  return { enabled, speaking, speak, stop, toggle }
}
