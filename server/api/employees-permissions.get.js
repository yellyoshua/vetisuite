import baseRoute from '@/core/base-route.js';
import {findAccountPermissionsSchema} from '@/modules/accounts/accounts.schema.js';
import {employeePermissions} from '@/modules/accounts/account-permissions.service.js';

export default baseRoute((data) => employeePermissions.find(data.id), findAccountPermissionsSchema, {module: 'employees-permissions'});
