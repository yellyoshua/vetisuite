import useMutation from '@/hooks/use-mutation'
import logoutService from '@/modules/auth/logout.service'
import { useSessionStore } from '@/stores/session.store'

export default function useLogout() {
  const endSession = () => {
    useSessionStore.getState().clear()
    window.location.assign('/')
  }

  return useMutation(() => logoutService.post({}), {
    skipConfirm: true,
    successMessage: 'Sesión cerrada correctamente',
    onSuccess: endSession,
    onError: endSession,
  })
}
