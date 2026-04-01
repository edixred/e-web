import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useStory, useStoryAudio, useUpdateProgress } from '../hooks/useStories'
import useTextToSpeech from '../hooks/useTextToSpeech'
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Speaker, Loader2, Volume2, VolumeX, Settings } from 'lucide-react'

const Reader = () => {
  const { t } = useTranslation()
  const { storyId } = useParams()
  const [showSettings, setShowSettings] = useState(false)
  
  const { data: story, isLoading } = useStory(storyId)
  const { data: audioData } = useStoryAudio(storyId)
  const updateProgress = useUpdateProgress()
  
  const {
    isSpeaking,
    isPaused,
    currentSentence,
    isSupported,
    ttsMethod,
    togglePlayPause,
    stop,
    skipNext,
    skipPrevious,
    setSpeechRate,
    speechRate,
    selectedVoice,
    setSelectedVoice,
    voices,
  } = useTextToSpeech()

  const sentences_en = story?.content_en?.split('. ').filter(s => s.trim()) || []

  useEffect(() => {
    return () => {
      stop()
    }
  }, [storyId])

  const handlePlayPause = () => {
    if (!isSupported) {
      alert('Text-to-speech is not supported in your browser')
      return
    }
    togglePlayPause(story?.content_en || '')
  }

  const handleSentenceClick = (index) => {
    const textToPlay = sentences_en.slice(index).join('. ')
    togglePlayPause(textToPlay)
  }

  const handleComplete = () => {
    updateProgress.mutate({ storyId, data: { current_position: 100, completed: true } })
  }

  useEffect(() => {
    if (!isSpeaking && currentSentence > 0 && sentences_en.length > 0 && currentSentence >= sentences_en.length - 1) {
      handleComplete()
    }
  }, [isSpeaking, currentSentence, sentences_en.length])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            {t('reader.backToLibrary')}
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{story?.title_en}</h1>
                <p className="text-slate-600 mt-1">{story?.title_es}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Audio: {ttsMethod === 'webSpeech' ? 'Browser TTS' : 'External TTS'}
                </p>
              </div>
              <button
                onClick={() => togglePlayPause(story?.content_en || '')}
                className="p-3 bg-primary rounded-full hover:bg-primary-dark transition-colors"
                title={isSpeaking ? t('reader.player.pause') : t('reader.player.play')}
              >
                {isSpeaking ? (
                  <Pause className="h-6 w-6 text-white" />
                ) : (
                  <Play className="h-6 w-6 text-white" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row split-view">
            <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-slate-200">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                {t('reader.english')}
                <button
                  onClick={() => togglePlayPause(story?.content_en || '')}
                  className="ml-2 text-primary hover:text-primary-dark"
                >
                  <Speaker className="h-4 w-4 inline" />
                </button>
              </h2>
              <div className="story-content space-y-3">
                {sentences_en.map((sentence, index) => (
                  <span
                    key={index}
                    onClick={() => handleSentenceClick(index)}
                    className={`cursor-pointer inline ${
                      index === currentSentence ? 'sentence-active' : ''
                    }`}
                  >
                    {sentence}.
                  </span>
                ))}
              </div>
            </div>

            <div className="flex-1 p-6">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">{t('reader.spanish')}</h2>
              <div className="story-content space-y-3">
                {story?.content_es?.split('. ').filter(s => s.trim()).map((sentence, index) => (
                  <span
                    key={index}
                    className={`inline ${index === currentSentence ? 'sentence-active' : ''}`}
                  >
                    {sentence}.
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg md:relative md:bg-transparent md:border-0 md:shadow-0">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={skipPrevious}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                  title={t('reader.player.skipBack')}
                >
                  <SkipBack className="h-5 w-5 text-slate-600" />
                </button>

                <button
                  onClick={handlePlayPause}
                  className="p-3 bg-primary rounded-full hover:bg-primary-dark transition-colors"
                  title={isSpeaking ? t('reader.player.pause') : t('reader.player.play')}
                >
                  {isSpeaking ? (
                    <Pause className="h-6 w-6 text-white" />
                  ) : (
                    <Play className="h-6 w-6 text-white" />
                  )}
                </button>

                <button
                  onClick={skipNext}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                  title={t('reader.player.skipForward')}
                >
                  <SkipForward className="h-5 w-5 text-slate-600" />
                </button>
              </div>

              <div className="flex-1 max-w-md hidden md:block">
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ 
                      width: sentences_en.length > 0 
                        ? `${(currentSentence / (sentences_en.length - 1 || 1)) * 100}%` 
                        : '0%' 
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>
                    {isSpeaking 
                      ? `Reading: ${currentSentence + 1}/${sentences_en.length}` 
                      : isPaused 
                        ? 'Paused' 
                        : 'Ready to play'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const newRate = speechRate >= 1.5 ? 0.5 : speechRate + 0.25
                    setSpeechRate(parseFloat(newRate.toFixed(2)))
                  }}
                  className="px-3 py-1 bg-slate-100 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  {speechRate}x
                </button>

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                  title="Settings"
                >
                  <Settings className="h-5 w-5 text-slate-600" />
                </button>

                <button
                  onClick={stop}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                  title="Stop"
                >
                  <VolumeX className="h-5 w-5 text-slate-600" />
                </button>
              </div>
            </div>

            {showSettings && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <h4 className="text-sm font-medium text-slate-700 mb-2">Audio Settings</h4>
                <div className="flex flex-wrap gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Voice</label>
                    <select
                      value={selectedVoice?.name || ''}
                      onChange={(e) => {
                        const voice = voices.find(v => v.name === e.target.value)
                        if (voice) setSelectedVoice(voice)
                      }}
                      className="px-2 py-1 border border-slate-300 rounded text-sm"
                    >
                      <option value="">Default</option>
                      {voices.slice(0, 15).map((voice) => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name.split(' ')[0]} ({voice.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Speed: {speechRate}x</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.25"
                      value={speechRate}
                      onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                      className="w-24"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">TTS Method</label>
                    <span className="text-sm text-slate-700">
                      {ttsMethod === 'webSpeech' ? 'Browser (Web Speech API)' : 'External (Cloud TTS)'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reader