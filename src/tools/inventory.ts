import { z } from 'zod';
import { defineTool, type ToolDef } from './types.js';

/**
 * Inventory domain: inventory item CRUD plus amount increment/decrement.
 * Mirrors the `/api/inventory/*` endpoints.
 */
export const inventoryTools: ToolDef[] = [
  defineTool({
    name: 'hortusfox_fetch_inventory',
    title: 'Fetch inventory',
    description: 'Fetch the full inventory list. Endpoint: /api/inventory/fetch.',
    inputSchema: {},
    handler: (client) => client.request('inventory/fetch'),
  }),

  defineTool({
    name: 'hortusfox_add_inventory_item',
    title: 'Add inventory item',
    description:
      'Add a new inventory item. Returns the new item ID. Endpoint: /api/inventory/add.',
    inputSchema: {
      name: z.string().describe('Item name.'),
      description: z.string().optional().describe('Optional item description.'),
      tags: z.string().optional().describe('Optional comma-separated tags.'),
      location: z
        .union([z.string(), z.number()])
        .optional()
        .describe('Optional location ID for the item.'),
      amount: z
        .union([z.string(), z.number()])
        .optional()
        .describe('Optional current amount/quantity.'),
      group: z
        .union([z.string(), z.number()])
        .optional()
        .describe('Optional inventory group ID.'),
      photo: z.string().optional().describe('Optional photo URL.'),
    },
    handler: (client, args) => {
      const params: Record<string, any> = {
        name: args.name,
      };
      if (args.description !== undefined) params.description = args.description;
      if (args.tags !== undefined) params.tags = args.tags;
      if (args.location !== undefined) params.location = args.location;
      if (args.amount !== undefined) params.amount = args.amount;
      if (args.group !== undefined) params.group = args.group;
      if (args.photo !== undefined) params.photo = args.photo;
      return client.request('inventory/add', params);
    },
  }),

  defineTool({
    name: 'hortusfox_edit_inventory_item',
    title: 'Edit inventory item',
    description: 'Edit an existing inventory item by ID. Endpoint: /api/inventory/edit.',
    inputSchema: {
      item: z.union([z.string(), z.number()]).describe('The inventory item ID to edit.'),
      name: z.string().optional().describe('Updated name.'),
      description: z.string().optional().describe('Updated description.'),
      tags: z.string().optional().describe('Updated comma-separated tags.'),
      location: z.union([z.string(), z.number()]).optional().describe('Updated location ID.'),
      amount: z.union([z.string(), z.number()]).optional().describe('Updated amount/quantity.'),
      group: z.union([z.string(), z.number()]).optional().describe('Updated inventory group ID.'),
      photo: z.string().optional().describe('Updated photo URL.'),
    },
    handler: (client, args) => {
      const params: Record<string, any> = {
        item: args.item,
      };
      if (args.name !== undefined) params.name = args.name;
      if (args.description !== undefined) params.description = args.description;
      if (args.tags !== undefined) params.tags = args.tags;
      if (args.location !== undefined) params.location = args.location;
      if (args.amount !== undefined) params.amount = args.amount;
      if (args.group !== undefined) params.group = args.group;
      if (args.photo !== undefined) params.photo = args.photo;
      return client.request('inventory/edit', params);
    },
  }),

  defineTool({
    name: 'hortusfox_increment_inventory_item',
    title: 'Increment inventory amount',
    description:
      'Increment the amount of an inventory item by one. Returns the new amount. Endpoint: /api/inventory/amount/inc.',
    inputSchema: {
      item: z.union([z.string(), z.number()]).describe('The inventory item ID.'),
    },
    handler: (client, args) => client.request('inventory/amount/inc', { item: args.item }),
  }),

  defineTool({
    name: 'hortusfox_decrement_inventory_item',
    title: 'Decrement inventory amount',
    description:
      'Decrement the amount of an inventory item by one. Returns the new amount. Endpoint: /api/inventory/amount/dec.',
    inputSchema: {
      item: z.union([z.string(), z.number()]).describe('The inventory item ID.'),
    },
    handler: (client, args) => client.request('inventory/amount/dec', { item: args.item }),
  }),

  defineTool({
    name: 'hortusfox_remove_inventory_item',
    title: 'Remove inventory item',
    description: 'Remove an inventory item by ID. Endpoint: /api/inventory/remove.',
    inputSchema: {
      item: z.union([z.string(), z.number()]).describe('The inventory item ID to remove.'),
    },
    handler: (client, args) => client.request('inventory/remove', { item: args.item }),
  }),
];
