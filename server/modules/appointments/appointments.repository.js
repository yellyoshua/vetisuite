import repository from '@/core/repository.js';
import {sql} from '@vetisuite/database/orm.js';
import {appointmentsTable, employeesTable, patientsTable} from '@vetisuite/database/schemas/schemas.js';

const table = Object.create(appointmentsTable, {
  date: {value: sql`DATE(${appointmentsTable.startsAt})`, enumerable: true}
});

const appointmentsRepository = repository(table, {
  relations: {
    patient: patientsTable,
    vet: employeesTable
  }
});

export default appointmentsRepository;
