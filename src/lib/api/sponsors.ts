import { apiClient } from './client';
import { SponsorDTO } from '@/src/app/types/form-types';

/**
 * API endpoints related to sponsors
 * These endpoints are used to interact with the sponsor-related features of the backend
 */
const ENDPOINTS = {
    ALL_SPONSORS: '/sponsors',
    ADD_UPDATE_SPONSOR: '/sponsor',
    DELETE_SPONSOR: (id: string) => `/sponsor/${id}`,
};

/**
 * Sponsor API service
 * Provides methods to interact with sponsor-related endpoints
 * Authentication is handled automatically via HTTP-only cookies
 */
export const sponsorApi = {
    getAll: async () => {
        return apiClient<SponsorDTO[]>(ENDPOINTS.ALL_SPONSORS);
    },

    createOrUpdate: async (sponsor: SponsorDTO) => {
        return apiClient<SponsorDTO>(ENDPOINTS.ADD_UPDATE_SPONSOR, {
            method: 'PUT',
            body: JSON.stringify(sponsor),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    },

    deleteSponsor: async (id: string) => {
        return apiClient<void>(ENDPOINTS.DELETE_SPONSOR(id), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    },


};