import baseRoute from '@/core/base-route.js';
import {updateAccountPermissionsSchema} from '@/modules/accounts/accounts.schema.js';
import {ownerPermissions} from '@/modules/accounts/account-permissions.service.js';

export default baseRoute((data) => ownerPermissions.update(data.id, data.permissions), updateAccountPermissionsSchema, {module: 'owners-permissions'});
