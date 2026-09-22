import {beforeEach, describe, expect, it, vi} from 'vitest';

const send = vi.hoisted(() => vi.fn());

vi.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {from: () => ({send})},
  UpdateCommand: class UpdateCommand {
    constructor (input) {
      this.input = input;
    }
  }
}));

vi.unmock('@/utils/dynamodb.js');

const {default: dynamodb} = await import('@/utils/dynamodb.js');

const NOW = new Date('2026-09-18T12:00:00.000Z');
const NOW_SECONDS = NOW.getTime() / 1000;
const BUCKET = `w${Math.floor(NOW_SECONDS / 10)}`;

describe('utils/dynamodb', () => {
  beforeEach(() => {
    send.mockReset();
    vi.useFakeTimers({toFake: ['Date']});
    vi.setSystemTime(NOW);
  });

  it('dentro del límite hace una sola escritura en la tabla de sesiones', async () => {
    send.mockResolvedValueOnce({Attributes: {[BUCKET]: 1}});

    await dynamodb.rateLimits.enforce('session-1');

    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0].input.TableName).toBe('vetisuite-development-rate-limits');
    expect(send.mock.calls[0][0].input.Key).toEqual({key: 'session-1'});
  });

  it('al superar el límite banea y responde 429 con retryAfter', async () => {
    send
    .mockResolvedValueOnce({Attributes: {[BUCKET]: 501}})
    .mockResolvedValueOnce({Attributes: {banUntil: NOW_SECONDS + 300}});

    await expect(dynamodb.rateLimits.enforce('session-1')).rejects.toEqual({error: 'errors.too_many_requests', status: 429, retryAfter: 300});
    expect(send).toHaveBeenCalledTimes(2);
  });

  it('un baneo vigente responde 429 sin segunda escritura', async () => {
    send.mockResolvedValueOnce({Attributes: {[BUCKET]: 1, banUntil: NOW_SECONDS + 60}});

    await expect(dynamodb.publicRateLimits.enforce('hash')).rejects.toEqual({error: 'errors.too_many_requests', status: 429, retryAfter: 60});
    expect(send.mock.calls[0][0].input.TableName).toBe('vetisuite-development-public-rate-limits');
  });

  it('los errores de DynamoDB suben sin tocar', async () => {
    send.mockRejectedValueOnce(new Error('ResourceNotFoundException'));

    await expect(dynamodb.publicRateLimits.enforce('hash')).rejects.toThrow('ResourceNotFoundException');
  });
});
