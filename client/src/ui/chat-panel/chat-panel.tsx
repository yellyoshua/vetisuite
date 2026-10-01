import { ArrowUp, RotateCcw, Sparkles } from 'lucide-react'
import useChatPanel, { type ChatPanelProps } from './chat-panel.handlers'

export default function ChatPanel(props: ChatPanelProps) {
  const { title, inputId, rootProps, iconActionClassName, resetProps, messages, suggestions, onSuggestion, formProps, textareaProps, sendProps } =
    useChatPanel(props)

  return (
    <section aria-label={title} {...rootProps}>
      <header className="flex min-h-8 shrink-0 items-center justify-between gap-2 p-2 pr-1">
        <h2 className="flex items-center gap-2 font-body text-sm leading-none font-medium text-muted-foreground">
          <Sparkles aria-hidden="true" className="size-4 text-muted-foreground" />
          {title}
        </h2>
        <div className="flex items-center gap-0.5">
          <button {...resetProps} className={iconActionClassName}>
            <RotateCcw aria-hidden="true" />
          </button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain rounded-row border border-border bg-card p-3">
        <ul aria-live="polite" aria-label="Mensajes" className="flex flex-col gap-2">
          {messages.map((message) => (
            <li key={message.key} className={message.className}>
              <span className="sr-only">{message.author}: </span>
              {message.content}
            </li>
          ))}
        </ul>
        {suggestions.length > 0 && (
          <ul aria-label="Sugerencias" className="flex flex-col gap-0.5">
            {suggestions.map((suggestion) => (
              <li key={suggestion} className="max-w-full">
                <button
                  type="button"
                  onClick={() => onSuggestion(suggestion)}
                  className="flex h-8 w-full cursor-pointer touch-manipulation items-center gap-2 rounded-control px-2.5 text-left text-[13px] leading-none text-muted-foreground transition-colors duration-150 ease-out-expo hover:bg-muted hover:text-foreground motion-reduce:transition-none [&_svg]:size-4 [&_svg]:shrink-0"
                >
                  <Sparkles aria-hidden="true" />
                  <span className="truncate">{suggestion}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="shrink-0 pt-1">
        <form {...formProps}>
          <label htmlFor={inputId} className="sr-only">
            Mensaje para {title}
          </label>
          <textarea {...textareaProps} />
          <div className="flex justify-end">
            <button {...sendProps}>
              <ArrowUp aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
