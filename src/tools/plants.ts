import { z } from 'zod';
import { defineTool, type ToolDef } from './types.js';

/**
 * Plants domain: plant CRUD, search, custom attributes, gallery photos and
 * per-plant activity log. Mirrors the `/api/plants/*` endpoints.
 */
export const plantsTools: ToolDef[] = [
  defineTool({
    name: 'hortusfox_get_plant',
    title: 'Get plant details',
    description:
      'Fetch full details of a single plant by its ID, including default fields and any custom attributes. Endpoint: /api/plants/get.',
    inputSchema: {
      plant: z.union([z.string(), z.number()]).describe('The plant ID to retrieve.'),
    },
    handler: (client, args) => client.request('plants/get', { plant: args.plant }),
  }),

  defineTool({
    name: 'hortusfox_add_plant',
    title: 'Add plant',
    description:
      'Create a new plant with a name and a location ID. Returns the new plant ID. Endpoint: /api/plants/add.',
    inputSchema: {
      name: z.string().describe('Display name of the plant.'),
      location: z
        .union([z.string(), z.number()])
        .describe('ID of the location the plant belongs to (see hortusfox_list_locations).'),
    },
    handler: (client, args) =>
      client.request('plants/add', { name: args.name, location: args.location }),
  }),

  defineTool({
    name: 'hortusfox_update_plant',
    title: 'Update plant attribute',
    description:
      'Update a single attribute of a plant by name (e.g. name, location, description, humidity, etc.). Endpoint: /api/plants/update.',
    inputSchema: {
      plant: z.union([z.string(), z.number()]).describe('The plant ID to update.'),
      attribute: z.string().describe('The attribute/field key to change.'),
      value: z
        .union([z.string(), z.number(), z.boolean()])
        .describe('The new value for the attribute.'),
    },
    handler: (client, args) =>
      client.request('plants/update', {
        plant: args.plant,
        attribute: args.attribute,
        value: args.value,
      }),
  }),

  defineTool({
    name: 'hortusfox_remove_plant',
    title: 'Remove plant',
    description: 'Delete a plant by its ID. Endpoint: /api/plants/remove.',
    inputSchema: {
      plant: z.union([z.string(), z.number()]).describe('The plant ID to remove.'),
    },
    handler: (client, args) => client.request('plants/remove', { plant: args.plant }),
  }),

  defineTool({
    name: 'hortusfox_list_plants',
    title: 'List plants',
    description:
      'List plants, optionally filtered by location, with paging and sorting. Endpoint: /api/plants/list.',
    inputSchema: {
      location: z
        .union([z.string(), z.number()])
        .optional()
        .describe('Optional location ID to filter plants by.'),
      limit: z.number().int().optional().describe('Maximum number of plants to return.'),
      from: z
        .number()
        .int()
        .optional()
        .describe('Offset: start returning plants from this index (for pagination).'),
      sort: z
        .string()
        .optional()
        .describe('Optional sort specifier (column/direction) as accepted by HortusFox.'),
    },
    handler: (client, args) =>
      client.request('plants/list', {
        location: args.location,
        limit: args.limit,
        from: args.from,
        sort: args.sort,
      }),
  }),

  defineTool({
    name: 'hortusfox_search_plants',
    title: 'Search plants',
    description:
      'Search plants by a free-text expression (matches name, location, attributes and more). Endpoint: /api/plants/search.',
    inputSchema: {
      expression: z.string().describe('The search expression.'),
      limit: z
        .number()
        .int()
        .optional()
        .describe('Optional result limit hint.'),
    },
    handler: (client, args) =>
      client.request('plants/search', { expression: args.expression, limit: args.limit }),
  }),

  defineTool({
    name: 'hortusfox_add_plant_attribute',
    title: 'Add custom plant attribute',
    description:
      'Add a custom attribute to a plant. Endpoint: /api/plants/attributes/add.',
    inputSchema: {
      plant: z.union([z.string(), z.number()]).describe('The plant ID.'),
      label: z.string().describe('Attribute label/name.'),
      datatype: z
        .string()
        .describe('Attribute data type (e.g. text, number, date, boolean) as defined in HortusFox.'),
      content: z
        .union([z.string(), z.number(), z.boolean()])
        .describe('Attribute value/content.'),
    },
    handler: (client, args) =>
      client.request('plants/attributes/add', {
        plant: args.plant,
        label: args.label,
        datatype: args.datatype,
        content: args.content,
      }),
  }),

  defineTool({
    name: 'hortusfox_edit_plant_attribute',
    title: 'Edit custom plant attribute',
    description:
      'Edit an existing custom attribute of a plant, identified by its label. Endpoint: /api/plants/attributes/edit.',
    inputSchema: {
      plant: z.union([z.string(), z.number()]).describe('The plant ID.'),
      label: z.string().describe('The existing attribute label to edit.'),
      datatype: z.string().describe('Attribute data type.'),
      content: z
        .union([z.string(), z.number(), z.boolean()])
        .describe('New attribute value/content.'),
    },
    handler: (client, args) =>
      client.request('plants/attributes/edit', {
        plant: args.plant,
        label: args.label,
        datatype: args.datatype,
        content: args.content,
      }),
  }),

  defineTool({
    name: 'hortusfox_remove_plant_attribute',
    title: 'Remove custom plant attribute',
    description:
      'Remove a custom attribute from a plant by its label. Endpoint: /api/plants/attributes/remove.',
    inputSchema: {
      plant: z.union([z.string(), z.number()]).describe('The plant ID.'),
      label: z.string().describe('The attribute label to remove.'),
    },
    handler: (client, args) =>
      client.request('plants/attributes/remove', { plant: args.plant, label: args.label }),
  }),

  defineTool({
    name: 'hortusfox_update_plant_photo',
    title: 'Update plant main photo',
    description:
      'Update the main preview photo of a plant. Set external=true and provide a photo URL to use an external image. Optionally move the current photo into the gallery first. Endpoint: /api/plants/photo/update.',
    inputSchema: {
      plant: z.union([z.string(), z.number()]).describe('The plant ID.'),
      external: z
        .boolean()
        .optional()
        .describe('If true, use an external photo URL (provide `photo`). Default false.'),
      photo: z
        .string()
        .optional()
        .describe('External photo URL (required when external=true).'),
      move_to_gallery: z
        .boolean()
        .optional()
        .describe('If true, move the existing main photo into the plant gallery before replacing.'),
    },
    handler: (client, args) =>
      client.request('plants/photo/update', {
        plant: args.plant,
        external: args.external,
        photo: args.photo,
        move_to_gallery: args.move_to_gallery,
      }),
  }),

  defineTool({
    name: 'hortusfox_list_plant_gallery',
    title: 'List plant gallery photos',
    description:
      'List all gallery photos for a plant. Endpoint: /api/plants/gallery/list.',
    inputSchema: {
      plant: z.union([z.string(), z.number()]).describe('The plant ID.'),
    },
    handler: (client, args) => client.request('plants/gallery/list', { plant: args.plant }),
  }),

  defineTool({
    name: 'hortusfox_add_plant_gallery_photo',
    title: 'Add plant gallery photo',
    description:
      'Add a photo to a plant gallery. Set external=true and provide a photo URL to add an external image. Endpoint: /api/plants/gallery/add.',
    inputSchema: {
      plant: z.union([z.string(), z.number()]).describe('The plant ID.'),
      label: z.string().optional().describe('Optional label/caption for the photo.'),
      external: z
        .boolean()
        .optional()
        .describe('If true, add an external photo URL (provide `photo`). Default false.'),
      photo: z
        .string()
        .optional()
        .describe('External photo URL (required when external=true).'),
    },
    handler: (client, args) =>
      client.request('plants/gallery/add', {
        plant: args.plant,
        label: args.label,
        external: args.external,
        photo: args.photo,
      }),
  }),

  defineTool({
    name: 'hortusfox_edit_plant_gallery_photo',
    title: 'Edit plant gallery photo label',
    description:
      'Edit the label of a gallery photo item. Endpoint: /api/plants/gallery/edit.',
    inputSchema: {
      plant: z.union([z.string(), z.number()]).describe('The plant ID.'),
      item: z.union([z.string(), z.number()]).describe('The gallery photo item ID.'),
      label: z.string().describe('The new label/caption.'),
    },
    handler: (client, args) =>
      client.request('plants/gallery/edit', {
        plant: args.plant,
        item: args.item,
        label: args.label,
      }),
  }),

  defineTool({
    name: 'hortusfox_remove_plant_gallery_photo',
    title: 'Remove plant gallery photo',
    description:
      'Remove a gallery photo by its item ID. Endpoint: /api/plants/gallery/remove.',
    inputSchema: {
      item: z.union([z.string(), z.number()]).describe('The gallery photo item ID to remove.'),
    },
    handler: (client, args) => client.request('plants/gallery/remove', { item: args.item }),
  }),

  defineTool({
    name: 'hortusfox_add_plant_log_entry',
    title: 'Add plant log entry',
    description:
      'Add a log/journal entry to a plant. Returns the new log entry ID. Endpoint: /api/plants/log/add.',
    inputSchema: {
      plant: z.union([z.string(), z.number()]).describe('The plant ID.'),
      content: z.string().describe('The log entry text.'),
    },
    handler: (client, args) =>
      client.request('plants/log/add', { plant: args.plant, content: args.content }),
  }),

  defineTool({
    name: 'hortusfox_edit_plant_log_entry',
    title: 'Edit plant log entry',
    description: 'Edit an existing plant log entry by its ID. Endpoint: /api/plants/log/edit.',
    inputSchema: {
      logid: z.union([z.string(), z.number()]).describe('The log entry ID.'),
      content: z.string().describe('The updated log entry text.'),
    },
    handler: (client, args) =>
      client.request('plants/log/edit', { logid: args.logid, content: args.content }),
  }),

  defineTool({
    name: 'hortusfox_remove_plant_log_entry',
    title: 'Remove plant log entry',
    description: 'Remove a plant log entry by its ID. Endpoint: /api/plants/log/remove.',
    inputSchema: {
      logid: z.union([z.string(), z.number()]).describe('The log entry ID to remove.'),
    },
    handler: (client, args) => client.request('plants/log/remove', { logid: args.logid }),
  }),

  defineTool({
    name: 'hortusfox_fetch_plant_log',
    title: 'Fetch plant log entries',
    description:
      'Fetch log entries for a plant, with optional pagination. Endpoint: /api/plants/log/fetch.',
    inputSchema: {
      plant: z.union([z.string(), z.number()]).describe('The plant ID.'),
      paginate: z
        .union([z.string(), z.number()])
        .optional()
        .describe('Optional pagination page/cursor.'),
      limit: z.number().int().optional().describe('Maximum entries to return (default 10).'),
    },
    handler: (client, args) =>
      client.request('plants/log/fetch', {
        plant: args.plant,
        paginate: args.paginate,
        limit: args.limit,
      }),
  }),
];
