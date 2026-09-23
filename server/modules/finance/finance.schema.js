import zod from 'zod';

const emptyToUndefined = (value) => (value === '' ? undefined : value);

const dateField = zod.preprocess(
  emptyToUndefined,
  zod.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido').optional()
);

export const getFinanceSchema = zod.object({
  period: zod.enum(['month', 'quarter', 'year', 'custom']).default('month'),
  from: dateField,
  to: dateField,
  comparison: zod.enum(['none', 'previous-month', 'previous-year']).default('previous-month')
});
