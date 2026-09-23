import { EXPIRY_STATUS_VALUES, PRODUCT_CATEGORY_VALUES, PRODUCT_STATUS_VALUES } from '@/constants/inventory'
import { toIsoDate } from '@/lib/to-iso-date'

const EXPIRING_SOON_DAYS = 60

export type ProductCategory = (typeof PRODUCT_CATEGORY_VALUES)[number]

export type ProductStatus = (typeof PRODUCT_STATUS_VALUES)[number]

export type ExpiryStatus = (typeof EXPIRY_STATUS_VALUES)[number]

export type Product = {
  id: string
  name: string
  category: ProductCategory
  price: number
  stock: number
  minStock: number
  expiry: string | null
  createdAt: string
  updatedAt: string
}

export type ProductPreset = 'low-stock' | 'expiring'

export function getExpiryStatus(expiresAt: string | null, today: Date): ExpiryStatus {
  if (!expiresAt) {
    return 'valid'
  }
  if (expiresAt < toIsoDate(today)) {
    return 'expired'
  }
  const expiringLimit = toIsoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + EXPIRING_SOON_DAYS))

  return expiresAt <= expiringLimit ? 'expiring' : 'valid'
}

export function getProductStatus(product: Pick<Product, 'stock' | 'minStock' | 'expiry'>, today = new Date()): ProductStatus {
  const expiryStatus = getExpiryStatus(product.expiry, today)
  if (expiryStatus === 'expired') {
    return 'expired'
  }
  if (product.stock < product.minStock) {
    return 'low-stock'
  }

  return expiryStatus === 'expiring' ? 'expiring' : 'available'
}
