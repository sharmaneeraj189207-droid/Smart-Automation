import app from './app.js';
import { config } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { seedData } from './utils/seed.js';
import { checkAndEscalateOverdueWorkflows } from './workflows/slaManager.js';

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Seed initial admin/manager/rules/departments if fresh database
    await seedData();

    // 3. Start background SLA checker (runs every 5 minutes)
    const SLA_CHECK_INTERVAL_MS = 5 * 60 * 1000;
    setInterval(async () => {
      try {
        await checkAndEscalateOverdueWorkflows();
      } catch (slaErr) {
        console.warn('[SLA Watcher] Error checking overdue workflows:', slaErr.message);
      }
    }, SLA_CHECK_INTERVAL_MS);

    // 4. Start HTTP Server
    const server = app.listen(config.port, () => {
      console.log(`
============================================================
🚀 FlowPilot AI Backend Server Running!
------------------------------------------------------------
Port:             ${config.port}
Environment:      ${config.nodeEnv}
Database:         MongoDB Connected
Gemini AI Engine: ${config.geminiApiKey ? 'Configured & Active' : 'Intelligent Local Fallback Mode'}
API Documentation: http://localhost:${config.port}/api/health
============================================================
      `);
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        console.log('[Server] Process terminated cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('[Server Error] Critical startup failure:', error);
    process.exit(1);
  }
};

startServer();
