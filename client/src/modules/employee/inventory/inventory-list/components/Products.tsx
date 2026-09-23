import { DownloadIcon, PlusIcon, SearchIcon } from 'lucide-react'
import useQueryParams from '@/hooks/use-query-params'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import CustomTable from '@/components/CustomTable/CustomTable'
import FilterChips from '@/components/FilterChips/FilterChips'
import OptionSelect, { type SelectOption } from '@/components/OptionSelect/OptionSelect'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BADGE_TONE_CLASS_NAMES } from '@/constants/badge-tones'
import { PRODUCT_CATEGORY_LABELS, PRODUCT_CATEGORY_VALUES, PRODUCT_STATUS_LABELS, PRODUCT_STATUS_TONES } from '@/constants/inventory'
import { formatCurrency } from '@/lib/format-currency'
import { formatDate } from '@/lib/date'
import { getProductStatus, type Product } from '@/modules/employee/inventory/inventory.schema'

type ProductsProps = {
  products: Product[]
}

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: '', label: 'Todas las categorías' },
  ...PRODUCT_CATEGORY_VALUES.map((value) => ({ value, label: PRODUCT_CATEGORY_LABELS[value] })),
]

const PRESET_OPTIONS: SelectOption[] = [
  { value: '', label: 'Todo' },
  { value: 'low-stock', label: 'Stock bajo' },
  { value: 'expiring', label: 'Por caducar' },
]

export default function Products({ products }: ProductsProps) {
  const { nextPage, prevPage, search, changeQuery, query } = useQueryParams()
  const currentPage = Number(query.page) || 1

  return (
    <CustomPage
      title="Catálogo"
      description="Productos, precio de venta y stock mínimo. Es la única fuente de precios que consumen los demás módulos."
      actions={
        <>
          <Button variant="ghost" disabled>
            <DownloadIcon /> Exportar
          </Button>
          <Button disabled>
            <PlusIcon /> Nuevo producto
          </Button>
        </>
      }
    >
      <CustomPageContainer className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              aria-label="Buscar productos"
              placeholder="Busca un producto…"
              defaultValue={query.search || ''}
              onChange={({ target }) => search(target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-foreground"
            />
          </div>
          <OptionSelect label="Categoría" value={query.category || ''} options={CATEGORY_OPTIONS} onChange={(category) => changeQuery({ category, page: null })} />
        </div>
        <FilterChips label="Filtros rápidos del catálogo" options={PRESET_OPTIONS} value={query.preset || ''} onChange={(preset) => changeQuery({ preset, page: null })} />
      </CustomPageContainer>

      <CustomTable dataSize={products.length} currentPage={currentPage} nextPage={nextPage} prevPage={prevPage}>
        <CustomTable.Thead>
          <CustomTable.TableRow header={true}>
            <CustomTable.TheadItem>Producto</CustomTable.TheadItem>
            <CustomTable.TheadItem>Precio</CustomTable.TheadItem>
            <CustomTable.TheadItem>Stock</CustomTable.TheadItem>
            <CustomTable.TheadItem>Caducidad</CustomTable.TheadItem>
            <CustomTable.TheadItem>Estado</CustomTable.TheadItem>
          </CustomTable.TableRow>
        </CustomTable.Thead>
        <CustomTable.TBody>
          {products.map((product) => {
            const status = getProductStatus(product)

            return (
              <CustomTable.TableRow key={product.id}>
                <CustomTable.TBodyItem><span className="flex flex-col"><span className="font-medium">{product.name}</span><span className="text-sub">{PRODUCT_CATEGORY_LABELS[product.category]}</span></span></CustomTable.TBodyItem>
                <CustomTable.TBodyItem>{formatCurrency(product.price)}</CustomTable.TBodyItem>
                <CustomTable.TBodyItem>{product.stock} / mín. {product.minStock}</CustomTable.TBodyItem>
                <CustomTable.TBodyItem>{product.expiry ? formatDate(`${product.expiry}T00:00:00`, { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</CustomTable.TBodyItem>
                <CustomTable.TBodyItem><Badge variant="outline" className={BADGE_TONE_CLASS_NAMES[PRODUCT_STATUS_TONES[status]]}>{PRODUCT_STATUS_LABELS[status]}</Badge></CustomTable.TBodyItem>
              </CustomTable.TableRow>
            )
          })}
        </CustomTable.TBody>
      </CustomTable>
    </CustomPage>
  )
}
