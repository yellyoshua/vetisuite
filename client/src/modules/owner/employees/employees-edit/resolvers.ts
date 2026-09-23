import type { Params } from 'react-router'
import employeesService from '@/modules/owner/employees/employees.service'
import type { Employee } from '@/modules/owner/employees/employees.schema'

export default {
  employee: async (params: Readonly<Params>) => {
    const employee = await employeesService.getOne<Employee>({ id: params.employeeId })

    if (!employee) {
      throw new Error('No se encontró el empleado')
    }

    return employee
  },
}
