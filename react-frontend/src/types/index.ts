import type { ReactNode, ElementType, ChangeEvent, MouseEvent } from "react";

// ... existing code ...

// Auth types untuk backend integration
export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
}

export type LoginResponse = ApiResponse<LoginResponseData>;

export interface RegisterResponseData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export type RegisterResponse = ApiResponse<RegisterResponseData>;

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// Update UseAuthReturn type
export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshToken: () => Promise<boolean>;
}
// User types
export interface User {
  id: string | number;
  name: string;
  email: string;
  avatar?: string;
  role?: "user" | "admin";
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
// Text
export interface TextProps {
  children: ReactNode;
  variant?: "body" | "small" | "caption" | "error" | "success";
  className?: string;
  as?: ElementType;
}

// Button
export interface ButtonProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "warning"
    | "outline"
    | "ghost";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

// Input
export interface InputProps {
  label?: string;
  type?: string;
  value?: string | number;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  className?: string;
}

// Heading
export interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string;
}

// spinner
export type SpinnerSize = "sm" | "md" | "lg";
export type SpinnerColor = "blue" | "white" | "gray";

export interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
}
export interface CardProps {
  title: string;
  description: string;
  image?: string;
  onAction?: () => void;
  actionText?: string;
  footer?: React.ReactNode;
}

export interface NavbarProps {
  onSearch?: (query: string) => void;
  user?: User | null;
  onLogout: () => void;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
}

// main layout
export interface MainLayoutProps {
  children: ReactNode;
  onSearch?: (query: string) => void;
  user?: User | null;
  onLogout?: () => void;
}

// Auth Layout
export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

export interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
