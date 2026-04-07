import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "../config/index";

interface TokenPayload {
  userId: string;
  email: string;
}

export const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, config.jwt.secret as string, {
    expiresIn: config.jwt.expiresIn as SignOptions["expiresIn"],
  });
};

export const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, config.jwt.refreshSecret as string, {
    expiresIn: config.jwt.refreshExpiresIn as SignOptions["expiresIn"],
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.secret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
};
