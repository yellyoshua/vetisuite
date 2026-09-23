import repository from '@/core/repository.js';
import {productsTable} from '@vetisuite/database/schemas/schemas.js';

const inventoryRepository = repository(productsTable);

export default inventoryRepository;
