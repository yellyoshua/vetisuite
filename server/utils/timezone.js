const supportedTimeZones = new Set([...Intl.supportedValuesOf('timeZone'), 'UTC']);

export function isSupportedTimeZone (timeZone) {
  return supportedTimeZones.has(timeZone);
}

export function dateInTimeZone (instant, timeZone) {
  if (!isSupportedTimeZone(timeZone)) {
    throw {error: 'La zona horaria de la organización no es válida', status: 500};
  }

  return new Intl.DateTimeFormat('en-CA', {timeZone, year: 'numeric', month: '2-digit', day: '2-digit'}).format(instant);
}

export function todayInTimeZone (timeZone) {
  return dateInTimeZone(new Date(), timeZone);
}

export function toWallClock (value) {
  return value.replace(' ', 'T');
}
