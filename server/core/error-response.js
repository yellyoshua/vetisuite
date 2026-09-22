import {send, setHeader, setResponseStatus} from 'h3';
import logger from '@/utils/logger.js';

const errorMessages = {
  'errors.internal': 'Error interno del servidor',
  'errors.too_many_requests': 'Demasiadas solicitudes',
  'errors.unauthenticated': 'No autenticado',
  'errors.account_disabled': 'Cuenta desactivada',
  'errors.invalid_form': 'Formulario inválido',
  'errors.not_found': 'Recurso no encontrado',
  'errors.invalid_grant': 'El código de autorización no es válido o expiró',
  'errors.permissions_validation_errors': 'No tiene permiso para realizar esta acción'
};

export function errorResponse (error, params = {}) {
  const {event, tag = '[api]', ...context} = params;
  const thrown = error?.cause ?? error;
  const status = Number(thrown?.status || error?.statusCode) || 500;
  const log = status >= 500 ? logger.error : logger.warning;

  log(tag, {
    error,
    status,
    method: event.method,
    path: event.path,
    requestId: event.context.requestId,
    user: event.context.auth?.profile?.user?.id || null,
    ...context
  });

  const payload = {response: null, errors: [formatErrorMessage(thrown, status)]};

  if (thrown?.fields) {
    payload.fields = thrown.fields;
  }

  if (thrown?.retryAfter) {
    setHeader(event, 'Retry-After', String(thrown.retryAfter));
  }

  setResponseStatus(event, status);
  setHeader(event, 'Content-Type', 'application/json');

  return send(event, JSON.stringify(payload));
}

function formatErrorMessage (error, status) {
  if (typeof error?.error === 'string') {
    return errorMessages[error.error] || error.error;
  }

  const messageCode = status === 404 ? 'errors.not_found' : 'errors.internal';

  return errorMessages[messageCode];
}
