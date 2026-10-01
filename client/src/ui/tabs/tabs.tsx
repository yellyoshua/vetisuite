import useTabs, { type TabsProps } from './tabs.handlers'

export default function Tabs(props: TabsProps) {
  const { rootProps, listProps, tabs, panels } = useTabs(props)

  return (
    <div {...rootProps}>
      <div {...listProps}>
        {tabs.map((tab) => (
          <button key={tab.key} {...tab.props}>
            {tab.label}
          </button>
        ))}
      </div>
      {panels.map((panel) => (
        <div key={panel.key} {...panel.props}>
          {panel.content}
        </div>
      ))}
    </div>
  )
}
