import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { HortusFoxConfig } from './config.js';
import { HortusFoxClient, HortusFoxError } from './client.js';
import { allTools } from './tools/index.js';

const SERVER_NAME = 'hortusfox-mcp';
const SERVER_VERSION = '1.0.0';

/**
 * Build a fully-configured MCP server instance with every HortusFox tool
 * registered. The server communicates over whichever transport the caller
 * connects (stdio in this package).
 */
export function createServer(config: HortusFoxConfig): McpServer {
  const client = new HortusFoxClient(config);

  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  for (const tool of allTools) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema as z.ZodRawShape,
      },
      async (args: Record<string, unknown>) => {
        try {
          const result = await tool.handler(client, args as never);
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (err) {
          const message =
            err instanceof HortusFoxError
              ? err.message
              : err instanceof Error
                ? err.message
                : String(err);
          return {
            isError: true,
            content: [
              {
                type: 'text' as const,
                text: message,
              },
            ],
          };
        }
      }
    );
  }

  return server;
}

export { SERVER_NAME, SERVER_VERSION };
