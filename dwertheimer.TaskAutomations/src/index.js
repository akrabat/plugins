// @flow
export { default as sortTasks, sortTasksByPerson, sortTasksByTag, sortTasksByDue, tasksToTop, openTasksToTop, sortTasksViaTemplate, sortTasksTagMention, sortTasksDefault } from './sortTasks'
export { default as markTasks } from './markTasks'
export { taskSync } from './taskSync'
export { copyTagsFromLineAbove, copyTagsFromHeadingAbove, copyLineForEachMention, copyLineForEachHashtag } from './tagTasks'
export { openIncompleteLinksInNote, openURLOnLine } from './NPOpenLinks'
import pluginJson from '../plugin.json'
import { clo } from '@helpers/dev'

// updateSettingsData will execute whenever your plugin is installed or updated
import { updateSettingData, pluginUpdated } from '@helpers/NPConfiguration'

export function init(): void {
  // this runs every time the plugin starts up (any command in this plugin is run)
  clo(DataStore.settings, `${pluginJson['plugin.id']} Plugin Settings`)
  DataStore.installOrUpdatePluginsByID([pluginJson['plugin.id']], true, false, false).then((r) => pluginUpdated(pluginJson, r))
}

export async function onSettingsUpdated(): Promise<void> {
  // you probably won't need to use this...it's fired when the settings are updated in the Preferences panel
}

export function onUpdateOrInstall(): void {
  // this runs after the plugin is installed or updated. the following command updates the plugin's settings data
  updateSettingData(pluginJson)
}
