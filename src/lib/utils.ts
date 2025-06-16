import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return `₹${price.toFixed(0)}`
}

export function formatPriceWithUnit(price: number, unit: string): string {
  return `₹${price.toFixed(0)} ${unit}`
}
