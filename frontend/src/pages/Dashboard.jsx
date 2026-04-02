import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { useStories, useUserStats, useGenerateStory, useUserProgress } from '../hooks/useStories'
import { BookOpen, Plus, Clock, Flame, ChevronRight, Loader2, BookMarked, Gamepad2 } from 'lucide-react'
import VocabularyMatch from '../components/VocabularyMatch'

const levelColors = {
  A1: 'bg-green-100 text-green-700',
  A2: 'bg-emerald-100 text-emerald-700',
  B1: 'bg-yellow-100 text-yellow-700',
  B2: 'bg-orange-100 text-orange-700',
  C1: 'bg-red-100 text-red-700',
}

const Dashboard = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [levelFilter, setLevelFilter] = useState('')
  const [showGenerate, setShowGenerate] = useState(false)
  const [generateData, setGenerateData] = useState({ level: 'A1', category: 'Adventure', word_count: 800 })
  
  const { data: storiesData, isLoading } = useStories({ level: levelFilter || undefined })
  const { data: stats } = useUserStats()
  const { data: progress } = useUserProgress()
  const generateStory = useGenerateStory()

  const handleGenerate = async () => {
    await generateStory.mutateAsync(generateData)
    setShowGenerate(false)
  }

  const getProgressForStory = (storyId) => {
    return progress?.find(p => p.story_id === storyId)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">{t('dashboard.title')}</h1>
        <p className="text-slate-600 mt-2">{t('dashboard.welcome')}, {user?.name}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-slate-600">{t('dashboard.stats.storiesRead')}</p>
              <p className="text-2xl font-bold text-slate-800">{stats?.total_stories_read || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="bg-secondary/10 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-slate-600">{t('dashboard.stats.readingTime')}</p>
              <p className="text-2xl font-bold text-slate-800">{stats?.total_time_minutes || 0} min</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="bg-accent/10 p-3 rounded-lg">
              <Flame className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-slate-600">{t('dashboard.stats.currentStreak')}</p>
              <p className="text-2xl font-bold text-slate-800">{stats?.current_streak || 0} {stats?.current_streak === 1 ? 'day' : 'days'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-primary" />
          Vocabulary Match
        </h2>
        <VocabularyMatch selectedLevel={levelFilter || 'A1'} />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setLevelFilter('')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              levelFilter === '' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t('dashboard.filters.all')}
          </button>
          {['A1', 'A2', 'B1', 'B2', 'C1'].map((level) => (
            <button
              key={level}
              onClick={() => setLevelFilter(level)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                levelFilter === level ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowGenerate(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t('dashboard.newStory')}
        </button>

        <Link
          to="/vocabulary"
          className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <BookMarked className="h-4 w-4" />
          Vocabulary
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : storiesData?.stories?.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">{t('dashboard.empty.title')}</p>
          <p className="text-sm text-slate-500 mt-1">{t('dashboard.empty.description')}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {storiesData?.stories?.map((story) => {
            const storyProgress = getProgressForStory(story.id)
            return (
              <Link
                key={story.id}
                to={`/reader/${story.id}`}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:scale-[1.02] transition-all group"
              >
                <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-primary/50" />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
                      {story.title_en}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${levelColors[story.level]}`}>
                      {story.level}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4">{story.title_es}</p>
                  
                  {storyProgress && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>{t('dashboard.storyCard.progress')}</span>
                        <span>{storyProgress.completed ? t('dashboard.storyCard.completed') : `${storyProgress.current_position}%`}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${storyProgress.completed ? 'bg-secondary' : 'bg-primary'}`}
                          style={{ width: storyProgress.completed ? '100%' : `${storyProgress.current_position}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-primary font-medium">
                    <span>{t('dashboard.storyCard.startReading')}</span>
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {showGenerate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">{t('dashboard.generateModal.title')}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('dashboard.generateModal.level')}</label>
                <select
                  value={generateData.level}
                  onChange={(e) => setGenerateData({ ...generateData, level: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  {['A1', 'A2', 'B1', 'B2', 'C1'].map((level) => (
                    <option key={level} value={level}>{t(`levels.${level}`)}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('dashboard.generateModal.category')}</label>
                <select
                  value={generateData.category}
                  onChange={(e) => setGenerateData({ ...generateData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  {['Adventure', 'Science Fiction', 'Romance', 'Mystery'].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('dashboard.generateModal.length')}</label>
                <select
                  value={generateData.word_count}
                  onChange={(e) => setGenerateData({ ...generateData, word_count: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value={500}>{t('dashboard.generateModal.lengths.short')}</option>
                  <option value={800}>{t('dashboard.generateModal.lengths.medium')}</option>
                  <option value={1200}>{t('dashboard.generateModal.lengths.long')}</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowGenerate(false)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleGenerate}
                disabled={generateStory.isPending}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
              >
                {generateStory.isPending ? t('dashboard.generateModal.generating') : t('dashboard.generateModal.generate')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard