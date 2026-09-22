import repository from '@/core/repository.js';
import {sessionsTable} from '@vetisuite/database/schemas/schemas.js';

const profileSessionsRepository = repository(sessionsTable);

export default profileSessionsRepository;
