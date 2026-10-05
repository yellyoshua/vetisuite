import { metaAppId, whatsappConfigId } from '@/lib/environment'

const SDK_URL = 'https://connect.facebook.net/en_US/sdk.js'

const GRAPH_VERSION = 'v26.0'

const FACEBOOK_ORIGINS = ['https://www.facebook.com', 'https://web.facebook.com']

const FINISH_EVENTS = ['FINISH', 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING']

const SIGNUP_FAILURE = 'No se pudo completar la conexión con WhatsApp. Inténtalo de nuevo.'

type LoginResponse = {
  authResponse?: { code?: string } | null
}

type FacebookSdk = {
  init: (options: { appId: string; autoLogAppEvents: boolean; xfbml: boolean; version: string }) => void
  login: (callback: (response: LoginResponse) => void, options: Record<string, unknown>) => void
}

declare global {
  interface Window {
    FB?: FacebookSdk
  }
}

type SignupSession = {
  wabaId: string
  phoneNumberId?: string
}

export type EmbeddedSignupResult = SignupSession & {
  code: string
}

type SignupMessage = {
  type?: string
  event?: string
  data?: { waba_id?: string; phone_number_id?: string }
}

let sdkPromise: Promise<FacebookSdk> | null = null

// El SDK de Meta es la única dependencia externa del panel y solo se descarga al pulsar "Conectar".
function loadFacebookSdk(): Promise<FacebookSdk> {
  sdkPromise ??= new Promise<FacebookSdk>((resolve, reject) => {
    const script = document.createElement('script')

    script.src = SDK_URL
    script.async = true
    script.onload = () => {
      window.FB!.init({ appId: metaAppId, autoLogAppEvents: true, xfbml: false, version: GRAPH_VERSION })
      resolve(window.FB!)
    }
    script.onerror = () => {
      sdkPromise = null
      reject({ error: 'No se pudo cargar WhatsApp. Revisa tu conexión o desactiva el bloqueador de contenido.' })
    }

    document.head.appendChild(script)
  })

  return sdkPromise
}

function parseSignupMessage(event: MessageEvent): SignupMessage | null {
  if (!FACEBOOK_ORIGINS.includes(event.origin) || typeof event.data !== 'string') {
    return null
  }

  try {
    return JSON.parse(event.data) as SignupMessage
  } catch {
    return null
  }
}

// Embedded Signup v4: el callback de FB.login entrega el code (vive 30 s) y el evento postMessage
// entrega los ids de la WABA y del número. Pueden llegar en cualquier orden.
export async function startEmbeddedSignup(): Promise<EmbeddedSignupResult> {
  const facebook = await loadFacebookSdk()

  return new Promise<EmbeddedSignupResult>((resolve, reject) => {
    let code: string | null = null
    let session: SignupSession | null = null

    const finish = () => {
      if (code && session) {
        window.removeEventListener('message', onMessage)
        resolve({ code, ...session })
      }
    }

    const fail = () => {
      window.removeEventListener('message', onMessage)
      reject({ error: SIGNUP_FAILURE })
    }

    function onMessage(event: MessageEvent) {
      const message = parseSignupMessage(event)

      if (message?.type !== 'WA_EMBEDDED_SIGNUP') {
        return
      }

      if (message.event && FINISH_EVENTS.includes(message.event) && message.data?.waba_id) {
        session = { wabaId: message.data.waba_id, phoneNumberId: message.data.phone_number_id }
        finish()

        return
      }

      if (message.event === 'CANCEL') {
        fail()
      }
    }

    window.addEventListener('message', onMessage)

    facebook.login(
      (response) => {
        code = response.authResponse?.code ?? null

        if (!code) {
          fail()

          return
        }

        finish()
      },
      {
        config_id: whatsappConfigId,
        response_type: 'code',
        override_default_response_type: true,
        extras: { setup: {}, sessionInfoVersion: '3' },
      },
    )
  })
}
