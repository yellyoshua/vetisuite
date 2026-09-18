import Button from '@/components/ui/Button'
import ButtonLink from '@/components/ui/ButtonLink'
import Icon from '@/components/ui/Icon'

type RowActionsProps = {
  subject: string
  viewTo?: string
  editTo?: string
}

export default function RowActions({ subject, viewTo, editTo }: RowActionsProps) {
  const viewContent = (
    <>
      <Icon name="eye" size={13} /> Ver
    </>
  )
  const editContent = (
    <>
      <Icon name="pencil" size={13} /> Editar
    </>
  )

  return (
    <div className="flex items-center justify-end gap-1.5">
      {viewTo ? (
        <ButtonLink to={viewTo} variant="ghost" size="sm" ariaLabel={`Ver ${subject}`}>
          {viewContent}
        </ButtonLink>
      ) : (
        <Button variant="ghost" size="sm" isDisabled ariaLabel={`Ver ${subject}`}>
          {viewContent}
        </Button>
      )}
      {editTo ? (
        <ButtonLink to={editTo} variant="ghost" size="sm" ariaLabel={`Editar ${subject}`}>
          {editContent}
        </ButtonLink>
      ) : (
        <Button variant="ghost" size="sm" isDisabled ariaLabel={`Editar ${subject}`}>
          {editContent}
        </Button>
      )}
    </div>
  )
}
