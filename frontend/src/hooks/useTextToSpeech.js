import { useState, useEffect, useRef, useCallback } from 'react'

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentSentence, setCurrentSentence] = useState(0)
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [speechRate, setSpeechRate] = useState(1)
  const [isSupported, setIsSupported] = useState(true)
  const [ttsMethod, setTtsMethod] = useState('web Speech')
  
  const synthRef = useRef(null)
  const audioRef = useRef(null)
  const sentencesRef = useRef([])
  const currentIndexRef = useRef(0)
  const isManualPauseRef = useRef(false)
  const abortControllerRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis
      setTtsMethod('webSpeech')
      loadVoices()
    } else if (typeof window !== 'undefined') {
      setTtsMethod('coqui')
      setIsSupported(true)
    }

    return () => {
      cleanup()
    }
  }, [])

  const cleanup = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  const loadVoices = () => {
    if (!synthRef.current) return
    
    try {
      const availableVoices = synthRef.current.getVoices()
      setVoices(availableVoices)
      
      if (availableVoices.length > 0) {
        const englishVoice = availableVoices.find(v => 
          (v.lang.includes('en') || v.lang.startsWith('en')) && 
          (v.name.includes('Google') || v.name.includes('English'))
        ) || availableVoices.find(v => v.lang.includes('en'))
        
        if (englishVoice) {
          setSelectedVoice(englishVoice)
        }
      }
    } catch (e) {
      console.warn('Could not load voices:', e)
    }
  }

  const speakWithCoqui = useCallback(async (text) => {
    cleanup()
    
    const sentences = text.split('. ').filter(s => s.trim())
    sentencesRef.current = sentences
    currentIndexRef.current = 0
    setIsSpeaking(true)
    setIsPaused(false)
    setCurrentSentence(0)
    isManualPauseRef.current = false

    const playNext = async (index) => {
      if (index >= sentences.length || isManualPauseRef.current) {
        setIsSpeaking(false)
        setCurrentSentence(0)
        return
      }

      setCurrentSentence(index)
      const sentence = sentences[index].trim()
      if (!sentence) {
        playNext(index + 1)
        return
      }

      const encodedText = encodeURIComponent(sentence)
      const url = `https://r.jina.ai/http://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodedText}`
      
      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to fetch')
        
        const blob = await response.blob()
        const audioUrl = URL.createObjectURL(blob)
        
        audioRef.current = new Audio(audioUrl)
        
        audioRef.current.onended = () => {
          URL.revokeObjectURL(audioUrl)
          if (!isManualPauseRef.current) {
            currentIndexRef.current = index + 1
            setTimeout(() => playNext(index + 1), 200)
          }
        }

        audioRef.current.onerror = () => {
          setIsSpeaking(false)
        }

        await audioRef.current.play()
      } catch (err) {
        console.error('TTS error:', err)
        setIsSpeaking(false)
      }
    }

    playNext(0)
  }, [])

  const speakWithWebSpeech = useCallback((text) => {
    if (!synthRef.current || !text) return

    synthRef.current.cancel()
    
    sentencesRef.current = text.split('. ').filter(s => s.trim())
    if (sentencesRef.current.length === 0) {
      sentencesRef.current = text.split(/\.\s+/).filter(s => s.trim())
    }
    
    currentIndexRef.current = 0
    isManualPauseRef.current = false
    setIsSpeaking(true)
    setIsPaused(false)
    setCurrentSentence(0)
    
    speakNextWebSpeech(0)
  }, [selectedVoice, speechRate])

  const speakNextWebSpeech = (index) => {
    if (!synthRef.current || index >= sentencesRef.current.length) {
      setIsSpeaking(false)
      setCurrentSentence(0)
      return
    }

    const sentence = sentencesRef.current[index].trim()
    if (!sentence) {
      speakNextWebSpeech(index + 1)
      return
    }

    const utterance = new SpeechSynthesisUtterance(sentence)
    
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }
    
    utterance.rate = speechRate
    utterance.pitch = 1
    utterance.volume = 1
    utterance.lang = 'en-US'

    utterance.onend = () => {
      if (!isManualPauseRef.current) {
        currentIndexRef.current = index + 1
        setCurrentSentence(index + 1)
        
        if (index + 1 < sentencesRef.current.length) {
          setTimeout(() => speakNextWebSpeech(index + 1), 200)
        } else {
          setIsSpeaking(false)
          setCurrentSentence(0)
        }
      }
    }

    utterance.onerror = (event) => {
      console.error('Speech error:', event.error)
      if (event.error !== 'interrupted') {
        setIsSpeaking(false)
      }
    }

    synthRef.current.speak(utterance)
  }

  const speak = useCallback((text) => {
    if (!text) return

    cleanup()
    
    if (ttsMethod === 'coqui') {
      speakWithCoqui(text)
    } else {
      try {
        speakWithWebSpeech(text)
      } catch (e) {
        console.warn('Web speech failed, trying coqui:', e)
        setTtsMethod('coqui')
        speakWithCoqui(text)
      }
    }
  }, [ttsMethod, speakWithWebSpeech, speakWithCoqui])

  const stop = useCallback(() => {
    cleanup()
    isManualPauseRef.current = false
    setIsSpeaking(false)
    setIsPaused(false)
    setCurrentSentence(0)
    currentIndexRef.current = 0
  }, [])

  const pause = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.pause()
    }
    if (audioRef.current) {
      audioRef.current.pause()
    }
    isManualPauseRef.current = true
    setIsPaused(true)
  }, [])

  const resume = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.resume()
    }
    if (audioRef.current) {
      audioRef.current.play()
    }
    isManualPauseRef.current = false
    setIsPaused(false)
  }, [])

  const togglePlayPause = useCallback((text) => {
    if (!text) return
    
    if (isSpeaking && !isPaused) {
      pause()
    } else if (isPaused) {
      resume()
    } else {
      speak(text)
    }
  }, [isSpeaking, isPaused, speak, pause, resume])

  const skipNext = useCallback(() => {
    cleanup()
    
    if (currentIndexRef.current < sentencesRef.current.length - 1) {
      currentIndexRef.current += 1
      setCurrentSentence(currentIndexRef.current)
      
      const textToPlay = sentencesRef.current.slice(currentIndexRef.current).join('. ')
      speak(textToPlay)
    }
  }, [speak])

  const skipPrevious = useCallback(() => {
    cleanup()
    
    if (currentIndexRef.current > 0) {
      currentIndexRef.current -= 1
      setCurrentSentence(currentIndexRef.current)
      
      const textToPlay = sentencesRef.current.slice(currentIndexRef.current).join('. ')
      speak(textToPlay)
    }
  }, [speak])

  const setVoice = useCallback((voice) => {
    setSelectedVoice(voice)
  }, [])

  return {
    isSpeaking,
    isPaused,
    currentSentence,
    totalSentences: sentencesRef.current.length,
    voices,
    selectedVoice,
    speechRate,
    isSupported,
    ttsMethod,
    setSelectedVoice: setVoice,
    setSpeechRate: (rate) => setSpeechRate(parseFloat(rate.toFixed(2))),
    play: speak,
    pause,
    resume,
    stop,
    togglePlayPause,
    skipNext,
    skipPrevious,
    speak,
  }
}

export default useTextToSpeech