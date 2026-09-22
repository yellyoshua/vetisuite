import type { ReactNode } from 'react'
import { useController, useFieldArray, useFormState, type Control, type FieldError, type FieldValues } from 'react-hook-form'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type PermissionsValues = { permissions: string[] }

type PermissionsArrayValues = { permissions: Record<string, never>[] }

type PermissionRowProps = {
  control: Control<PermissionsValues>
  index: number
  onRemove: (index: number) => void
  error?: FieldError
}

type FormPermissionsEditorProps<TValues extends FieldValues> = {
  control: Control<TValues>
  name?: 'permissions'
  label?: ReactNode
  description?: ReactNode
}

function PermissionRow({ control, index, onRemove, error }: PermissionRowProps) {
  const { field } = useController({
    name: `permissions.${index}`,
    control,
    defaultValue: '',
  })

  return (
    <div className="space-y-1">
      <div className="flex gap-2 items-center">
        <Input
          {...field}
          value={field.value || ''}
          placeholder="rol::modulo::general"
          className="font-mono text-sm flex-1"
          autoComplete="off"
          aria-label={`Permiso ${index + 1}`}
          aria-invalid={Boolean(error)}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          aria-label="Eliminar permiso"
          className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive cursor-pointer"
        >
          <Trash2Icon className="h-4 w-4" />
        </Button>
      </div>
      {error && error.message && (
        <p className="text-sm font-medium text-destructive">{error.message}</p>
      )}
    </div>
  )
}

export function FormPermissionsEditor<TValues extends FieldValues>({ control, name = 'permissions', label = 'Permisos', description }: FormPermissionsEditorProps<TValues>) {
  const permissionsControl = control as unknown as Control<PermissionsValues>
  const { fields, append, remove } = useFieldArray({ control: control as unknown as Control<PermissionsArrayValues>, name })
  const { errors } = useFormState({ control: permissionsControl })
  const permissionsErrors = errors && (errors[name] as FieldError[] | undefined)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium">{label}</label>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append('' as never)}
          className="gap-1 text-xs cursor-pointer"
        >
          <PlusIcon className="h-3 w-3" />
          Agregar permiso
        </Button>
      </div>

      {fields.length > 0 && (
        <div className="space-y-2">
          {fields.map((item, index) => {
            const rowError = permissionsErrors && permissionsErrors[index]

            return (
              <PermissionRow
                key={item.id}
                control={permissionsControl}
                index={index}
                onRemove={remove}
                error={rowError}
              />
            )
          })}
        </div>
      )}

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          Sin permisos asignados. Haz clic en &quot;Agregar permiso&quot; para añadir uno.
        </p>
      )}
    </div>
  )
}

export default FormPermissionsEditor
