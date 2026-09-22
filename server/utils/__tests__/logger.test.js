import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import logger from '@/utils/logger.js';

describe('utils/logger', () => {
  beforeEach(() => {
    delete process.env.X_IS_TESTING_MODE;
  });

  afterEach(() => {
    process.env.X_IS_TESTING_MODE = 'true';
    vi.restoreAllMocks();
  });

  it('en local escribe una línea plana por evento, info a stdout y error a stderr', () => {
    const stdout = vi.spyOn(process.stdout, 'write').mockReturnValue(true);
    const stderr = vi.spyOn(process.stderr, 'write').mockReturnValue(true);

    logger.info('[http] request.completed', {status: 200});
    logger.error('[api]');

    expect(stdout).toHaveBeenCalledWith('[info] [http] request.completed {"status":200}\n');
    expect(stderr).toHaveBeenCalledWith('[error] [api]\n');
  });

  it('serializa errores con su causa', () => {
    const stderr = vi.spyOn(process.stderr, 'write').mockReturnValue(true);
    const error = new Error('fuera', {cause: new Error('dentro')});

    logger.warning('[x]', error);

    const line = stderr.mock.calls[0][0];

    expect(line).toContain('"message":"fuera"');
    expect(line).toContain('"cause":{"name":"Error","message":"dentro"');
  });

  it('en modo test no escribe', () => {
    process.env.X_IS_TESTING_MODE = 'true';
    const stdout = vi.spyOn(process.stdout, 'write').mockReturnValue(true);

    logger.info('silencio');

    expect(stdout).not.toHaveBeenCalled();
  });
});
