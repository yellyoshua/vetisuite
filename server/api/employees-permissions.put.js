import baseRoute from '@/core/base-route.js';
import {updateAccountPermissionsSchema} from '@/modules/accounts/accounts.schema.js';
import {employeePermissions} from '@/modules/accounts/account-permissions.service.js';

export default baseRoute((data) => employeePermissions.update(data.id, data.permissions), updateAccountPermissionsSchema, {module: 'employees-permissions'});
