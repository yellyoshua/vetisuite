import repository from '@/core/repository.js';
import {clientsTable} from '@vetisuite/database/schemas/schemas.js';

const clientsRepository = repository(clientsTable);

export default clientsRepository;
