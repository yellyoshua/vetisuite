import repository from '@/core/repository.js';
import {clientsTable, whatsappMessagesTable} from '@vetisuite/database/schemas/schemas.js';

const whatsappMessagesRepository = repository(whatsappMessagesTable, {relations: {client: clientsTable}});

export default whatsappMessagesRepository;
