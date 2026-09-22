import repository from '@/core/repository.js';
import {clientsTable, patientsTable} from '@vetisuite/database/schemas/schemas.js';

const clientsPatientsRepository = repository(patientsTable, {
  relations: {
    client: clientsTable
  }
});

export default clientsPatientsRepository;
