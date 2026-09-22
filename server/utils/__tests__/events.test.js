import {beforeEach, describe, expect, it, vi} from 'vitest';

const send = vi.hoisted(() => vi.fn());

vi.unmock('@/utils/events.js');

vi.mock('@aws-sdk/client-sqs', () => ({
  SQSClient: class {
    send (command) {
      return send(command);
    }
  },
  SendMessageCommand: class SendMessageCommand {
    constructor (input) {
      this.input = input;
    }
  },
  GetQueueUrlCommand: class GetQueueUrlCommand {
    constructor (input) {
      this.input = input;
    }
  }
}));

const {default: events} = await import('@/utils/events.js');

describe('utils/events', () => {
  beforeEach(() => {
    send.mockReset();
  });

  it('resuelve la cola por nombre, publica el contrato y cachea la URL', async () => {
    send.mockImplementation(async (command) => (command.constructor.name === 'GetQueueUrlCommand' ? {QueueUrl: 'https://sqs.test/cola'} : {}));

    const first = await events.emailAccountManager.publish({action: 'account_created', userId: 'u1'}, {requestId: 'r1'});
    const second = await events.emailAccountManager.publish({action: 'password_reset', userId: 'u1'}, {requestId: 'r2'});

    const lookups = send.mock.calls.filter(([command]) => command.constructor.name === 'GetQueueUrlCommand');
    const messages = send.mock.calls.filter(([command]) => command.constructor.name === 'SendMessageCommand');

    expect(first).toBe(true);
    expect(second).toBe(true);
    expect(lookups).toHaveLength(1);
    expect(lookups[0][0].input.QueueName).toBe('vetisuite-development-cloudtask-email-account-manager');
    expect(JSON.parse(messages[0][0].input.MessageBody)).toEqual({requestId: 'r1', type: 'email-account-manager', detail: {action: 'account_created', userId: 'u1'}});
  });

  it('nunca lanza: devuelve false si SQS falla', async () => {
    send.mockRejectedValue(new Error('NonExistentQueue'));

    await expect(events.emailAccountManager.publish({action: 'x'}, {requestId: 'r3'})).resolves.toBe(false);
  });
});
