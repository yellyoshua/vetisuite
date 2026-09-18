import type { SqsBatchResponse, SqsEvent } from '@/utils/base-sqs-handler'
import type { DuePatient } from './find-due-patients'

export type VaccineDueReminderMessage = {
  clinicId: string
  dueBefore: string
}

export function notifyOwner(_duePatient: DuePatient): Promise<void> {
  throw new Error('Not implemented: notifyOwner')
}

function vaccineDueReminder(_event: SqsEvent): Promise<SqsBatchResponse> {
  throw new Error('Not implemented: vaccineDueReminder')
}

export default vaccineDueReminder
