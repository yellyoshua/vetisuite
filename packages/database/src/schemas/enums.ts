import { pgEnum } from 'drizzle-orm/pg-core'

export const role = pgEnum('role', ['superadmin', 'owner', 'employee', 'public'])

export const species = pgEnum('species', ['dog', 'cat', 'bird', 'other'])

export const patientSex = pgEnum('patient_sex', ['male', 'female'])

export const employeePosition = pgEnum('employee_position', ['veterinarian', 'groomer', 'receptionist'])

export const appointmentStatus = pgEnum('appointment_status', ['pending', 'confirmed', 'completed', 'cancelled'])

export const appointmentSource = pgEnum('appointment_source', ['staff', 'portal'])

export const serviceType = pgEnum('service_type', ['veterinary', 'grooming', 'laboratory', 'medication', 'vaccine'])

export const visitServiceStatus = pgEnum('visit_service_status', [
  'pending',
  'waiting',
  'in_consultation',
  'in_progress',
  'requested',
  'resulted',
  'applied',
  'done',
  'delivered',
  'voided',
])

export const businessArea = pgEnum('business_area', ['clinic', 'grooming', 'laboratory'])

export const payMethod = pgEnum('pay_method', ['cash', 'card', 'transfer'])

export const productCategory = pgEnum('product_category', ['vaccines', 'medications', 'grooming', 'food', 'supplies'])

export const portalPurpose = pgEnum('portal_purpose', ['booking', 'capture'])

export const portalStatus = pgEnum('portal_status', ['draft', 'published'])

export const vetPolicy = pgEnum('vet_policy', ['clinic_assigns', 'visitor_chooses'])

export const fieldType = pgEnum('field_type', [
  'text',
  'textarea',
  'email',
  'phone',
  'number',
  'date',
  'time_slot',
  'select',
  'multiselect',
  'checkbox',
])

export const fieldBinding = pgEnum('field_binding', [
  'client.name',
  'client.phone',
  'client.email',
  'patient.name',
  'patient.species',
  'patient.breed',
  'patient.age',
  'patient.sex',
  'patient.allergies',
  'appointment.date',
  'appointment.time',
  'appointment.vet',
  'appointment.reason',
])

export const optionsSource = pgEnum('options_source', ['static', 'species', 'vets'])

export const submissionStatus = pgEnum('submission_status', ['received', 'appointment_created', 'captured', 'rejected'])

export const rejectionReason = pgEnum('rejection_reason', [
  'slot_taken',
  'outside_availability',
  'max_per_day',
  'portal_changed',
  'portal_closed',
  'duplicate',
])

export const accountTokenType = pgEnum('account_token_type', ['email_confirmation', 'password_reset'])
