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
    handler: (client, args) => {
      const params: Record<string, any> = {};
      if (args.locations !== undefined) params.locations = args.locations;
      if (args.plants !== undefined) params.plants = args.plants;
      if (args.gallery !== undefined) params.gallery = args.gallery;
      if (args.tasks !== undefined) params.tasks = args.tasks;
      if (args.inventory !== undefined) params.inventory = args.inventory;
      if (args.calendar !== undefined) params.calendar = args.calendar;
      return client.request('backup/export', params);
    },
  }),

  defineTool({
    name: 'hortusfox_import_backup',
    title: 'Import backup',
    description:
      'Import previously staged backup data for the selected categories. Endpoint: /api/backup/import.',
    inputSchema: categoryShape,
    handler: (client, args) => {
      const params: Record<string, any> = {};
      if (args.locations !== undefined) params.locations = args.locations;
      if (args.plants !== undefined) params.plants = args.plants;
      if (args.gallery !== undefined) params.gallery = args.gallery;
      if (args.tasks !== undefined) params.tasks = args.tasks;
      if (args.inventory !== undefined) params.inventory = args.inventory;
      if (args.calendar !== undefined) params.calendar = args.calendar;
      return client.request('backup/import', params);
    },
  }),
];
