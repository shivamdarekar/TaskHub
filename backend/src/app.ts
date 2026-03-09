import app from "./index";
import dotenv from "dotenv";
import { redis, connectRedis, disconnectRedis } from "./config/redis";
import prisma from "./config/prisma";
import { getTransporter } from "./services/email.service";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Backend is running");
});

// ── Service initializers ───────────────────────────────────────────────────

const connectDatabase = async (): Promise<void> => {
  await prisma.$connect();
};

const connectEmail = async (): Promise<void> => {
  // getTransporter now automatically verifies the connection
  await getTransporter();
};

const checkRazorpay = (): void => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing");
  }
};

// ── Server startup ─────────────────────────────────────────────────────────

const startServer = async () => {
  try {
    // Parallel initialization — all services start at the same time
    const [dbResult, redisResult, emailResult, razorpayResult] =
      await Promise.allSettled([
        connectDatabase(),
        connectRedis(),
        connectEmail(),
        Promise.resolve(checkRazorpay()),
      ]);

    // ── Database (REQUIRED — exit if down) ────────────────────────────
    if (dbResult.status === "fulfilled") {
      console.log("✅ Database connected (Neon PostgreSQL)");
    } else {
      console.error("❌ Database connection failed:", dbResult.reason);
      process.exit(1);
    }

    // ── Redis (OPTIONAL — run without cache if down) ──────────────────
    if (redisResult.status === "fulfilled") {
      console.log("✅ Redis connected — caching enabled");
    } else {
      console.warn("⚠️  Redis connection failed — running without cache");
    }

    // ── Email (OPTIONAL — warn but continue) ──────────────────────────
    if (emailResult.status === "fulfilled") {
      const emailProvider = process.env.BREVO_API_KEY 
        ? "Brevo" 
        : process.env.RESEND_API_KEY 
        ? "Resend" 
        : process.env.NODE_ENV === "production" 
        ? "SMTP" 
        : "Ethereal (dev)";
      console.log(`✅ Email service ready (${emailProvider})`);
    } else {
      console.warn("⚠️  Email service failed — email features will not work");
    }

    // ── Razorpay (OPTIONAL — warn but continue) ───────────────────────
    if (razorpayResult.status === "fulfilled") {
      console.log("✅ Razorpay configured");
    } else {
      console.warn("⚠️  Razorpay not configured — payment features disabled");
    }

    // ── Start Express server ───────────────────────────────────────────
    const BASE_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;

    const server = app.listen(PORT, () => {
      console.log(`
🚀 TaskHub Backend
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Environment : ${process.env.NODE_ENV || "development"}
🔗 Server      : ${BASE_URL}
❤️  Health      : ${BASE_URL}/
📚 API Base    : ${BASE_URL}/api/v1
🔴 Redis       : ${redis.isOpen ? "Connected" : "Disabled"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            `);
    });

    // ── Graceful shutdown ──────────────────────────────────────────────
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log("🔌 HTTP server closed");
        await prisma.$disconnect();
        console.log("🗄️  Database disconnected");
        await disconnectRedis();
        console.log("✅ Graceful shutdown complete");
        process.exit(0);
      });

      setTimeout(() => {
        console.error("⚠️  Forcing shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
