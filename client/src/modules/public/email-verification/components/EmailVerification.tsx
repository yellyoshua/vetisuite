import { Link } from 'react-router'
import type { Verification } from '../resolvers'

type EmailVerificationProps = {
  verification: Verification
}

export default function EmailVerification({ verification }: EmailVerificationProps) {
  const isSuccess = verification.status === 'success'

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-card rounded-[2.5rem] shadow-sm p-10 text-center border-2 border-b-[6px] border-border">

        <div className={`w-28 h-28 mx-auto mb-8 rounded-full flex items-center justify-center text-6xl
          ${isSuccess ? 'bg-primary-soft' : 'bg-muted'}`}>
          {isSuccess ? '✨' : '🤔'}
        </div>

        <h1 className="text-3xl font-black text-foreground mb-4 tracking-tight">
          {isSuccess ? '¡Genial!' : '¡Ups!'}
        </h1>

        <p className="text-lg text-muted-foreground mb-10 font-bold leading-relaxed">
          {verification.status === 'success'
            ? 'Tu correo ha sido verificado exitosamente. ¡Ya puedes usar tu cuenta!'
            : verification.message}
        </p>

        <Link
          to="/"
          className={`inline-block font-bold px-10 py-4 rounded-xl w-full
            ${isSuccess
      ? 'bg-primary-strong text-primary-strong-foreground hover:bg-primary-strong/90'
      : 'bg-muted text-foreground hover:bg-accent'}`}>
          {isSuccess ? 'Ir al inicio' : 'Volver al inicio'}
        </Link>
      </div>
    </div>
  )
}
