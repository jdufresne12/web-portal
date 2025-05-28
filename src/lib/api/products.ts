import { apiClient } from './client';
import { ProductDTO, UserLevelDTO } from '@/src/app/types/form-types';

/**
 * API endpoints related to products and user levels
 * These endpoints are used to interact with the product-related features of the backend
 */
const ENDPOINTS = {
    ALL_REDEEM_PRODUCTS: '/products',
    ALL_STAR_PRODUCTS_BY_LEVEL: (id: string) => `/products/user-level/${id}`,
    ALL_USER_LEVELS: '/user-levels',
    PRODUCT: '/product',
    DELETE_PRODUCT: (id: string) => `/product/${id}`,
};

/**
 * Product API service
 * Provides methods to interact with product-related endpoints
 * Authentication is handled automatically via HTTP-only cookies
 */
export const productApi = {
    getAllRedeem: async () => {
        return apiClient<ProductDTO[]>(ENDPOINTS.ALL_REDEEM_PRODUCTS);
    },

    getAllStarByLevel: async (id: string) => {
        return apiClient<ProductDTO[]>(ENDPOINTS.ALL_STAR_PRODUCTS_BY_LEVEL(id));
    },

    getAllUserLevels: async () => {
        return apiClient<UserLevelDTO[]>(ENDPOINTS.ALL_USER_LEVELS);
    },

    createOrUpdate: async (product: ProductDTO) => {
        return apiClient<ProductDTO>(ENDPOINTS.PRODUCT, {
            method: 'PUT',
            body: JSON.stringify(product),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    },

    deleteProduct: async (id: string) => {
        return apiClient<void>(ENDPOINTS.DELETE_PRODUCT(id), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    },
};