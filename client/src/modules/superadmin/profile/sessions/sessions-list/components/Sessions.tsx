import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import type { ProfileSession } from '@/modules/superadmin/profile/sessions/sessions.service'
import SessionRow from './SessionRow'

type SessionsProps = {
  sessions: ProfileSession[]
  refetch: () => void
}

export default function Sessions({ sessions, refetch }: SessionsProps) {
  return (
    <CustomPage
      title="Sesiones activas"
      description="Dispositivos con la sesión abierta en tu cuenta de superadmin. Cierra el que no reconozcas."
      goBackPath="/profile"
    >
      {sessions.length === 0
        ? <CustomPageContainer>
          <p className="text-gray-600 dark:text-gray-400">No hay sesiones activas en tu cuenta.</p>
        </CustomPageContainer>
        : <CustomPageContainer className="p-0">
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {sessions.map((session, index) => <SessionRow key={session.id} session={session} position={index + 1} total={sessions.length} refetch={refetch} />)}
          </ul>
        </CustomPageContainer>}
    </CustomPage>
  )
}
