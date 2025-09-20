import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { secureLogger } from "./logger.js";
import { registerPromptResources, registerPromptTools } from "./prompts/register.js";

const require = createRequire(import.meta.url);
const packageJson = require("../package.json") as { version?: string };

const SERVER_NAME = "Proactive Workflow Assistant MCP";

type ShutdownHandler = () => Promise<void>;

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

const registerShutdownHandlers = (shutdown: ShutdownHandler) => {
  let shuttingDown = false;

  const handleSignal = (signal: NodeJS.Signals) => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;

    secureLogger.warn("received_signal", { signal });
    shutdown()
      .then(() => {
        secureLogger.info("server_stop", { reason: signal });
        process.exit(0);
      })
      .catch((error) => {
        secureLogger.error("server_stop_error", { error, reason: signal });
        process.exit(1);
      });
  };

  process.on("SIGINT", handleSignal);
  process.on("SIGTERM", handleSignal);
};

const registerTopLevelErrorHandlers = (shutdown: ShutdownHandler) => {
  let shuttingDown = false;

  const handleFatal = async (event: "uncaught_exception" | "unhandled_rejection", payload: unknown) => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;

    secureLogger.error(event, { data: payload });
    try {
      await shutdown();
    } finally {
      process.exit(1);
    }
  };

  process.on("uncaughtException", (error) => {
    void handleFatal("uncaught_exception", error);
  });

  process.on("unhandledRejection", (reason) => {
    void handleFatal("unhandled_rejection", reason);
  });
};

async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();

  try {
    await registerPromptResources(server, secureLogger);
    await registerPromptTools(server, secureLogger);
    await connectServer(server, transport);
  } catch (error) {
    secureLogger.error("server_start_error", { error });
    await transport.close().catch(() => {
      /* ignore */
    });
    await server.close().catch(() => {
      /* ignore */
    });
    throw error;
  }

  const shutdown: ShutdownHandler = async () => {
    await server.close();
    await transport.close();
  };

  registerShutdownHandlers(shutdown);
  registerTopLevelErrorHandlers(shutdown);
}

main().catch((error) => {
  secureLogger.error("server_start_fatal", { error });
  process.exit(1);
});
