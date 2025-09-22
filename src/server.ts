import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { secureLogger } from "./logger.js";

const require = createRequire(import.meta.url);
const packageJson = require("../package.json") as { version?: string };

const SERVER_NAME = "Proactive Workflow Assistant MCP";

export const createServer = () => {
  const server = new McpServer({
    name: SERVER_NAME,
    version: packageJson.version ?? "0.0.0",
  });
  return server;
};

export const connectServer = async (
  server: McpServer,
  transport: StdioServerTransport,
): Promise<void> => {
  await server.connect(transport);
  secureLogger.info("server_started", {
    transport: "stdio",
    server: SERVER_NAME,
    version: packageJson.version,
  });
};

