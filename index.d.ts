import { Application, RequestHandler } from "express";

export function jwt(config?: any): RequestHandler;
export function basic(config?: any): RequestHandler;
export function apikey(config?: any): RequestHandler;
export const oauth2: {
  login(provider: string): RequestHandler;
  callback(provider: string): RequestHandler;
};

export function applyAuth(app: Application, routes: any[]): void;