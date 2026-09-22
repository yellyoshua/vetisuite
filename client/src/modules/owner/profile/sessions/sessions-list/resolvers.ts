import sessionsService, { type ProfileSession } from '@/modules/owner/profile/sessions/sessions.service'

export default {
  sessions: () => sessionsService.get<ProfileSession[]>(),
}
