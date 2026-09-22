import {isLocal} from './environment.js';

const MAX_CAUSE_DEPTH = 2;

const streams = {info: process.stdout, warning: process.stderr, error: process.stderr};

const logger = {
  info: (message, context = '') => write('info', message, context),
  warning: (message, context = '') => write('warning', message, context),
  error: (message, context = '') => write('error', message, context)
};

export default logger;

function write (level, message, context) {
  if (process.env.X_IS_TESTING_MODE) {
    return;
  }

  streams[level].write(`${formatLine({level, message, ...toContext(context)})}\n`);
}

function formatLine (entry) {
  if (!isLocal) {
    return JSON.stringify(entry);
  }

  const {level, message, ...context} = entry;
  const line = `[${level}] ${message}`;

  if (Object.keys(context).length === 0) {
    return line;
  }

  return `${line} ${JSON.stringify(context)}`;
}

function toContext (context) {
  if (context instanceof Error) {
    return {error: toError(context)};
  }

  if (typeof context !== 'object' || context === null) {
    return context === '' ? {} : {detail: context};
  }

  return Object.fromEntries(Object.entries(context).map(([key, value]) => [key, value instanceof Error ? toError(value) : value]));
}

function toError (error, depth = 0) {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...(error.code ? {code: error.code} : {}),
    ...(error.detail ? {detail: error.detail} : {}),
    ...causeOf(error, depth)
  };
}

function causeOf (error, depth) {
  if (depth >= MAX_CAUSE_DEPTH || !(error.cause instanceof Error)) {
    return {};
  }

  return {cause: toError(error.cause, depth + 1)};
}
