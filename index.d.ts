import { Application, RequestHandler } from "express";

export interface AuthUser {
  id?: string | number;
  username?: string;
  role?: string;
  [key: string]: any; // untuk payload JWT atau OAuth custom fields
}

// ========================
// JWT
// ========================
export interface JwtFunction extends RequestHandler {
  (config?: { secret: string }): RequestHandler;
  sign(payload: any, secret: string, options?: any): string;
  withRole(roles?: string[]): RequestHandler;
  refresh(refreshToken: string, secret: string, options?: any): string;
}

export const jwt: JwtFunction;


export interface BasicConfig {
  users?: Record<string, string>;
}

export function basic(config?: BasicConfig): RequestHandler;


export interface ApiKeyConfig {
  keyHeader?: string;
  keys?: string[];
  checkInDB?: (key: string) => Promise<boolean>;
}

export function apikey(config?: ApiKeyConfig): RequestHandler;


export interface OAuthProviderConfig {
  provider: "google" | "github" | "facebook" | "discord" | string;
  clientId: string;
  clientSecret: string;
  callbackURL: string;
  mode?: "jwt" | "session";
  jwtSecret?: string;
  jwtExpiresIn?: string | number;
}

export interface OAuth2 {
  oauth(providers: OAuthProviderConfig | OAuthProviderConfig[]): void;
  init(app: Application): void;
  login(providerName: string): RequestHandler;
  callback(providerName: string): RequestHandler | RequestHandler[];
  passport: any;
}

export const oauth2: OAuth2;


export interface RouteConfig {
  type?: "jwt" | "basic" | "apikey" | "oauth";
  method: keyof Pick<
    Application,
    "get" | "post" | "put" | "delete" | "patch" | "all"
  >;
  path: string;
  config?: any;
  handler?: RequestHandler;
}

export function applyAuth(app: Application, routes: RouteConfig[]): void;

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}
