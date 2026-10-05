import type { Params } from 'react-router'
import type { ResolverSearch } from '@/hooks/use-resolver'
import { startEmbeddedSignup } from '@/lib/meta-embedded-signup'
import whatsappAccountService from '@/modules/employee/whatsapp/whatsapp-account.service'
import whatsappAnalyticsService from '@/modules/employee/whatsapp/whatsapp-analytics.service'
import whatsappConnectionService from '@/modules/employee/whatsapp/whatsapp-connection.service'
import whatsappMessagesService from '@/modules/employee/whatsapp/whatsapp-messages.service'
import whatsappTemplatesService from '@/modules/employee/whatsapp/whatsapp-templates.service'
import type {
  WhatsappAccount,
  WhatsappAnalytics,
  WhatsappConnectionInput,
  WhatsappMessage,
  WhatsappTemplate,
} from '../whatsapp.schema'

const RECENT_MESSAGES_LIMIT = 8

const TEMPLATES_LIMIT = 100

export default {
  account: async () => whatsappAccountService.getOne<WhatsappAccount>(),
  analytics: async (_params: Readonly<Params>, search: ResolverSearch) =>
    whatsappAnalyticsService.get<WhatsappAnalytics>({ days: search.days }),
  templates: async () => whatsappTemplatesService.get<WhatsappTemplate[]>({ limit: TEMPLATES_LIMIT }),
  messages: async () => whatsappMessagesService.get<WhatsappMessage[]>({ limit: RECENT_MESSAGES_LIMIT }),
}

export async function connectWhatsapp() {
  const signup = await startEmbeddedSignup()
  const input: WhatsappConnectionInput = { ...signup, consentAccepted: true }

  return whatsappConnectionService.post(input)
}

export function disconnectWhatsapp() {
  return whatsappConnectionService.remove()
}

export function syncWhatsappTemplates() {
  return whatsappTemplatesService.post({})
}
