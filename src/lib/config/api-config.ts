// Possible Base URL's
export const API_URLS = {
    development: 'http://localhost:3000/api', // Use local Next.js API routes
    production: 'https://axisapp.biz/api',
    test: 'https://staging.axisapp.biz/api',
};

// Current environment
export const NODE_ENV = process.env.NODE_ENV || 'development';

// Base URL
export const API_BASE_URL = process.env.BACKEND_API_URL || API_URLS[NODE_ENV];

// Default request timeout
export const REQUEST_TIMEOUT = 30000; // 30 seconds