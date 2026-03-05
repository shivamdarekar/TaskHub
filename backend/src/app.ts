import app from "./index"
import dotenv from "dotenv";
import { connectRedis, disconnectRedis } from "./config/redis";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Backend is running");
});

// Initialize Redis and start server
const startServer = async () => {
    try {
        // Connect to Redis
        await connectRedis();
        
        // Start Express server
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });

        // Graceful shutdown handlers
        const gracefulShutdown = async (signal: string) => {
            console.log(`\n${signal} received, closing server gracefully...`);
            
            server.close(async () => {
                console.log('✅ HTTP server closed');
                await disconnectRedis();
                console.log('✅ Graceful shutdown complete');
                process.exit(0);
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                console.error('⚠️  Forcing shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
