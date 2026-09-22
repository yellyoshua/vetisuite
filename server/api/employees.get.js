import baseRoute from '@/core/base-route.js';
import {listParams} from '@/utils/request-params.js';
import employeesRepository from '@/modules/employees/employees.repository.js';

export default baseRoute(async (params, context) => {
  return employeesRepository.find({organization: context.profile.organization, ...pickFilters(params)}, {
    select: {id: true, avatar: true, firstName: true, lastName: true, phone: true, position: true, color: true, createdAt: true, updatedAt: true},
    join: {user: 'id email emailConfirmed lastSignInAt disabled'},
    search: params.search,
    searchFields: ['firstName', 'lastName'],
    page: params.page,
    limit: params.limit,
    orderBy: {createdAt: params.order}
  });
}, listParams, {module: 'employees'});

function pickFilters (params) {
  return params.id ? {id: params.id} : {};
}
