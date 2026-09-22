import baseRoute from '@/core/base-route.js';
import {updateEmployeeSchema} from '@/modules/employees/employees.schema.js';
import {updateEmployeeAccount} from '@/modules/accounts/accounts.service.js';
import employeesRepository from '@/modules/employees/employees.repository.js';

export default baseRoute(async ({id, ...profile}, context) => {
  await updateEmployeeAccount({...profile, id, user: {}}, {requestId: context.requestId});

  return employeesRepository.findOne({id}, {
    select: {id: true, avatar: true, firstName: true, lastName: true, phone: true, position: true, color: true, createdAt: true, updatedAt: true},
    join: {user: 'id email emailConfirmed lastSignInAt disabled'}
  });
}, updateEmployeeSchema, {module: 'employees'});
