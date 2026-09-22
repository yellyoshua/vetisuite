import profileService from '@/modules/superadmin/profile/profile.service'
import type { Profile } from '@/modules/superadmin/profile/profile.schema'

export default {
  profile: () => profileService.get<Profile>(),
}
