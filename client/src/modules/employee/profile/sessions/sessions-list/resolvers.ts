import sessionsService, { type ProfileSession } from '@/modules/employee/profile/sessions/sessions.service'

export default {
  sessions: () => sessionsService.get<ProfileSession[]>(),
}
