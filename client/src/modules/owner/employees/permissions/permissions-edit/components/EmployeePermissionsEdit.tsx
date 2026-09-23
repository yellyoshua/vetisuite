import { MailIcon, ShieldCheckIcon } from 'lucide-react'
import zod from 'zod'
import useForm from '@/hooks/use-form'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import Form from '@/components/form/Form'
import FormPermissionsEditor from '@/components/form/FormPermissionsEditor'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/utils'
import permissionsService, { type AccountPermissions } from '@/modules/owner/employees/permissions/permissions.service'

type EmployeePermissionsEditProps = {
  employee: AccountPermissions
  refetch: () => void
}

const updateEmployeePermissionsSchema = zod.object({
  id: zod.uuid(),
  permissions: zod.array(
    zod.string().regex(/^(superadmin|owner|employee)::[a-z0-9-]+::general$/, 'Formato de permiso inválido'),
  ),
})

type UpdateEmployeePermissionsValues = zod.infer<typeof updateEmployeePermissionsSchema>

function groupPermissionsByModule(permissions: string[]): Record<string, string[]> {
  return permissions.reduce<Record<string, string[]>>((acc, perm) => {
    const parts = perm.split('::')
    const moduleName = parts[1] || 'general'
    const current = acc[moduleName] || []

    return {
      ...acc,
      [moduleName]: [...current, perm],
    }
  }, {})
}

export default function EmployeePermissionsEdit({ employee, refetch }: EmployeePermissionsEditProps) {
  const fullName = [employee.firstName, employee.lastName].filter(Boolean).join(' ')
  const moduleEntries = Object.entries(groupPermissionsByModule(employee.permissions))
  const form = useForm<UpdateEmployeePermissionsValues>({
    id: employee.id,
    permissions: employee.permissions,
  }, {
    onSubmit: (body) => permissionsService.put(body),
    schema: updateEmployeePermissionsSchema,
    successMessage: 'Permisos actualizados correctamente',
    onSuccess: () => refetch(),
  })

  return (
    <CustomPage
      title="Permisos del Empleado"
      description="Consulta y modifica los permisos asignados a la cuenta"
      goBackPath="/employees"
    >
      <div className="space-y-6">
        <CustomPageContainer className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border border-gray-200 dark:border-gray-700">
              <AvatarFallback className="bg-linear-to-br from-green-400 to-green-600 text-lg font-semibold text-white">
                {getInitials(employee.firstName, employee.lastName) || 'E'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{fullName}</h2>
                <Badge variant="outline" className="text-xs">Empleado</Badge>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                <MailIcon className="w-4 h-4" />
                {employee.user.email}
              </p>
            </div>
          </div>
        </CustomPageContainer>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Módulos y Permisos
            </h3>
            <Badge variant="secondary">
              {employee.permissions.length} {employee.permissions.length === 1 ? 'permiso' : 'permisos'}
            </Badge>
          </div>

          {moduleEntries.length === 0 ? (
            <CustomPageContainer className="p-8 text-center text-gray-500 dark:text-gray-400">
              <ShieldCheckIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No tiene permisos asignados actualmente.</p>
            </CustomPageContainer>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {moduleEntries.map(([moduleName, items]) => (
                <CustomPageContainer key={moduleName} className="p-5">
                  <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      {moduleName}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {items.length}
                    </Badge>
                  </div>
                  <ul className="space-y-1.5">
                    {items.map((perm) => (
                      <li
                        key={perm}
                        className="font-mono text-xs bg-gray-50 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 px-2.5 py-1.5 rounded border border-gray-200/60 dark:border-gray-700 select-all"
                      >
                        {perm}
                      </li>
                    ))}
                  </ul>
                </CustomPageContainer>
              ))}
            </div>
          )}
        </div>

        <CustomPageContainer className="p-6">
          <Form onSubmit={form.handleSubmit} className="space-y-6">
            {form.error && form.error.message && (
              <div role="alert" className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
                {form.error.message}
              </div>
            )}

            <FormPermissionsEditor
              control={form.control}
              name="permissions"
              label="Permisos del Empleado"
              description="Define los identificadores de permisos con formato rol::modulo::general"
            />

            <div className="flex gap-3 justify-end items-center pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="submit"
                disabled={form.isSubmitting}
                className="cursor-pointer"
              >
                {form.isSubmitting ? 'Actualizando...' : 'Guardar'}
              </Button>
            </div>
          </Form>
        </CustomPageContainer>
      </div>
    </CustomPage>
  )
}
