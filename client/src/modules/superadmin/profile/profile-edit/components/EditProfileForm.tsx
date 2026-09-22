import useForm from '@/hooks/use-form'
import { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import Form, { FormInput, FormUploadAvatar } from '@/components/form/Form'
import { useSessionStore, type SessionProfile } from '@/stores/session.store'
import profileService from '@/modules/superadmin/profile/profile.service'
import {
  updateProfileSchema,
  type Profile,
  type UpdateProfileResponse,
  type UpdateProfileValues,
} from '@/modules/superadmin/profile/profile.schema'

type EditProfileFormProps = {
  profile: Profile
  refetch: () => void
}

export default function EditProfileForm({ profile, refetch }: EditProfileFormProps) {
  const form = useForm<UpdateProfileValues, UpdateProfileResponse>({
    firstName: profile.firstName,
    lastName: profile.lastName,
    avatar: profile.avatar,
    email: profile.user.email,
  }, {
    onSubmit: saveProfile,
    schema: updateProfileSchema,
    successMessage: 'Perfil actualizado correctamente',
    onSuccess: () => refetch(),
  })

  return (
    <CustomPageContainer className="p-6">
      <Form onSubmit={form.handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Información de cuenta
          </h3>
          <FormUploadAvatar
            control={form.control}
            name="avatar"
            label="Foto de perfil"
            disabled={form.isSubmitting}
            className="w-full"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              control={form.control}
              name="firstName"
              label="Nombre"
              placeholder="Nombre"
            />
            <FormInput
              control={form.control}
              name="lastName"
              label="Apellido"
              placeholder="Apellido"
            />
            <FormInput
              control={form.control}
              name="email"
              label="Email"
              placeholder="Email"
              type="email"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="submit" disabled={form.isSubmitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors cursor-pointer">
            {form.isSubmitting ? 'Actualizando...' : 'Guardar cambios'}
          </button>
        </div>
      </Form>
    </CustomPageContainer>
  )
}

async function saveProfile(body: UpdateProfileValues): Promise<UpdateProfileResponse> {
  const response = await profileService.put<UpdateProfileResponse>(body)
  const profile = useSessionStore.getState().profile as SessionProfile
  const emailChanged = body.email !== profile.user.email

  useSessionStore.setState({
    profile: {
      ...profile,
      firstName: body.firstName,
      lastName: body.lastName,
      avatar: response.avatar,
      user: {
        ...profile.user,
        email: body.email,
        ...(emailChanged ? { emailConfirmed: false } : {}),
      },
    },
  })

  return response
}
