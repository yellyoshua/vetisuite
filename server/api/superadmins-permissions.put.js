import baseRoute from '@/core/base-route.js';
import {updateAccountPermissionsSchema} from '@/modules/accounts/accounts.schema.js';
import {superadminPermissions} from '@/modules/accounts/account-permissions.service.js';

export default baseRoute((data) => superadminPermissions.update(data.id, data.permissions), updateAccountPermissionsSchema, {module: 'superadmins-permissions'});
