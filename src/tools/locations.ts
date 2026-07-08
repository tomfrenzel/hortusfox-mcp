import { z } from 'zod';
import { defineTool, type ToolDef } from './types.js';

/**
 * Locations domain: list locations and fetch a single location's info.
 * Mirrors the `/api/locations/*` endpoints.
 */
export const locationsTools: ToolDef[] = [
  defineTool({
    name: 'hortusfox_list_locations',
    title: 'List locations',
    description:
      'List locations, optionally including the plants at each location. Endpoint: /api/locations/list.',
    inputSchema: {
      only_active: z
        .boolean()
        .optional()
        .describe('If true, only return active locations. Default false.'),
      include_plants: z
        .boolean()
        .optional()
        .describe('If true, include a plant_count and plant_list for each location. Default false.'),
      include_info: z
        .string()
        .optional()
        .describe(
          "Which plant fields to include when include_plants is true (e.g. 'id', 'name'). Default 'id'."
        ),
      paginate: z
        .union([z.string(), z.number()])
        .optional()
        .describe('Optional pagination page/cursor.'),
      limit: z.number().int().optional().describe('Maximum locations to return.'),
    },
    handler: (client, args) =>
      client.request('locations/list', {
        only_active: args.only_active,
        include_plants: args.include_plants,
        include_info: args.include_info,
        paginate: args.paginate,
        limit: args.limit,
      }),
  }),

  defineTool({
    name: 'hortusfox_get_location',
    title: 'Get location info',
    description:
      'Fetch details of a single location by ID, optionally including its plants. Endpoint: /api/locations/info.',
    inputSchema: {
      location: z.union([z.string(), z.number()]).describe('The location ID.'),
      include_plants: z
        .boolean()
        .optional()
        .describe('If true, include the full list of plants at this location. Default false.'),
    },
    handler: (client, args) =>
      client.request('locations/info', {
        location: args.location,
        include_plants: args.include_plants,
      }),
  }),
];
