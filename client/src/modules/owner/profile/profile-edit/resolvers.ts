import profileService from '@/modules/owner/profile/profile.service'
import type { Profile } from '@/modules/owner/profile/profile.schema'

export default {
  profile: () => profileService.get<Profile>(),
}
