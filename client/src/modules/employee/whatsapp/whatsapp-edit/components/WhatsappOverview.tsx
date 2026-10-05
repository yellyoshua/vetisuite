import CustomPage from '@/components/CustomPage/CustomPage'
import type { WhatsappAccount, WhatsappAnalytics, WhatsappMessage, WhatsappTemplate } from '../../whatsapp.schema'
import AnalyticsPanel from './AnalyticsPanel'
import ConnectionPanel from './ConnectionPanel'
import RecentMessagesPanel from './RecentMessagesPanel'
import TemplatesPanel from './TemplatesPanel'
import UtilityOnlyNotice from './UtilityOnlyNotice'

type WhatsappOverviewProps = {
  account: WhatsappAccount | null
  analytics: WhatsappAnalytics
  templates: WhatsappTemplate[]
  messages: WhatsappMessage[]
  refetch: () => void
}

export default function WhatsappOverview({ account, analytics, templates, messages, refetch }: WhatsappOverviewProps) {
  return (
    <CustomPage
      title="WhatsApp"
      description="Avisa a tus clientes por el WhatsApp oficial de la clínica: recordatorios de citas y de vacunas."
    >
      <UtilityOnlyNotice />
      <ConnectionPanel account={account} refetch={refetch} />
      {account && (
        <>
          <AnalyticsPanel analytics={analytics} />
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(360px,100%),1fr))] items-start gap-3.5">
            <TemplatesPanel templates={templates} refetch={refetch} />
            <RecentMessagesPanel messages={messages} />
          </div>
        </>
      )}
    </CustomPage>
  )
}
