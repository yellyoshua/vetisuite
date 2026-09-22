import {Pkit} from 'endpoint-permissions-kit';
import {roleOptions} from '@/constants/roles.js';

export const pkit = new Pkit({
  roles: roleOptions,
  reservedFields: ['id', 'limit', 'page', 'sort', 'perPage', 'order'],
  cropper: false
});
