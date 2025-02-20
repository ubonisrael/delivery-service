import axios from "axios";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const Axios = axios.create({
  baseURL: import.meta.env.PROD ? "/api" : "http://localhost:3000/api",
  withCredentials: true, // Allow sending cookies
});
