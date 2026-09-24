import { describe, expect, it } from 'bun:test'
import { formatWallClock, TIME_ZONE_VALUES, UTC_TIME_ZONE } from '../date'

const TIME_OPTIONS = { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }

const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

const foreignTimeZone = browserTimeZone === 'Pacific/Kiritimati' ? 'America/Guayaquil' : 'Pacific/Kiritimati'

describe('formatWallClock', () => {
  it('keeps the wall clock without converting and omits the label in the browser zone', () => {
    expect(formatWallClock('2026-10-01T09:30:00', browserTimeZone, TIME_OPTIONS)).toBe('09:30')
  })

  it('keeps the wall clock and appends the zone when it differs from the browser zone', () => {
    expect(formatWallClock('2026-10-01T23:30:00', foreignTimeZone, TIME_OPTIONS)).toBe(`23:30 (${foreignTimeZone})`)
  })

  it('accepts minutes without seconds', () => {
    expect(formatWallClock('2026-10-01T09:30', browserTimeZone, TIME_OPTIONS)).toBe('09:30')
  })

  it('rejects instants with Z or offset', () => {
    expect(() => formatWallClock('2026-10-01T09:30:00Z', browserTimeZone)).toThrow()
    expect(() => formatWallClock('2026-10-01T09:30:00-05:00', browserTimeZone)).toThrow()
  })
})

describe('TIME_ZONE_VALUES', () => {
  it('includes UTC once', () => {
    expect(TIME_ZONE_VALUES.filter((timeZone) => timeZone === UTC_TIME_ZONE)).toHaveLength(1)
  })
})
