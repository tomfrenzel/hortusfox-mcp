import { z } from 'zod';
import { defineTool, type ToolDef } from './types.js';

/**
 * Calendar domain: calendar entry CRUD with date ranges and classes.
 * Mirrors the `/api/calendar/*` endpoints.
 */
export const calendarTools: ToolDef[] = [
  defineTool({
    name: 'hortusfox_fetch_calendar',
    title: 'Fetch calendar entries',
    description:
      'Fetch calendar entries within a date range. Defaults to today through the next 30 days when omitted. Endpoint: /api/calendar/fetch.',
    inputSchema: {
      date_from: z
        .string()
        .optional()
        .describe('Start date (YYYY-MM-DD). Defaults to today.'),
      date_till: z
        .string()
        .optional()
        .describe('End date (YYYY-MM-DD). Defaults to 30 days from today.'),
    },
    handler: (client, args) =>
      client.request('calendar/fetch', {
        date_from: args.date_from,
        date_till: args.date_till,
      }),
  }),

  defineTool({
    name: 'hortusfox_add_calendar_entry',
    title: 'Add calendar entry',
    description:
      'Add a calendar entry with a name, start date and optional end date and class. Returns the new item ID. Endpoint: /api/calendar/add.',
    inputSchema: {
      name: z.string().describe('Entry name/title.'),
      date_from: z.string().describe('Start date (YYYY-MM-DD).'),
      date_till: z
        .string()
        .optional()
        .describe('End date (YYYY-MM-DD). Defaults to the day after date_from.'),
      class: z
        .union([z.string(), z.number()])
        .optional()
        .describe('Optional calendar class identifier.'),
    },
    handler: (client, args) =>
      client.request('calendar/add', {
        name: args.name,
        date_from: args.date_from,
        date_till: args.date_till,
        class: args.class,
      }),
  }),

  defineTool({
    name: 'hortusfox_edit_calendar_entry',
    title: 'Edit calendar entry',
    description: 'Edit an existing calendar entry by its identifier. Endpoint: /api/calendar/edit.',
    inputSchema: {
      ident: z.union([z.string(), z.number()]).describe('The calendar entry identifier.'),
      name: z.string().optional().describe('Updated name/title.'),
      date_from: z.string().describe('Start date (YYYY-MM-DD).'),
      date_till: z
        .string()
        .optional()
        .describe('End date (YYYY-MM-DD). Defaults to the day after date_from.'),
      class: z
        .union([z.string(), z.number()])
        .optional()
        .describe('Optional calendar class identifier.'),
    },
    handler: (client, args) =>
      client.request('calendar/edit', {
        ident: args.ident,
        name: args.name,
        date_from: args.date_from,
        date_till: args.date_till,
        class: args.class,
      }),
  }),

  defineTool({
    name: 'hortusfox_remove_calendar_entry',
    title: 'Remove calendar entry',
    description: 'Remove a calendar entry by its identifier. Endpoint: /api/calendar/remove.',
    inputSchema: {
      ident: z.union([z.string(), z.number()]).describe('The calendar entry identifier to remove.'),
    },
    handler: (client, args) => client.request('calendar/remove', { ident: args.ident }),
  }),
];
