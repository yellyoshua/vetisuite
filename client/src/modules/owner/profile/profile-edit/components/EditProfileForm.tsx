import { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import Form, { FormInput, FormTextarea, FormUploadAvatar } from '@/components/form/Form'
import useForm from '@/hooks/use-form'
import { useSessionStore, type SessionProfile, type SessionUser } from '@/stores/session.store'
import profileService from '@/modules/owner/profile/profile.service'
import {
  updateProfileSchema,
  type Profile,
  type UpdateProfileResponse,
  type UpdateProfileValues,
} from '@/modules/owner/profile/profile.schema'

type EditProfileFormProps = {
  profile: Profile
  refetch: () => void
}

export default function EditProfileForm({ profile, refetch }: EditProfileFormProps) {
  const form = useForm<UpdateProfileValues, UpdateProfileResponse>({
    avatar: profile.avatar,
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.user.email,
    phone: profile.phone,
    position: profile.position,
    occupation: profile.occupation,
    description: profile.description,
  }, {
    onSubmit: async (body) => {
      const response = await profileService.put<UpdateProfileResponse>(body)

      syncSession(body, response.avatar)

      return response
    },
    schema: updateProfileSchema,
    successMessage: 'Perfil actualizado correctamente',
    onSuccess: () => refetch(),
  })

  return (
    <CustomPageContainer className="p-6">
      <Form onSubmit={form.handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Editar información personal
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
            />
            <FormInput
              control={form.control}
              name="phone"
              label="Teléfono"
              placeholder="Teléfono"
            />
            <FormInput
              control={form.control}
              name="position"
              label="Cargo"
              placeholder="Cargo"
            />
            <FormInput
              control={form.control}
              name="occupation"
              label="Ocupación"
              placeholder="Ocupación"
            />
            <div className="md:col-span-2">
              <FormTextarea
                control={form.control}
                name="description"
                label="Descripción"
                placeholder="Descripción"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="submit" disabled={form.isSubmitting} className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors cursor-pointer">
            {form.isSubmitting ? 'Actualizando...' : 'Guardar cambios'}
          </button>
        </div>
      </Form>
    </CustomPageContainer>
  )
}

function syncSession({ email, firstName, lastName }: UpdateProfileValues, avatar: string | null) {
  const profile = useSessionStore.getState().profile as SessionProfile

  useSessionStore.setState({
    profile: {
      ...profile,
      firstName,
      lastName,
      avatar,
      user: nextUser(profile.user, email),
    },
  })
}

function nextUser(user: SessionUser, email: string): SessionUser {
  if (email === user.email) {
    return user
  }

  return { ...user, email, emailConfirmed: false }
}
