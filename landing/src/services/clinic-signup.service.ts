export type ClinicSignupPayload = {
  clinicName: string
  contactName: string
  email: string
  phone: string
  city: string
  notes?: string
}

export type ClinicSignupResult = {
  requestId: string
  receivedAt: string
}

export default function requestClinicDemo(
  _payload: ClinicSignupPayload,
): Promise<ClinicSignupResult> {
  throw new Error('Not implemented: requestClinicDemo')
}
