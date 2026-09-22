import repository from '@/core/repository.js';
import {superadminsTable, usersTable} from '@vetisuite/database/schemas/schemas.js';

const superadminsRepository = repository(superadminsTable, {
  relations: {
    user: usersTable
  }
});

export default superadminsRepository;
