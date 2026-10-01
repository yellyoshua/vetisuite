import ChatPanel from './chat-panel'

export default function ChatPanelDemo() {
  return (
    <ChatPanel
      className="h-[28rem]"
      suggestions={['¿Qué vacunas vencen esta semana?', 'Resume las citas de hoy', '¿Qué productos tienen poco stock?']}
    />
  )
}
