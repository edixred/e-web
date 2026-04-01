import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, Check } from 'lucide-react'

const LanguageSelector = () => {
  const { i18n, t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ]

  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0]

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode)
    localStorage.setItem('language', langCode)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors"
      >
        <Globe className="h-5 w-5" />
        <span className="text-sm">{currentLanguage.flag} {currentLanguage.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-slate-200 py-2 min-w-[150px] z-50">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
            {t('language.select')}
          </div>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition-colors ${
                i18n.language === lang.code ? 'text-primary' : 'text-slate-700'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
              {i18n.language === lang.code && (
                <Check className="h-4 w-4 ml-auto" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSelector