import baseRoute from '@/core/base-route.js';
import {createEmployeeSchema} from '@/modules/employees/employees.schema.js';
import {createEmployeeAccount} from '@/modules/accounts/accounts.service.js';
import employeesRepository from '@/modules/employees/employees.repository.js';

export default baseRoute(async (data, context) => {
  const employee = await createEmployeeAccount({
    organization: context.profile.organization,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    position: data.position,
    color: data.color,
    user: {email: data.email, password: data.password}
  }, {requestId: context.requestId});

  return employeesRepository.findOne({id: employee.id}, {
    select: {id: true, avatar: true, firstName: true, lastName: true, phone: true, position: true, color: true, createdAt: true, updatedAt: true},
    join: {user: 'id email emailConfirmed lastSignInAt disabled'}
  });
}, createEmployeeSchema, {module: 'employees'});
