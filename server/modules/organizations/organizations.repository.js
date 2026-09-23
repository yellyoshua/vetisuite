import repository from '@/core/repository.js';
import {organizationsTable} from '@vetisuite/database/schemas/schemas.js';

const organizationsRepository = repository(organizationsTable);

export default organizationsRepository;
