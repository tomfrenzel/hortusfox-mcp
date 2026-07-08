import { z } from 'zod';
import { defineTool, type ToolDef } from './types.js';

/**
 * Tasks domain: task CRUD including optional recurrence and plant association.
 * Mirrors the `/api/tasks/*` endpoints.
 */
export const tasksTools: ToolDef[] = [
  defineTool({
    name: 'hortusfox_fetch_tasks',
    title: 'Fetch tasks',
    description:
      'Fetch tasks, optionally including completed ones. Endpoint: /api/tasks/fetch.',
    inputSchema: {
      done: z
        .boolean()
        .optional()
        .describe('If true, include done/completed tasks. Default false.'),
      limit: z.number().int().optional().describe('Maximum tasks to return (default 100).'),
    },
    handler: (client, args) => {
      const params: Record<string, any> = {};
      if (args.done !== undefined) params.done = args.done;
      if (args.limit !== undefined) params.limit = args.limit;
      return client.request('tasks/fetch', params);
    },
  }),

  defineTool({
    name: 'hortusfox_add_task',
    title: 'Add task',
    description:
      'Create a task. Supports an optional due date, recurrence, and association with a plant. Returns the new task ID. Endpoint: /api/tasks/add.',
    inputSchema: {
      title: z.string().describe('Task title.'),
      description: z.string().optional().describe('Optional task description.'),
      due_date: z
        .string()
        .optional()
        .describe('Optional due date (e.g. YYYY-MM-DD).'),
      recurring_time: z
        .number()
        .int()
        .optional()
        .describe('Recurrence interval count. Requires a due_date to take effect.'),
      recurring_scope: z
        .string()
        .optional()
        .describe('Recurrence scope/unit (e.g. day, week, month) as accepted by HortusFox.'),
      plant: z
        .union([z.string(), z.number()])
        .optional()
        .describe('Optional plant ID to associate the task with.'),
    },
    handler: (client, args) =>
      client.request('tasks/add', {
        title: args.title,
        description: args.description,
        due_date: args.due_date,
        recurring_time: args.recurring_time,
        recurring_scope: args.recurring_scope,
        plant: args.plant,
      }),
  }),

  defineTool({
    name: 'hortusfox_edit_task',
    title: 'Edit task',
    description:
      'Edit an existing task by ID, including toggling its done state. Endpoint: /api/tasks/edit.',
    inputSchema: {
      task: z.union([z.string(), z.number()]).describe('The task ID to edit.'),
      title: z.string().optional().describe('Updated title.'),
      description: z.string().optional().describe('Updated description.'),
      due_date: z.string().optional().describe('Updated due date (e.g. YYYY-MM-DD).'),
      recurring_time: z.number().int().optional().describe('Updated recurrence interval count.'),
      recurring_scope: z.string().optional().describe('Updated recurrence scope/unit.'),
      done: z
        .boolean()
        .optional()
        .describe('Set the task done/completed state.'),
    },
    handler: (client, args) =>
      client.request('tasks/edit', {
        task: args.task,
        title: args.title,
        description: args.description,
        due_date: args.due_date,
        recurring_time: args.recurring_time,
        recurring_scope: args.recurring_scope,
        done: args.done,
      }),
  }),

  defineTool({
    name: 'hortusfox_remove_task',
    title: 'Remove task',
    description: 'Remove a task by ID. Endpoint: /api/tasks/remove.',
    inputSchema: {
      task: z.union([z.string(), z.number()]).describe('The task ID to remove.'),
    },
    handler: (client, args) => client.request('tasks/remove', { task: args.task }),
  }),
];
