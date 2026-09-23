import baseRoute from '@/core/base-route.js';
import {listInventorySchema} from '@/modules/inventory/inventory.schema.js';
import inventoryRepository from '@/modules/inventory/inventory.repository.js';

export default baseRoute(async (params, context) => {
  return inventoryRepository.find({organization: context.profile.organization, archivedAt: null, ...pickFilters(params)}, {
    select: {id: true, name: true, category: true, stock: true, minStock: true, price: true, expiry: true, createdAt: true, updatedAt: true},
    search: params.search,
    searchFields: ['name'],
    page: params.page,
    limit: params.limit,
    orderBy: {createdAt: params.order}
  });
}, listInventorySchema, {module: 'inventory'});

function pickFilters (params) {
  return {
    ...(params.id ? {id: params.id} : {}),
    ...(params.category ? {category: params.category} : {})
  };
}
