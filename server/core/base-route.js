import {defineEventHandler, getQuery, getRequestHeader, readBody, readFormData} from 'h3';
import filesManager from '@/utils/files-manager.js';
import {errorResponse} from '@/core/error-response.js';
import permissions from '@/permissions/permissions.js';

const PKIT_METHODS = {
  get: 'find',
  delete: 'remove',
  post: 'create',
  put: 'update'
};

export default function baseRoute (route, schema, options = {}) {
  const files = filesManager(options.files || {});
  const moduleName = options.module;

  return defineEventHandler(async (event) => {
    const current = event.context.auth || null;
    const context = {
      event,
      requestId: event.context.requestId,
      session: current?.session || null,
      profile: current?.profile || null
    };

    try {
      const data = await extractRequestData(event);
      const permitData = await permittedData(data, moduleName, event);
      const validated = await validate(permitData, schema, options, context);

      const {snapshot, fileMoves} = files.process(validated);
      const response = await route(snapshot, context);

      await files.load(fileMoves);

      return event.handled ? response : {response, errors: null};
    } catch (error) {
      return errorResponse(error, {event, tag: '[base-route]'});
    }
  });
}

async function extractRequestData (event) {
  if (event.method === 'GET' || event.method === 'DELETE') {
    return getQuery(event);
  }

  return requestBody(event);
}

async function requestBody (event) {
  const contentType = getRequestHeader(event, 'content-type') || '';

  if (contentType.includes('application/json')) {
    return readBody(event);
  }

  if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await readFormData(event);

    return Object.fromEntries(formData.entries());
  }

  return {};
}

async function validate (data, schema, options, context) {
  const validator = options.schemaBuilder ? await options.schemaBuilder(data, context) : schema;
  const result = await validator.safeParseAsync(data);

  if (result.error) {
    throw {error: 'errors.invalid_form', status: 400, fields: Object.keys(result.error.flatten().fieldErrors)};
  }

  return result.data;
}

async function permittedData (data, module, event) {
  if (event.context.isPublic) {
    return data;
  }

  return checkPermissions(data, module, event);
}

export async function checkPermissions (data, module, event) {
  const result = await permissions.validate({
    role: event.context.auth.profile.user.role,
    method: PKIT_METHODS[event.method.toLowerCase()],
    action: module,
    permissions: event.context.auth.permissions,
    data: data,
    context: {
      requestId: event.context.requestId,
      session: event.context.auth.session,
      profile: event.context.auth.profile
    }
  });

  if (result.errors && result.errors.length) {
    const domainError = result.errors.find((error) => error.cause?.status);

    if (domainError) {
      throw domainError.cause;
    }

    throw {error: 'errors.permissions_validation_errors', status: 400, stack: result.errors};
  }

  return result.result.data;
}
