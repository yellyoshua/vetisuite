import repository from '@/core/repository.js';
import {whatsappTemplatesTable} from '@vetisuite/database/schemas/schemas.js';

const whatsappTemplatesRepository = repository(whatsappTemplatesTable);

export default whatsappTemplatesRepository;
