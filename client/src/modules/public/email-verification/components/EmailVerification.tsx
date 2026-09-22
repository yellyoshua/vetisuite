import { Link } from 'react-router'
import type { Verification } from '../resolvers'

type EmailVerificationProps = {
  verification: Verification
}

export default function EmailVerification({ verification }: EmailVerificationProps) {
  const isSuccess = verification.status === 'success'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-sm p-10 text-center border-2 border-b-[6px] border-slate-200">

        <div className={`w-28 h-28 mx-auto mb-8 rounded-full flex items-center justify-center text-6xl
          ${isSuccess ? 'bg-green-100' : 'bg-slate-100'}`}>
          {isSuccess ? '✨' : '🤔'}
        </div>

        <h1 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">
          {isSuccess ? '¡Genial!' : '¡Ups!'}
        </h1>

        <p className="text-lg text-slate-500 mb-10 font-bold leading-relaxed">
          {verification.status === 'success'
            ? 'Tu correo ha sido verificado exitosamente. ¡Ya puedes usar tu cuenta!'
            : verification.message}
        </p>

        <Link
          to="/"
          className={`inline-block font-bold px-10 py-4 rounded-xl w-full
            ${isSuccess
      ? 'bg-slate-900 text-white hover:bg-slate-800'
      : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}`}>
          {isSuccess ? 'Ir al inicio' : 'Volver al inicio'}
        </Link>
      </div>
    </div>
  )
}
