import { businessToken, graph } from './graph'

const UTILITY_CATEGORY = 'UTILITY'

const APPROVED_STATUSES = new Set(['APPROVED', 'REINSTATED', 'FLAGGED', 'UNARCHIVED'])

const PENDING_STATUSES = new Set(['PENDING', 'IN_REVIEW', 'IN_APPEAL'])

type UtilityTemplateDefinition = {
  name: string
  language: string
  body: string
  parameters: { name: string; example: string }[]
}

type SyncUtilityTemplatesInput = {
  wabaId: string
  encryptedAccessToken: string
  templates: UtilityTemplateDefinition[]
}

type MetaTemplate = {
  id: string
  name: string
  language: string
  status: string
  category: string
  rejected_reason?: string
}

type MetaTemplateList = {
  data: MetaTemplate[]
}

type MetaTemplateCreated = {
  id: string
  status: string
  category: string
}

export function toTemplateStatus(status: string) {
  if (APPROVED_STATUSES.has(status)) {
    return 'approved' as const
  }

  if (PENDING_STATUSES.has(status)) {
    return 'pending' as const
  }

  if (status === 'REJECTED') {
    return 'rejected' as const
  }

  return status === 'PAUSED' ? ('paused' as const) : ('disabled' as const)
}

export function toTemplateCategory(category: string) {
  if (category === UTILITY_CATEGORY) {
    return 'utility' as const
  }

  return category === 'AUTHENTICATION' ? ('authentication' as const) : ('marketing' as const)
}

function normalize(template: { id: string; name: string; language: string; status: string; category: string; rejected_reason?: string }) {
  return {
    metaId: template.id,
    name: template.name,
    language: template.language,
    status: toTemplateStatus(template.status),
    category: toTemplateCategory(template.category),
    rejectedReason: template.rejected_reason && template.rejected_reason !== 'NONE' ? template.rejected_reason : null,
  }
}

async function createUtilityTemplate(wabaId: string, accessToken: string, definition: UtilityTemplateDefinition) {
  const created = await graph<MetaTemplateCreated>({
    path: `${wabaId}/message_templates`,
    method: 'POST',
    accessToken,
    body: {
      name: definition.name,
      language: definition.language,
      category: UTILITY_CATEGORY,
      parameter_format: 'NAMED',
      components: [
        {
          type: 'BODY',
          text: definition.body,
          example: {
            body_text_named_params: definition.parameters.map((parameter) => ({
              param_name: parameter.name,
              example: parameter.example,
            })),
          },
        },
      ],
    },
  })

  return normalize({ ...created, name: definition.name, language: definition.language })
}

// Idempotente: crea en la WABA del cliente solo las plantillas que todavía no existen. Siempre las
// crea como UTILITY; la categoría que devuelve Meta es la que manda y la guarda quien llama.
export async function syncUtilityTemplates({ wabaId, encryptedAccessToken, templates }: SyncUtilityTemplatesInput) {
  const accessToken = businessToken(encryptedAccessToken)

  return Promise.all(
    templates.map(async (definition) => {
      const { data } = await graph<MetaTemplateList>({
        path: `${wabaId}/message_templates`,
        accessToken,
        query: { name: definition.name, fields: 'id,name,language,status,category,rejected_reason' },
      })
      const existing = data.find((template) => template.language === definition.language)

      return existing ? normalize(existing) : createUtilityTemplate(wabaId, accessToken, definition)
    }),
  )
}
