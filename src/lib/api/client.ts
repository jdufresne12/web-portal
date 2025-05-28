import { API_BASE_URL } from '../config/api-config';

interface FetchOptions {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    credentials?: RequestCredentials;
}

/**
 * Centralized API client for making HTTP requests to the backend API.
 * 
 * This function handles common API interaction patterns including:
 * - Automatic content-type headers
 * - Cookie-based authentication
 * - JSON parsing of responses
 * - Error handling and authentication redirection
 * 
 * @template T The expected return type from the API response
 * @param {string} endpoint - The API endpoint to call (without the base URL)
 * @param {FetchOptions} options - Request configuration options
 * @param {string} [options.method='GET'] - HTTP method to use
 * @param {Record<string, string>} [options.headers={}] - Additional request headers
 * @param {any} [options.body] - Request body (will be JSON-stringified)
 * @param {RequestCredentials} [options.credentials='include'] - Credentials mode for cookie handling
 * 
 * @returns {Promise<T>} A promise that resolves to the typed API response
 * 
 * @throws {Error} Throws an error if the request fails or returns a non-2xx status
 * 
 * @example
 * // Basic GET request
 * const data = await apiClient<User[]>('/users');
 * 
 * @example
 * // POST request with body
 * const newUser = await apiClient<User>('/users', {
 *   method: 'POST',
 *   body: { name: 'John', email: 'john@example.com' }
 * });
 */
export async function apiClient<T>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<T> {
    const {
        method = 'GET',
        headers = {},
        body,
        credentials = 'include'
    } = options;

    const url = `${API_BASE_URL}${endpoint}`;

    const requestOptions: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        credentials,
        ...(body && { body: JSON.stringify(body) }),
    };

    try {
        const response = await fetch(url, requestOptions);

        // Handle authentication errors
        if (response.status === 401) {
            if (typeof window !== 'undefined') {
                document.cookie = "isAuthenticated=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                window.location.href = '/login';
            }
            throw new Error('Authentication failed');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}