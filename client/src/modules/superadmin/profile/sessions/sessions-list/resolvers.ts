import sessionsService, { type ProfileSession } from '@/modules/superadmin/profile/sessions/sessions.service'

export default {
  sessions: () => sessionsService.get<ProfileSession[]>(),
}
