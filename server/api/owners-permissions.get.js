import baseRoute from '@/core/base-route.js';
import {findAccountPermissionsSchema} from '@/modules/accounts/accounts.schema.js';
import {ownerPermissions} from '@/modules/accounts/account-permissions.service.js';

export default baseRoute((data) => ownerPermissions.find(data.id), findAccountPermissionsSchema, {module: 'owners-permissions'});
