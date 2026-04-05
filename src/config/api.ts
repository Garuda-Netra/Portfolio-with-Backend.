function normalizeApiBaseUrl(raw?: string): string {
	// In production, call sites already include /api where needed.
	// Returning empty base avoids accidental /api/api URLs.
	if (import.meta.env.PROD) {
		return '';
	}

	const fallback = 'http://localhost:5000';
	const value = (raw ?? fallback).trim();
	const withoutTrailingSlash = value.replace(/\/+$/, '');
	return withoutTrailingSlash.replace(/\/api$/i, '');
}

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
