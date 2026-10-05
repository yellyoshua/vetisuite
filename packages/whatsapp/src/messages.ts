import { businessToken, graph } from './graph'

const E164_PATTERN = /^\+[1-9]\d{7,14}$/

type SendUtilityTemplateInput = {
  encryptedAccessToken: string
  phoneNumberId: string
  to: string
  template: string
  language: string
  parameters: Record<string, string>
}

type SendResponse = {
  messages: { id: string }[]
}

// Único camino de salida del paquete: solo plantillas. No existe un envío de texto libre, así que
// ningún mensaje que no sea una plantilla (aprobada como utility) puede salir de la plataforma.
export async function sendUtilityTemplate({
  encryptedAccessToken,
  phoneNumberId,
  to,
  template,
  language,
  parameters,
}: SendUtilityTemplateInput) {
  if (!E164_PATTERN.test(to)) {
    throw new Error('El teléfono debe estar en formato internacional (+código de país y número)')
  }

  const response = await graph<SendResponse>({
    path: `${phoneNumberId}/messages`,
    method: 'POST',
    accessToken: businessToken(encryptedAccessToken),
    body: {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'template',
      template: {
        name: template,
        language: { code: language },
        components: [
          {
            type: 'body',
            parameters: Object.entries(parameters).map(([name, text]) => ({ type: 'text', parameter_name: name, text })),
          },
        ],
      },
    },
  })

  return { messageId: response.messages[0]!.id }
}
