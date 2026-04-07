import { prisma } from "../config/database";
import { hashPassword, comparePassword } from "../utils/bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { validateEmail, validatePassword } from "../utils/validators";
import { AppError } from "../middlewares/error.middleware";

const REFRESH_EXPIRE = 7 * 24 * 60 * 60 * 1000;

// ✅ REGISTER
export const registerService = async (data: {
  email: string;
  password: string;
  name?: string;
}) => {
  const { email, password, name } = data;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  if (!validateEmail(email)) {
    throw new AppError("Invalid email format", 400);
  }

  if (!validatePassword(password)) {
    throw new AppError("Weak password", 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError("Email already registered", 400);
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || null,
      isVerified: true,
    },
  });

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
  });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_EXPIRE),
    },
  });

  return { user, accessToken, refreshToken };
};

// ✅ LOGIN
export const loginService = async (data: {
  email: string;
  password: string;
}) => {
  const { email, password } = data;

  // ✅ validasi input
  if (!email?.trim() || !password?.trim()) {
    throw new AppError("Email and password are required", 400);
  }

  // ✅ cari user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // ✅ dummy hash untuk anti timing attack
  const fakeHash = "$2b$10$abcdefghijklmnopqrstuv";

  const isValid = await comparePassword(password, user?.password || fakeHash);

  if (!user || !isValid) {
    throw new AppError("Invalid email or password", 401);
  }

  // ✅ generate token (parallel biar cepat)
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken({
      userId: user.id,
      email: user.email,
    }),
    generateRefreshToken({
      userId: user.id,
      email: user.email,
    }),
  ]);

  // ✅ hapus token lama (biar tidak numpuk)
  await prisma.refreshToken.deleteMany({
    where: { userId: user.id },
  });

  // ✅ simpan refresh token baru
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_EXPIRE),
    },
  });

  return {
    accessToken,
    refreshToken,
  };
};

// ✅ REFRESH TOKEN
export const refreshTokenService = async (token: string) => {
  if (!token) {
    throw new AppError("Refresh token required", 400);
  }

  // verify signature
  const decoded = verifyRefreshToken(token);

  // cek ke DB
  const stored = await prisma.refreshToken.findFirst({
    where: {
      token,
      revoked: false,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!stored) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  // generate new tokens
  const newAccessToken = generateAccessToken({
    userId: stored.user.id,
    email: stored.user.email,
  });

  const newRefreshToken = generateRefreshToken({
    userId: stored.user.id,
    email: stored.user.email,
  });

  // revoke lama
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revoked: true },
  });

  // simpan baru
  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: stored.user.id,
      expiresAt: new Date(Date.now() + REFRESH_EXPIRE),
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

// ✅ LOGOUT
export const logoutService = async (userId: string, token?: string) => {
  if (token) {
    // logout 1 device
    await prisma.refreshToken.updateMany({
      where: { token, userId },
      data: { revoked: true },
    });
  } else {
    // logout semua device
    await prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }

  return true;
};

export const getCurrentUserService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      // Jangan include password!
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};
