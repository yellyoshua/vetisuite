import zod from 'zod';

export const revokeProfileSessionSchema = zod.object({
  id: zod.uuid()
});
