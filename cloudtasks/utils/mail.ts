export type MailTransportConfig = {
  apiKey: string
  from: string
}

export type MailMessage = {
  to: string
  subject: string
  html: string
}

export function sendMail(_config: MailTransportConfig, _message: MailMessage): Promise<void> {
  throw new Error('Not implemented: sendMail')
}
