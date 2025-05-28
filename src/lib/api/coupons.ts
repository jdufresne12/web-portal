import { apiClient } from './client';
import { CouponDTO } from '@/src/app/types/form-types';

/**
 * API endpoints related to coupon table
 * These endpoints are used to interact with the coupon-related features of the backend
 */
const ENDPOINTS = {
    ALL_SPONSORS_COUPONS: (id: string) => `/coupon/sponsor/${id}`,
    ALL_PRODUCTS_COUPONS: (id: string) => `/coupon/product/${id}`,
    ADD_UPDATE_COUPON: '/coupon',
    DELETE_COUPON: (id: string) => `/coupon/${id}`,
};

/**
 * Coupon API service
 * Provides methods to interact with coupon-related endpoints
 * Authentication is handled automatically via HTTP-only cookies
 */
export const couponApi = {
    getAllSponsor: async (id: string) => {
        return apiClient<CouponDTO[]>(ENDPOINTS.ALL_SPONSORS_COUPONS(id));
    },

    getAllProduct: async (id: string) => {
        return apiClient<CouponDTO[]>(ENDPOINTS.ALL_PRODUCTS_COUPONS(id));
    },

    createOrUpdate: async (sponsor: CouponDTO) => {
        return apiClient<CouponDTO>(ENDPOINTS.ADD_UPDATE_COUPON, {
            method: 'PUT',
            body: JSON.stringify(sponsor),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    },

    deleteCoupon: async (id: string) => {
        return apiClient<void>(ENDPOINTS.DELETE_COUPON(id), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    },


};