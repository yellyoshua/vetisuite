import type { ComponentType } from 'react'
import InputDemo from '@/ui/input/input.demo'
import TextareaDemo from '@/ui/textarea/textarea.demo'
import SelectDemo from '@/ui/select/select.demo'
import ComboBoxDemo from '@/ui/combo-box/combo-box.demo'
import SearchInputDemo from '@/ui/search-input/search-input.demo'
import CheckboxDemo from '@/ui/checkbox/checkbox.demo'
import RadioGroupDemo from '@/ui/radio-group/radio-group.demo'
import SwitchDemo from '@/ui/switch/switch.demo'
import SegmentedControlDemo from '@/ui/segmented-control/segmented-control.demo'
import LabelDemo from '@/ui/label/label.demo'
import ChipDemo from '@/ui/chip/chip.demo'
import ButtonDemo from '@/ui/button/button.demo'
import DropdownMenuDemo from '@/ui/dropdown-menu/dropdown-menu.demo'
import DialogDemo from '@/ui/dialog/dialog.demo'
import TooltipDemo from '@/ui/tooltip/tooltip.demo'
import ToastDemo from '@/ui/toast/toast.demo'
import AlertDemo from '@/ui/alert/alert.demo'
import ChatPanelDemo from '@/ui/chat-panel/chat-panel.demo'
import SidebarDemo from '@/ui/sidebar/sidebar.demo'
import ToolbarDemo from '@/ui/toolbar/toolbar.demo'
import BreadcrumbDemo from '@/ui/breadcrumb/breadcrumb.demo'
import TabsDemo from '@/ui/tabs/tabs.demo'
import PageHeaderDemo from '@/ui/page-header/page-header.demo'
import UserMenuDemo from '@/ui/user-menu/user-menu.demo'
import ThemeToggleDemo from '@/ui/theme-toggle/theme-toggle.demo'
import FramedCardDemo from '@/ui/framed-card/framed-card.demo'
import CardDemo from '@/ui/card/card.demo'
import StatCardDemo from '@/ui/stat-card/stat-card.demo'
import ActivityFeedDemo from '@/ui/activity-feed/activity-feed.demo'
import StatusLabelDemo from '@/ui/status-label/status-label.demo'
import PriorityIndicatorDemo from '@/ui/priority-indicator/priority-indicator.demo'
import BadgeDemo from '@/ui/badge/badge.demo'
import AvatarDemo from '@/ui/avatar/avatar.demo'
import ListDemo from '@/ui/list/list.demo'
import GridDemo from '@/ui/grid/grid.demo'
import SeparatorDemo from '@/ui/separator/separator.demo'
import TableDemo from '@/ui/table/table.demo'

export type CatalogItem = {
  id: string
  title: string
  Demo: ComponentType
  framed: boolean
}

export type CatalogGroup = {
  id: string
  label: string
  items: CatalogItem[]
}

export const catalogGroups: CatalogGroup[] = [
  {
    id: 'forms',
    label: 'Formularios',
    items: [
      { id: 'input', title: 'Input', Demo: InputDemo, framed: false },
      { id: 'textarea', title: 'Textarea', Demo: TextareaDemo, framed: false },
      { id: 'select', title: 'Select', Demo: SelectDemo, framed: false },
      { id: 'combo-box', title: 'Combo box', Demo: ComboBoxDemo, framed: false },
      { id: 'search-input', title: 'Búsqueda', Demo: SearchInputDemo, framed: false },
      { id: 'checkbox', title: 'Checkbox', Demo: CheckboxDemo, framed: false },
      { id: 'radio-group', title: 'Radio group', Demo: RadioGroupDemo, framed: false },
      { id: 'switch', title: 'Switch', Demo: SwitchDemo, framed: false },
      { id: 'segmented-control', title: 'Control segmentado', Demo: SegmentedControlDemo, framed: false },
      { id: 'label', title: 'Label', Demo: LabelDemo, framed: false },
      { id: 'chip', title: 'Chip', Demo: ChipDemo, framed: false },
    ],
  },
  {
    id: 'overlays',
    label: 'Acciones y overlays',
    items: [
      { id: 'button', title: 'Button', Demo: ButtonDemo, framed: false },
      { id: 'dropdown-menu', title: 'Menú desplegable', Demo: DropdownMenuDemo, framed: false },
      { id: 'dialog', title: 'Dialog', Demo: DialogDemo, framed: false },
      { id: 'tooltip', title: 'Tooltip', Demo: TooltipDemo, framed: false },
      { id: 'toast', title: 'Toast', Demo: ToastDemo, framed: false },
      { id: 'alert', title: 'Alerta', Demo: AlertDemo, framed: false },
      { id: 'chat-panel', title: 'Panel de chat', Demo: ChatPanelDemo, framed: true },
    ],
  },
  {
    id: 'navigation',
    label: 'Navegación',
    items: [
      { id: 'sidebar', title: 'Sidebar', Demo: SidebarDemo, framed: false },
      { id: 'toolbar', title: 'Toolbar', Demo: ToolbarDemo, framed: false },
      { id: 'breadcrumb', title: 'Breadcrumb', Demo: BreadcrumbDemo, framed: false },
      { id: 'tabs', title: 'Tabs', Demo: TabsDemo, framed: false },
      { id: 'page-header', title: 'Encabezado de página', Demo: PageHeaderDemo, framed: false },
      { id: 'user-menu', title: 'Menú de usuario', Demo: UserMenuDemo, framed: false },
      { id: 'theme-toggle', title: 'Tema', Demo: ThemeToggleDemo, framed: false },
    ],
  },
  {
    id: 'display',
    label: 'Visualización',
    items: [
      { id: 'framed-card', title: 'Tarjeta enmarcada', Demo: FramedCardDemo, framed: true },
      { id: 'card', title: 'Card', Demo: CardDemo, framed: false },
      { id: 'stat-card', title: 'Métrica', Demo: StatCardDemo, framed: true },
      { id: 'activity-feed', title: 'Actividad', Demo: ActivityFeedDemo, framed: false },
      { id: 'status-label', title: 'Estado', Demo: StatusLabelDemo, framed: false },
      { id: 'priority-indicator', title: 'Prioridad', Demo: PriorityIndicatorDemo, framed: false },
      { id: 'badge', title: 'Badge', Demo: BadgeDemo, framed: false },
      { id: 'avatar', title: 'Avatar', Demo: AvatarDemo, framed: false },
      { id: 'list', title: 'Lista', Demo: ListDemo, framed: false },
      { id: 'grid', title: 'Grid', Demo: GridDemo, framed: false },
      { id: 'separator', title: 'Separador', Demo: SeparatorDemo, framed: false },
    ],
  },
  {
    id: 'data',
    label: 'Datos',
    items: [
      { id: 'table', title: 'Tabla', Demo: TableDemo, framed: true },
    ],
  },
]
