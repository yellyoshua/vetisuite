import useMutation from '@/hooks/use-mutation'

type SendEmailVerificationButtonProps = {
  request: (body: Record<string, never>) => Promise<unknown>
}

export default function SendEmailVerificationButton({ request }: SendEmailVerificationButtonProps) {
  const [isSending, sendEmailVerification] = useMutation(request, {
    skipConfirm: true,
    successMessage: 'Correo de verificación enviado',
  })

  return (
    <button
      type="button"
      onClick={() => sendEmailVerification({})}
      disabled={isSending}
      className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors inline-block text-center disabled:opacity-60 disabled:cursor-not-allowed">
      {isSending ? 'Enviando...' : 'Verificar correo'}
    </button>
  )
}
