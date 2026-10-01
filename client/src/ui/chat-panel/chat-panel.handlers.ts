import { useId, useState, type FormEvent, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export type ChatPanelProps = {
  title?: string
  suggestions?: string[]
  initialMessages?: ChatMessage[]
  onSend?: (text: string) => void
  className?: string
}

const cannedReply = 'Recibido. Esta es una respuesta de ejemplo: el asistente aún no está conectado.'

export default function useChatPanel({
  title = 'Asistente',
  suggestions = [],
  initialMessages = [],
  onSend,
  className,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [draft, setDraft] = useState('')
  const inputId = useId()

  const send = (raw: string) => {
    const text = raw.trim()
    if (!text) return
    const stamp = `${Date.now()}-${messages.length}`
    setMessages((current) => [
      ...current,
      { id: `u-${stamp}`, role: 'user', content: text },
      { id: `a-${stamp}`, role: 'assistant', content: cannedReply },
    ])
    setDraft('')
    onSend?.(text)
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    send(draft)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) return
    event.preventDefault()
    if (event.nativeEvent.isComposing || event.keyCode === 229) return
    event.currentTarget.form?.requestSubmit()
  }

  const reset = () => {
    setMessages([])
    setDraft('')
  }

  return {
    resetProps: { type: 'button' as const, 'aria-label': 'Nueva conversación', disabled: messages.length === 0, onClick: reset },
    title,
    inputId,
    rootProps: {
      className: cn(
        'flex w-full max-w-md min-w-0 flex-col overflow-hidden rounded-card border border-border bg-neutral-frame p-1 text-[13px] text-foreground shadow-popup dark:shadow-none',
        className,
      ),
    },
    iconActionClassName:
      'inline-flex size-7 shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-control text-muted-foreground transition-colors duration-150 ease-out-expo hover:bg-muted hover:text-foreground motion-reduce:transition-none [&_svg]:size-4',
    messages: messages.map((message) => ({
      key: message.id,
      content: message.content,
      author: message.role === 'user' ? 'Tú' : title,
      className: cn(
        'max-w-[85%] rounded-row px-3 py-2 break-words whitespace-pre-wrap',
        message.role === 'user' ? 'self-end bg-primary text-primary-foreground' : 'self-start border border-border bg-card',
      ),
    })),
    suggestions: messages.length === 0 ? suggestions : [],
    onSuggestion: send,
    formProps: { onSubmit, className: 'flex flex-col gap-2 rounded-control border border-border bg-card p-2.5 shadow-lift transition-colors duration-150 ease-out-expo hover:border-muted-foreground/40 focus-within:border-muted-foreground motion-reduce:transition-none dark:shadow-none' },
    textareaProps: {
      id: inputId,
      name: 'message',
      rows: 2,
      value: draft,
      placeholder: 'Pregunta sobre pacientes, citas o inventario…',
      onChange: (event: { target: { value: string } }) => setDraft(event.target.value),
      onKeyDown,
      enterKeyHint: 'send' as const,
      className: 'w-full resize-none bg-transparent text-[13px] text-foreground placeholder:text-neutral-faint',
    },
    sendProps: {
      type: 'submit' as const,
      'aria-label': 'Enviar',
      disabled: !draft.trim(),
      className:
        'inline-flex size-7 shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-control bg-primary text-primary-foreground transition-colors duration-150 ease-out-expo hover:bg-primary/90 motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4',
    },
  }
}
