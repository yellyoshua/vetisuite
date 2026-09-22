import baseRoute from '@/core/base-route.js';
import uploadsSchema from '@/modules/uploads/uploads.schema.js';
import {signUpload} from '@/modules/uploads/uploads.service.js';

export default baseRoute((data, context) => signUpload(data.name, context.profile), uploadsSchema, {module: 'uploads'});
