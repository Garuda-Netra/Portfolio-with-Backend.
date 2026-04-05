function normalizeApiBaseUrl(raw?: string): string {
	// In production, requests already include /api in call sites.
	// Returning empty base prevents /api/api double-prefixes.
	if (import.meta.env.PROD) {
		return '';
	}

	const fallback = 'http://localhost:5000';
	// In dev, use VITE_API_BASE_URL if provided, otherwise fallback to localhost:5000
	const value = (raw ?? fallback).trim();
	const withoutTrailingSlash = value.replace(/\/+$/, '');
	return withoutTrailingSlash.replace(/\/api$/i, '');
}

export const API_BASE_URL: string = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
