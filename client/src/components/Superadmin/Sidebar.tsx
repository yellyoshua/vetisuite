import { Link, useLocation } from 'react-router'
import { LayoutDashboardIcon, ShieldIcon, UserIcon, UsersIcon } from 'lucide-react'

type SidebarProps = {
  sidebarOpen: boolean
  setSidebarOpen: (isOpen: boolean) => void
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const { pathname } = useLocation()

  const menuItems = [
    {
      name: 'Panel general',
      href: '/',
      icon: <LayoutDashboardIcon className="w-6 h-6" />,
    },
    {
      name: 'Superadmins',
      href: '/superadmins',
      icon: <ShieldIcon className="w-6 h-6" />,
    },
    {
      name: 'Dueños',
      href: '/owners',
      icon: <UsersIcon className="w-6 h-6" />,
    },
    {
      name: 'Perfil',
      href: '/profile',
      icon: <UserIcon className="w-6 h-6" />,
    },
  ]

  return (
    <>
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div role="img" aria-label="Veti Suite" className="flex items-center shrink-0 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
            <img
              src="/assets/images/logo-white.png"
              alt=""
              className="dark:block hidden h-14 w-auto"
            />
            <img
              src="/assets/images/logo-base.png"
              alt=""
              className="dark:hidden block h-14 w-auto"
            />
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150
                    ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
                  `}
                >
                  {item.icon}
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:hidden
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700">
            <img
              src="/assets/images/logo-white.png"
              alt="Veti Suite"
              className="h-14 w-auto"
            />
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar menú de navegación"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150
                    ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
                  `}
                >
                  {item.icon}
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}
