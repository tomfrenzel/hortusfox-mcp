import type { ZodRawShape, infer as ZodInfer, ZodObject } from 'zod';
import type { HortusFoxClient, HortusFoxResponse } from '../client.js';

/**
 * Declarative definition of a single MCP tool that maps to a HortusFox API
 * endpoint. `inputSchema` is a Zod raw shape (object of Zod validators) as
 * expected by the MCP SDK's registerTool.
 */
export interface ToolDef<Shape extends ZodRawShape = ZodRawShape> {
  name: string;
  title: string;
  description: string;
  inputSchema: Shape;
  handler: (client: HortusFoxClient, args: ArgsOf<Shape>) => Promise<HortusFoxResponse>;
}

export type ArgsOf<Shape extends ZodRawShape> = ZodInfer<ZodObject<Shape>>;

/**
 * Helper to define a tool with full type inference between the Zod input
 * schema and the handler arguments.
 */
export function defineTool<Shape extends ZodRawShape>(def: ToolDef<Shape>): ToolDef {
  return def as unknown as ToolDef;
}
