import type { ClinicAvailability, ClinicAvailabilityInput } from './appointments-clinics.schema'

const appointmentsClinicsService = {
  get(): Promise<ClinicAvailability> {
    throw new Error('Not implemented: appointmentsClinicsService.get')
  },
  update(_input: ClinicAvailabilityInput): Promise<ClinicAvailability> {
    throw new Error('Not implemented: appointmentsClinicsService.update')
  },
}

export default appointmentsClinicsService
