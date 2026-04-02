import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Menu, X, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSelector from './LanguageSelector'

const Layout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-slate-800">LinguaRead</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-slate-600 hover:text-primary transition-colors">
                {t('nav.home')}
              </Link>
              {user ? (
                <>
                  <Link to="/dashboard" className="text-slate-600 hover:text-primary transition-colors">
                    {t('nav.myLibrary')}
                  </Link>
                  <Link to="/vocabulary" className="text-slate-600 hover:text-primary transition-colors">
                    Vocabulary
                  </Link>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-600">{user.name}</span>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-slate-600 hover:text-red-500 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    to="/login"
                    className="text-slate-600 hover:text-primary transition-colors"
                  >
                    {t('nav.signIn')}
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    {t('nav.signUp')}
                  </Link>
                </div>
              )}
              <LanguageSelector />
            </nav>

            <div className="flex items-center gap-2 md:hidden">
              <LanguageSelector />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200">
            <div className="px-4 py-4 space-y-3">
              <Link
                to="/"
                className="block text-slate-600 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.home')}
              </Link>
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block text-slate-600 hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.myLibrary')}
                  </Link>
                  <Link
                    to="/vocabulary"
                    className="block text-slate-600 hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Vocabulary
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-slate-600 hover:text-red-500"
                  >
                    <LogOut className="h-4 w-4" />
                    {t('nav.signOut')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block text-slate-600 hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.signIn')}
                  </Link>
                  <Link
                    to="/register"
                    className="block bg-primary text-white px-4 py-2 rounded-lg text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.signUp')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-slate-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400">© 2024 LinguaRead. {t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout