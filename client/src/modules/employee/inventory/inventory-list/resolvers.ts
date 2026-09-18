import type { ListPage } from '@/hooks/use-list-query'
import { matchesSearch } from '@/lib/matches-search'
import { paginateRows } from '@/lib/paginate-rows'
import { toIsoDate } from '@/lib/to-iso-date'
import { getExpiryStatus, type Product, type ProductListQuery, type ProductPreset, type ProductStatus } from '../inventory.schema'

type ProductRecord = Omit<Product, 'status'>

const NO_MOVEMENT_DAYS = 30

const PRODUCTS: ProductRecord[] = [
  { id: 'prd-1', name: 'Vacuna Antirrábica', category: 'vaccines', price: 12, stock: 3, minStock: 5, expiresAt: '2027-03-12', lastMovementAt: '2026-09-06' },
  { id: 'prd-2', name: 'Amoxicilina 250 mg', category: 'medicines', price: 8.5, stock: 14, minStock: 6, expiresAt: '2026-08-01', lastMovementAt: '2026-09-04' },
  { id: 'prd-3', name: 'Vacuna Séxtuple', category: 'vaccines', price: 18, stock: 9, minStock: 4, expiresAt: '2026-09-15', lastMovementAt: '2026-08-12' },
  { id: 'prd-4', name: 'Shampoo dermatológico', category: 'grooming', price: 14, stock: 22, minStock: 8, expiresAt: '2028-01-20', lastMovementAt: '2026-09-06' },
  { id: 'prd-5', name: 'Alimento renal 2 kg', category: 'food', price: 26, stock: 11, minStock: 5, expiresAt: '2026-11-04', lastMovementAt: '2026-08-30' },
  { id: 'prd-6', name: 'Jeringas 5 ml', category: 'supplies', price: 0.35, stock: 140, minStock: 50, expiresAt: null, lastMovementAt: '2026-09-05' },
  { id: 'prd-7', name: 'Meloxicam 1.5 mg/ml', category: 'medicines', price: 9.75, stock: 18, minStock: 6, expiresAt: '2027-05-30', lastMovementAt: '2026-09-04' },
  { id: 'prd-8', name: 'Pipeta antipulgas perro mediano', category: 'medicines', price: 11.5, stock: 4, minStock: 10, expiresAt: '2027-02-28', lastMovementAt: '2026-09-03' },
  { id: 'prd-9', name: 'Vacuna Triple felina', category: 'vaccines', price: 16, stock: 7, minStock: 4, expiresAt: '2026-10-30', lastMovementAt: '2026-09-03' },
  { id: 'prd-10', name: 'Alimento cachorro 3 kg', category: 'food', price: 21, stock: 6, minStock: 3, expiresAt: '2027-04-10', lastMovementAt: '2026-06-20' },
  { id: 'prd-11', name: 'Colonia para mascotas', category: 'grooming', price: 6.5, stock: 15, minStock: 5, expiresAt: '2028-03-01', lastMovementAt: null },
  { id: 'prd-12', name: 'Guantes de nitrilo (caja)', category: 'supplies', price: 7.8, stock: 12, minStock: 4, expiresAt: null, lastMovementAt: '2026-07-14' },
]

function isLowStock(product: ProductRecord): boolean {
  return product.stock < product.minStock
}

function getProductStatus(product: ProductRecord, today: Date): ProductStatus {
  const expiryStatus = getExpiryStatus(product.expiresAt, today)
  if (expiryStatus === 'expired') {
    return 'expired'
  }
  if (isLowStock(product)) {
    return 'low-stock'
  }

  return expiryStatus === 'expiring' ? 'expiring' : 'available'
}

function matchesPreset(product: ProductRecord, preset: ProductPreset, today: Date): boolean {
  const movementLimit = toIsoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - NO_MOVEMENT_DAYS))
  const presetRules: Record<ProductPreset, boolean> = {
    'low-stock': isLowStock(product),
    expiring: getExpiryStatus(product.expiresAt, today) === 'expiring',
    'no-movement': product.lastMovementAt === null || product.lastMovementAt < movementLimit,
  }

  return presetRules[preset]
}

function filterProducts({ search, filters }: ProductListQuery, today: Date): ProductRecord[] {
  return PRODUCTS.filter(
    (product) =>
      matchesSearch(search, [product.name]) &&
      (!filters.category || product.category === filters.category) &&
      (!filters.preset || matchesPreset(product, filters.preset as ProductPreset, today)),
  )
}

export function resolveProductsList(query: ProductListQuery): Promise<ListPage<Product>> {
  return Promise.resolve().then(() => {
    const today = new Date()
    const products = filterProducts(query, today).map((product) => ({ ...product, status: getProductStatus(product, today) }))

    return paginateRows(products, query)
  })
}
