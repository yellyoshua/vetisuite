import { useState } from 'react'
import { MenuIcon } from 'lucide-react'
import useLogout from '@/hooks/use-logout'
import type { SessionProfile } from '@/stores/session.store'

type HeaderProps = {
  setSidebarOpen: (isOpen: boolean) => void
  profile: SessionProfile
}

export default function Header({ setSidebarOpen, profile }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoggingOut, handleLogout] = useLogout()
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ')

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú de navegación"
          className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <MenuIcon className="w-6 h-6" />
        </button>

        <div className="hidden lg:block">
          <p className="text-xl font-semibold text-gray-900 dark:text-white">
            Panel de Administración
          </p>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-haspopup="menu"
              aria-expanded={isDropdownOpen}
              aria-label="Abrir menú de la cuenta"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                {profile.firstName?.[0]?.toUpperCase() || '-'}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {fullName || '-'}
              </span>
            </button>

            {isDropdownOpen && (
              <>
                <div
                  role="presentation"
                  aria-hidden="true"
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {fullName || '-'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={profile.user.email}>
                      {profile.user.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isLoggingOut}
                    onClick={() => handleLogout()}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
