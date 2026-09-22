import repository from '@/core/repository.js';
import {organizationsTable, ownersTable, usersTable} from '@vetisuite/database/schemas/schemas.js';

const ownersRepository = repository(ownersTable, {
  relations: {
    user: usersTable,
    organization: organizationsTable
  }
});

export default ownersRepository;
