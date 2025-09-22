import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { secureLogger } from "./logger.js";
const require = createRequire(import.meta.url);
const packageJson = require("../package.json");
const SERVER_NAME = "Proactive Workflow Assistant MCP";
export const createServer = () => {
    const server = new McpServer({
        name: SERVER_NAME,
        version: packageJson.version ?? "0.0.0",
    });
    return server;
};
export const connectServer = async (server, transport) => {
    await server.connect(transport);
    secureLogger.info("server_started", {
        transport: "stdio",
        server: SERVER_NAME,
        version: packageJson.version,
    });
};
