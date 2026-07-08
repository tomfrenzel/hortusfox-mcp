import type { ToolDef } from './types.js';
import { plantsTools } from './plants.js';
import { locationsTools } from './locations.js';
import { tasksTools } from './tasks.js';
import { inventoryTools } from './inventory.js';
import { calendarTools } from './calendar.js';
import { chatTools } from './chat.js';
import { backupTools } from './backup.js';

/**
 * Aggregated list of every HortusFox MCP tool, one per REST API endpoint.
 */
export const allTools: ToolDef[] = [
  ...plantsTools,
  ...locationsTools,
  ...tasksTools,
  ...inventoryTools,
  ...calendarTools,
  ...chatTools,
  ...backupTools,
];

export {
  plantsTools,
  locationsTools,
  tasksTools,
  inventoryTools,
  calendarTools,
  chatTools,
  backupTools,
};
