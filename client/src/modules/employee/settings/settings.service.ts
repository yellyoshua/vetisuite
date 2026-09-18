import type { SettingsSection, SettingsUpdate } from './settings.schema'

const settingsService = {
  get(_section: string): Promise<SettingsSection> {
    throw new Error('Not implemented: settingsService.get')
  },
  save(_update: SettingsUpdate): Promise<SettingsSection> {
    throw new Error('Not implemented: settingsService.save')
  },
}

export default settingsService
