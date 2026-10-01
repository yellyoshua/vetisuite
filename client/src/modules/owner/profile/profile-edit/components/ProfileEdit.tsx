import { Link } from 'react-router'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import SendEmailVerificationButton from '@/components/SendEmailVerificationButton/SendEmailVerificationButton'
import { formatDate } from '@/lib/date'
import { getPictureSrc } from '@/lib/utils'
import emailVerificationService from '@/modules/owner/profile/email-verification.service'
import type { Profile } from '@/modules/owner/profile/profile.schema'
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
  const names = [profile.firstName, profile.lastName].filter(Boolean).join(' ')

  return (
    <CustomPage title="Mi Perfil" description="Gestiona tu información personal">
      <CustomPageContainer>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={getPictureSrc(profile.avatar)} alt={`Foto de perfil de ${names}`} />
            <AvatarFallback className="text-primary-strong-foreground text-3xl font-bold bg-linear-to-br from-primary to-primary-strong">
              {profile.firstName?.[0]?.toUpperCase()}{profile.lastName?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-foreground">{names}</h2>
            <p className="text-muted-foreground">{profile.user.email}</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              <span className="px-3 py-1 bg-primary-soft text-primary text-xs font-medium rounded-full">
                Dueño activo
              </span>
            </div>
          </div>
          {!profile.user.emailConfirmed && <SendEmailVerificationButton request={(body) => emailVerificationService.post(body)} />}
          <Link
            to="/profile/password"
            className="px-6 py-2 bg-muted hover:bg-accent text-foreground rounded-lg font-medium transition-colors inline-block text-center"
          >
            Cambiar contraseña
          </Link>
          <Link
            to="/profile/sessions"
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors inline-block text-center"
          >
            Sesiones activas
          </Link>
        </div>
      </CustomPageContainer>

      <CustomPageContainer>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Información personal
        </h3>
        <div className="space-y-4">
          <InfoRow label="Nombre completo" value={names} />
          <InfoRow label="Email" value={profile.user.email} />
          <InfoRow label="Teléfono" value={profile.phone || 'N/A'} />
          <InfoRow label="Clínica" value={profile.organization.name} />
          <InfoRow label="Cargo" value={profile.position || 'N/A'} />
          <InfoRow label="Ocupación" value={profile.occupation || 'N/A'} />
          <InfoRow label="Fecha de registro" value={formatDate(profile.createdAt)} />
          <InfoRow label="Correo confirmado" value={profile.user.emailConfirmed ? 'Sí' : 'No'} />
        </div>
      </CustomPageContainer>

      <EditProfileForm profile={profile} refetch={refetch} />
    </CustomPage>
  )
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}
