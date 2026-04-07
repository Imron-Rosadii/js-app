import { Request, Response } from "express";
import {
  registerService,
  loginService,
  refreshTokenService,
  logoutService,
  getCurrentUserService,
} from "../services/auth.service";
import { AuthRequest } from "../middlewares/auth.middleware";

// REGISTER
export const register = async (req: Request, res: Response) => {
  const result = await registerService(req.body);

  res.status(201).json({
    success: true,
    message: "User registered",
    data: result,
  });
};

// LOGIN
export const login = async (req: Request, res: Response) => {
  const result = await loginService(req.body);

  res.json({
    success: true,
    message: "Login success",
    data: result,
  });
};

// REFRESH TOKEN
export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const result = await refreshTokenService(refreshToken);

  res.json({
    success: true,
    data: result,
  });
};

// LOGOUT
export const logout = async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body;
  const userId = req.user!.userId;

  await logoutService(userId, refreshToken);

  res.json({
    success: true,
    message: "Logout success",
  });
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  const user = await getCurrentUserService(userId);

  res.json({
    success: true,
    message: "User retrieved successfully",
    data: user,
  });
};
