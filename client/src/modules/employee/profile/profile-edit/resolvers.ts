import profileService from '@/modules/employee/profile/profile.service'
import type { Profile } from '@/modules/employee/profile/profile.schema'

export default {
  profile: () => profileService.get<Profile>(),
}
