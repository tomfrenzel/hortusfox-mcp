import { z } from 'zod';
import { defineTool, type ToolDef } from './types.js';

/**
 * Chat domain: fetch messages and post a message to the workspace chat.
 * Mirrors the `/api/chat/*` endpoints.
 */
export const chatTools: ToolDef[] = [
  defineTool({
    name: 'hortusfox_fetch_chat',
    title: 'Fetch chat messages',
    description: 'Fetch recent workspace chat messages. Endpoint: /api/chat/fetch.',
    inputSchema: {
      limit: z.number().int().optional().describe('Maximum messages to return (default 50).'),
    },
    handler: (client, args) => {
      const params: Record<string, any> = {};
      if (args.limit !== undefined) params.limit = args.limit;
      return client.request('chat/fetch', params);
    },
  }),

  defineTool({
    name: 'hortusfox_add_chat_message',
    title: 'Post chat message',
    description:
      'Post a message to the workspace chat (sent via the API/bot identity). Endpoint: /api/chat/message/add.',
    inputSchema: {
      message: z.string().describe('The chat message text.'),
    },
    handler: (client, args) => client.request('chat/message/add', { message: args.message }),
  }),
];
