import repository from '@/core/repository.js';
import {appointmentsAvailabilityTable} from '@vetisuite/database/schemas/schemas.js';

const appointmentsAvailabilityRepository = repository(appointmentsAvailabilityTable);

export default appointmentsAvailabilityRepository;
