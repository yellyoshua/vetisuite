import repository from '@/core/repository.js';
import {visitsServiceGroomingTable} from '@vetisuite/database/schemas/schemas.js';

const visitsGroomingRepository = repository(visitsServiceGroomingTable);

export default visitsGroomingRepository;
