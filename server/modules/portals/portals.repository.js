import repository from '@/core/repository.js';
import {portalsTable} from '@vetisuite/database/schemas/schemas.js';

const portalsRepository = repository(portalsTable);

export default portalsRepository;
