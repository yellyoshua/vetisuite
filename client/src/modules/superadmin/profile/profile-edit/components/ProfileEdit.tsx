import { Link } from 'react-router'
import { CheckCircleIcon, XCircleIcon } from 'lucide-react'
import { getPictureSrc } from '@/lib/utils'
import { formatDate } from '@/lib/date'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import SendEmailVerificationButton from '@/components/SendEmailVerificationButton/SendEmailVerificationButton'
import emailVerificationService from '@/modules/superadmin/profile/email-verification.service'
import type { Profile } from '@/modules/superadmin/profile/profile.schema'
import EditProfileForm from './EditProfileForm'

type ProfileEditProps = {
  profile: Profile
  refetch: () => void
}

type InfoRowProps = {
  label: string
  value: string
}

export default function ProfileEdit({ profile, refetch }: ProfileEditProps) {
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ')
  const lastSignIn = profile.user.lastSignInAt
    ? formatDate(profile.user.lastSignInAt)
    : 'Nunca'

  return (
    <CustomPage title="Mi Perfil" description="Gestiona tu información de cuenta">
      <CustomPageContainer>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={getPictureSrc(profile.avatar)} alt={`Foto de perfil de ${fullName}`} />
            <AvatarFallback className="text-white text-3xl font-bold bg-linear-to-br from-blue-400 to-blue-600">
              {profile.firstName?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{fullName}</h2>
            <p className="text-gray-600 dark:text-gray-400">{profile.user.email}</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
                Superadmin
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {!profile.user.emailConfirmed && <SendEmailVerificationButton request={(body) => emailVerificationService.post(body)} />}
            <Link
              to="/profile/password"
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors inline-block text-center"
            >
              Cambiar contraseña
            </Link>
            <Link
              to="/profile/sessions"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-block text-center"
            >
              Sesiones activas
            </Link>
          </div>
        </div>
      </CustomPageContainer>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomPageContainer>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Información de la cuenta
          </h3>
          <div className="space-y-4">
            <InfoRow label="Nombre completo" value={fullName} />
            <InfoRow label="Email" value={profile.user.email} />
            <InfoRow label="Rol" value="Superadmin" />
            <InfoRow label="Fecha de registro" value={formatDate(profile.user.createdAt)} />
            <InfoRow label="Último acceso" value={lastSignIn} />
          </div>
        </CustomPageContainer>

        <CustomPageContainer>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Estado de la cuenta
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Email verificado</span>
              {profile.user.emailConfirmed && profile.user.emailConfirmedAt
                ? <span className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                  <CheckCircleIcon className="w-4 h-4" />
                  {formatDate(profile.user.emailConfirmedAt)}
                </span>
                : <span className="flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <XCircleIcon className="w-4 h-4" />
                  No verificado
                </span>
              }
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Estado</span>
              {profile.user.disabled
                ? <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-full">
                  Deshabilitado
                </span>
                : <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                  Activo
                </span>
              }
            </div>
            {profile.user.bannedUntil &&
              <InfoRow
                label="Baneado hasta"
                value={formatDate(profile.user.bannedUntil)}
              />
            }
          </div>
        </CustomPageContainer>
      </div>

      <EditProfileForm profile={profile} refetch={refetch} />
    </CustomPage>
  )
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  )
}
