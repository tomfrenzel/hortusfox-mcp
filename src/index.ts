#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig } from './config.js';
import { createServer, SERVER_NAME, SERVER_VERSION } from './server.js';

/**
 * Entry point: load configuration from the environment, build the MCP server
 * and connect it over stdio. All diagnostic logging goes to stderr so it does
 * not interfere with the JSON-RPC protocol on stdout.
 */
async function main(): Promise<void> {
  let config;
  try {
    config = loadConfig();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`[${SERVER_NAME}] Configuration error: ${message}\n`);
    process.exit(1);
    return;
  }

  const server = createServer(config);
  const transport = new StdioServerTransport();

  await server.connect(transport);

  process.stderr.write(
    `[${SERVER_NAME}] v${SERVER_VERSION} connected via stdio (target: ${config.baseUrl})\n`
  );
}

main().catch((err) => {
  const message = err instanceof Error ? err.stack ?? err.message : String(err);
  process.stderr.write(`[${SERVER_NAME}] Fatal error: ${message}\n`);
  process.exit(1);
});
