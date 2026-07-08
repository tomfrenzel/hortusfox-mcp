import { z } from 'zod';
import { defineTool, type ToolDef } from './types.js';

/**
 * Backup domain: export a backup archive and import data.
 * Mirrors the `/api/backup/*` endpoints. Each flag selects a data category.
 */
const categoryShape = {
  locations: z.boolean().optional().describe('Include locations. Default false.'),
  plants: z.boolean().optional().describe('Include plants. Default false.'),
  gallery: z.boolean().optional().describe('Include gallery photos. Default false.'),
  tasks: z.boolean().optional().describe('Include tasks. Default false.'),
  inventory: z.boolean().optional().describe('Include inventory. Default false.'),
  calendar: z.boolean().optional().describe('Include calendar entries. Default false.'),
};

export const backupTools: ToolDef[] = [
  defineTool({
    name: 'hortusfox_export_backup',
    title: 'Export backup',
    description:
      'Export a backup archive for the selected data categories. Returns a downloadable file URL. Endpoint: /api/backup/export.',
    inputSchema: categoryShape,
    handler: (client, args) =>
      client.request('backup/export', {
        locations: args.locations,
        plants: args.plants,
        gallery: args.gallery,
        tasks: args.tasks,
        inventory: args.inventory,
        calendar: args.calendar,
      }),
  }),

  defineTool({
    name: 'hortusfox_import_backup',
    title: 'Import backup',
    description:
      'Import previously staged backup data for the selected categories. Endpoint: /api/backup/import.',
    inputSchema: categoryShape,
    handler: (client, args) =>
      client.request('backup/import', {
        locations: args.locations,
        plants: args.plants,
        gallery: args.gallery,
        tasks: args.tasks,
        inventory: args.inventory,
        calendar: args.calendar,
      }),
  }),
];
