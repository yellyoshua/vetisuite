import { LinkIcon, PhoneIcon, UnplugIcon } from 'lucide-react'
import useMutation from '@/hooks/use-mutation'
import { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BADGE_TONE_CLASS_NAMES } from '@/constants/badge-tones'
import { WHATSAPP_ACCOUNT_STATUS_LABELS, WHATSAPP_ACCOUNT_STATUS_TONES } from '@/constants/whatsapp'
import { formatDate } from '@/lib/date'
import type { WhatsappAccount } from '../../whatsapp.schema'
import { connectWhatsapp, disconnectWhatsapp } from '../resolvers'
import SectionHeading from './SectionHeading'

type ConnectionPanelProps = {
  account: WhatsappAccount | null
  refetch: () => void
}

function ConnectButton({ refetch }: { refetch: () => void }) {
  const [isConnecting, connect] = useMutation(connectWhatsapp, {
    confirm: {
      title: 'Conectar WhatsApp',
      description:
        'Al continuar confirmas que tus clientes aceptaron recibir avisos de la clínica por WhatsApp y que solo enviarás mensajes utility (recordatorios de citas y de vacunas). Se abrirá una ventana de Meta para elegir el número.',
      confirmText: 'Acepto y conectar',
    },
    successMessage: 'WhatsApp conectado correctamente',
    onSuccess: () => refetch(),
  })

  return (
    <Button type="button" disabled={isConnecting} onClick={() => connect()}>
      <LinkIcon /> {isConnecting ? 'Conectando…' : 'Conectar WhatsApp'}
    </Button>
  )
}

function DisconnectButton({ account, refetch }: { account: WhatsappAccount; refetch: () => void }) {
  const [isDisconnecting, disconnect] = useMutation(disconnectWhatsapp, {
    confirm: {
      title: 'Desconectar WhatsApp',
      description: `Se dejará de enviar mensajes desde ${account.displayPhoneNumber} y se quitarán las plantillas de la clínica. El historial de mensajes se conserva.`,
      confirmText: 'Desconectar',
      variant: 'destructive',
    },
    successMessage: 'WhatsApp desconectado',
    onSuccess: () => refetch(),
  })

  return (
    <Button type="button" variant="ghost" size="sm" disabled={isDisconnecting} onClick={() => disconnect()}>
      <UnplugIcon /> Desconectar
    </Button>
  )
}

export default function ConnectionPanel({ account, refetch }: ConnectionPanelProps) {
  if (!account) {
    return (
      <CustomPageContainer className="p-5">
        <SectionHeading
          title="Conexión"
          description="Conecta el número de WhatsApp de la clínica. Puedes conservar tu número actual y seguir usando la app de WhatsApp Business, o registrar uno nuevo. Meta te guiará y verificará el número."
          actions={<ConnectButton refetch={refetch} />}
        />
      </CustomPageContainer>
    )
  }

  return (
    <CustomPageContainer className="p-5">
      <SectionHeading
        title="Conexión"
        description={`Conectado el ${formatDate(account.createdAt, { day: '2-digit', month: 'short', year: 'numeric' })}. Los mensajes salen desde el número oficial de la clínica.`}
        actions={<DisconnectButton account={account} refetch={refetch} />}
      />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <PhoneIcon className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="font-head text-[15px] font-semibold text-foreground tabular-nums">{account.displayPhoneNumber}</span>
        <span className="text-[12.5px] text-muted-foreground">{account.verifiedName}</span>
        <Badge variant="outline" className={BADGE_TONE_CLASS_NAMES[WHATSAPP_ACCOUNT_STATUS_TONES[account.status]]}>
          {WHATSAPP_ACCOUNT_STATUS_LABELS[account.status]}
        </Badge>
      </div>
      {account.status === 'reauth_required' && (
        <p role="alert" className="mt-3 text-[12.5px] text-danger">
          Meta revocó el acceso de Veti Suite a este número. Desconéctalo y vuelve a conectarlo para retomar los envíos.
        </p>
      )}
    </CustomPageContainer>
  )
}
