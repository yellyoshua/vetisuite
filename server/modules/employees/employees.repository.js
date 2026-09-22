import repository from '@/core/repository.js';
import {employeesTable, organizationsTable, usersTable} from '@vetisuite/database/schemas/schemas.js';

const employeesRepository = repository(employeesTable, {
  relations: {
    user: usersTable,
    organization: organizationsTable
  }
});

export default employeesRepository;
