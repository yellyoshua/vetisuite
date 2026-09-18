import { useRef, type MouseEvent } from 'react'

const FIELD_CLASS =
  'border-line focus-visible:border-brand text-ink placeholder:text-sub/60 w-full rounded-lg border bg-white px-3 py-2 text-sm'
const LABEL_CLASS = 'text-ink block text-sm font-medium'

export default function RequestDemo() {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const openDialog = () => dialogRef.current?.showModal()

  const closeOnBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current
    if (dialog && event.target === dialog) {
      dialog.close()
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="bg-brand hover:bg-brand-strong rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
      >
        Solicitar demo
      </button>

      <dialog
        ref={dialogRef}
        onClick={closeOnBackdrop}
        aria-labelledby="request-demo-title"
        className="bg-surface backdrop:bg-ink/50 m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl p-0 shadow-xl"
      >
        <form method="dialog" className="flex flex-col gap-4 p-6">
          <div className="flex flex-col gap-1">
            <h2 id="request-demo-title" className="text-ink text-xl font-semibold">
              Solicitar una demo
            </h2>
            <p className="text-sub text-sm">
              Cuéntanos sobre tu clínica y te mostramos VetiSuite funcionando con tu propio
              flujo de trabajo.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className={LABEL_CLASS} htmlFor="clinic-name">
              Nombre de la clínica
            </label>
            <input
              className={FIELD_CLASS}
              id="clinic-name"
              name="clinicName"
              type="text"
              required
              autoComplete="organization"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className={LABEL_CLASS} htmlFor="contact-name">
              Persona de contacto
            </label>
            <input
              className={FIELD_CLASS}
              id="contact-name"
              name="contactName"
              type="text"
              required
              autoComplete="name"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className={LABEL_CLASS} htmlFor="contact-email">
                Correo electrónico
              </label>
              <input
                className={FIELD_CLASS}
                id="contact-email"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={LABEL_CLASS} htmlFor="contact-phone">
                Teléfono
              </label>
              <input
                className={FIELD_CLASS}
                id="contact-phone"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className={LABEL_CLASS} htmlFor="clinic-city">
              Ciudad
            </label>
            <input
              className={FIELD_CLASS}
              id="clinic-city"
              name="city"
              type="text"
              required
              autoComplete="address-level2"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className={LABEL_CLASS} htmlFor="clinic-notes">
              ¿Qué módulos te interesan? (opcional)
            </label>
            <textarea className={FIELD_CLASS} id="clinic-notes" name="notes" rows={3} />
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="submit"
              value="cancel"
              formNoValidate
              className="border-line text-sub hover:text-ink rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              value="confirm"
              className="bg-brand hover:bg-brand-strong rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
            >
              Enviar solicitud
            </button>
          </div>
        </form>
      </dialog>
    </>
  )
}
