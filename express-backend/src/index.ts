import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.route";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();

// Konfigurasi CORS
const corsOptions = {
  origin: [
    "http://localhost",
    "http://localhost:80",
    "http://localhost:5173", // Untuk development Vite
    "http://localhost:8000", // Backend sendiri
    process.env.CORS_ORIGIN || "*", // Bisa dari environment variable
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true, // Izinkan cookies/auth headers
  optionsSuccessStatus: 200,
};

// Middlewares
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ✅ TAMBAHKAN HEALTH CHECK ENDPOINT DI SINI
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// ✅ TAMBAHKAN ROOT ENDPOINT (opsional)
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend API is running",
    endpoints: {
      health: "/health",
      auth: "/api/v1/auth",
      register: "/api/v1/auth/register",
      login: "/api/v1/auth/login",
    },
  });
});

// Routes
app.use("/api/v1/auth", authRoutes);

// 404 handler (ini harus setelah semua route)
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler (paling bawah)
app.use(errorHandler);

export default app;
