import repository from '@/core/repository.js';
import {whatsappAccountsTable} from '@vetisuite/database/schemas/schemas.js';

const whatsappAccountRepository = repository(whatsappAccountsTable);

export default whatsappAccountRepository;
