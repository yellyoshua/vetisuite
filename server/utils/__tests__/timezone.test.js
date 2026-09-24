import {afterEach, describe, expect, it, vi} from 'vitest';
import {dateInTimeZone, isSupportedTimeZone, todayInTimeZone, toWallClock} from '@/utils/timezone.js';

describe('utils/timezone', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('el día de un instante depende de la zona', () => {
    const instant = new Date('2026-10-02T04:30:00Z');

    expect(dateInTimeZone(instant, 'America/Guayaquil')).toBe('2026-10-01');
    expect(dateInTimeZone(instant, 'UTC')).toBe('2026-10-02');
  });

  it('hoy a las 23:30 de Guayaquil ya es mañana en UTC', () => {
    vi.useFakeTimers({toFake: ['Date']});
    vi.setSystemTime(new Date('2026-10-02T04:30:00Z'));

    expect(todayInTimeZone('America/Guayaquil')).toBe('2026-10-01');
    expect(todayInTimeZone('UTC')).toBe('2026-10-02');
  });

  it('una zona desconocida es un error, no UTC', () => {
    expect(() => todayInTimeZone('Mars/Olympus')).toThrow(expect.objectContaining({status: 500}));
    expect(() => todayInTimeZone(null)).toThrow(expect.objectContaining({status: 500}));
  });

  it('acepta zonas IANA y UTC, rechaza el resto', () => {
    expect(isSupportedTimeZone('America/Guayaquil')).toBe(true);
    expect(isSupportedTimeZone('UTC')).toBe(true);
    expect(isSupportedTimeZone('Mars/Olympus')).toBe(false);
    expect(isSupportedTimeZone('')).toBe(false);
  });

  it('toWallClock deja la hora de pared sin zona ni offset', () => {
    expect(toWallClock('2026-10-01 09:30:00')).toBe('2026-10-01T09:30:00');
  });
});
