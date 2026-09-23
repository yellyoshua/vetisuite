import repository from '@/core/repository.js';
import {visitsTable} from '@vetisuite/database/schemas/schemas.js';

const visitsRepository = repository(visitsTable);

export default visitsRepository;
