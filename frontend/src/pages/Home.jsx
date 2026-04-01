import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, Headphones, Sparkles, ArrowRight } from 'lucide-react'

const Home = () => {
  const { t } = useTranslation()

  const features = [
    {
      icon: BookOpen,
      title: t('home.features.parallelReading.title'),
      description: t('home.features.parallelReading.description'),
    },
    {
      icon: Headphones,
      title: t('home.features.synchronizedAudio.title'),
      description: t('home.features.synchronizedAudio.description'),
    },
    {
      icon: Sparkles,
      title: t('home.features.aiContent.title'),
      description: t('home.features.aiContent.description'),
    },
  ]

  return (
    <div>
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
              {t('home.title').split(' ')[0]}{' '}
              <span className="text-primary">{t('home.title').split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
              {t('home.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-primary text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-dark transition-colors inline-flex items-center justify-center gap-2"
              >
                {t('home.getStarted')} <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="bg-white text-primary border-2 border-primary px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary/5 transition-colors inline-flex items-center justify-center gap-2"
              >
                {t('home.alreadyHaveAccount')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
            Why LinguaRead?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-50 p-8 rounded-xl hover:shadow-lg transition-shadow"
              >
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('home.features.levelsForEveryone.title')}
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">
              {t('home.features.levelsForEveryone.description')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {['A1', 'A2', 'B1', 'B2', 'C1'].map((level) => (
                <span
                  key={level}
                  className="bg-white/20 text-white px-4 py-2 rounded-lg font-medium"
                >
                  {level}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home