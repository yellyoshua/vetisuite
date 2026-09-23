import baseRoute from '@/core/base-route.js';
import {countInventorySchema} from '@/modules/inventory/inventory.schema.js';
import inventoryRepository from '@/modules/inventory/inventory.repository.js';

export default baseRoute(async (params, context) => {
  const value = await inventoryRepository.count({organization: context.profile.organization, archivedAt: null, ...pickFilters(params)}, {
    search: params.search,
    searchFields: ['name']
  });

  return {value};
}, countInventorySchema, {module: 'inventory-count'});

function pickFilters (params) {
  return {
    ...(params.category ? {category: params.category} : {})
  };
}
