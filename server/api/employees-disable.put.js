import baseRoute from '@/core/base-route.js';
import {disableAccountSchema} from '@/modules/accounts/accounts.schema.js';
import {updateEmployeeAccount} from '@/modules/accounts/accounts.service.js';

export default baseRoute(async (data, context) => {
  await updateEmployeeAccount({id: data.id, user: {disabled: data.disabled}}, {requestId: context.requestId});

  return {success: true};
}, disableAccountSchema, {module: 'employees-disable'});
