import baseRoute from '@/core/base-route.js';
import {findAccountPermissionsSchema} from '@/modules/accounts/accounts.schema.js';
import {superadminPermissions} from '@/modules/accounts/account-permissions.service.js';

export default baseRoute((data) => superadminPermissions.find(data.id), findAccountPermissionsSchema, {module: 'superadmins-permissions'});
