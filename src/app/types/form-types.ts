import { Dispatch, SetStateAction } from 'react';

export const sponsorTypes = [
    'Title',
    'Redeem Shop',
    'Star Store',
    'Hot Flash',
];

// Axis SponsorDTO (AxisDTOs)
export interface SponsorDTO {
    id: string;
    title: string;
    subtitle?: string;
    summary?: string;
    sponsorDescription?: string;
    couponCode?: string;
    discountAmount?: number;
    discountPercent?: number;
    couponsAvailable?: number;
    couponsToRedeem?: number;
    couponUsageCount?: number;
    media?: [MediaDTO];
    url?: string;
    urlTitle?: string;
    glowing?: boolean;
    order?: number;
    created?: Date;
    updated?: Date;
}

// Axis ProductDTO (AxisDTOs)
export interface ProductDTO {
    id: string;
    title?: string;
    userLevelID?: string;
    userLevel?: UserLevelDTO;
    stockKeepingUnit?: string;
    shortDescription?: string;
    longDescription?: string;
    url?: string;
    level?: number;
    priority?: number;
    discountAmount?: number;
    discountPercent?: number;
    couponsAvailable?: number
    couponsToRedeem?: number
    couponUsageCount?: number;
    purpleCoins?: number;
    media?: [MediaDTO];
    beginDate?: Date | string;
    endDate?: Date | string;
    active?: boolean;
    created?: Date;
    updated?: Date;
}

// Main Sponsor Data Object (Sponsors & Products)
export interface SponsorData {
    id: string;
    sponsor: string;
    type: string;
    title: string;
    subtitle?: string;
    summary?: string;
    description?: string;
    shortDescription?: string;
    longDescription?: string;
    stockKeepingUnit?: string;
    couponCode?: string;
    discountType?: string | null,
    discountAmount?: number | null | string;
    discountPercent?: number | null | string;
    couponsAvailable?: number | null | string;
    couponsToRedeem?: number | null | string;
    couponUsageCount?: number | null | string;
    purpleCoins?: number | null | string;
    media?: MediaDTO[];
    url?: string;
    urlTitle?: string;
    glowing?: boolean;
    order?: number | null | string;
    level?: number | null | string;
    priority?: number | null | string;
    userLevelID?: string;
    userLevel?: UserLevelDTO | null;
    beginDate?: Date | Date[] | string;
    endDate?: Date | Date[] | string;
    active?: boolean;
}

// Axis CouponDTO (AxisDTOs)
export interface CouponDTO {
    id: string;
    productID?: string | null;
    sponsorID?: string | null;
    userID?: string | null;
    code?: string | null;
    usageCount?: number;
    redeemed?: Date;
    created?: Date;
    updated?: Date;
}

// Axis MediumDTO (AxisDTOs)
export interface MediaDTO {
    id: string;
    eventID?: string;
    postID?: string;
    productID?: string;
    sponsorID?: string;
    stageID?: string;
    storyID?: string;
    userID?: string;
    tag?: string;
    url?: string;
    order?: number;
    s3Key?: string;
    width?: number;
    height?: number;
    contentType?: string;
    thumbnailURL?: string;
    previewUrl?: string; // Added for previewing
    file?: File | null; // Added for file upload
    videoDurationInSeconds?: number;
    created?: Date;
    updated?: Date;
}

// Axis UserLevelDTO (AxisDTOs)
export interface UserLevelDTO {
    id: string,
    title: string,
    starsNeeded?: number,
    created?: Date,
    updated?: Date,
}

export interface FormErrors {
    sponsor: String;
    title: String;
    subtitle?: String;
    summary?: String;
    description?: String;
    shortDescription?: String;
    longDescription?: String;
    stockKeepingUnit?: String;
    couponCode?: String;
    discountType?: String,
    discountAmount?: String;
    discountPercent?: String;
    couponsAvailable?: String;
    couponsToRedeem?: String;
    couponUsageCount?: String;
    purpleCoins?: String;
    media?: String;
    url?: String;
    urlTitle?: String;
    glowing?: String;
    order?: String;
    level?: String;
    priority?: String;
    userLevelID?: String;
    userLevel?: String;
    beginDate?: String;
    endDate?: String;
}

export interface MediaFormErrors {
    contentType: string;
    order: string;
    tage?: string;
    file: string;
    previewUrl: string;
}

export interface SponsorFormProps {
    setLoading: Dispatch<SetStateAction<boolean>>;
    setError: Dispatch<SetStateAction<string>>;
    FormData?: SponsorData;
    MediaList?: MediaDTO[];
    formType?: 'Title' | 'Hot Flash';
}

export interface ProductFormProps {
    setLoading: (loading: boolean) => void;
    setError: (error: string) => void;
    FormData?: SponsorData;
    MediaList?: MediaDTO[];
    formType?: 'Redeem Shop' | 'Star Store';
}

// Media types(for uploading images and videos)
export interface MediaFormProps {
    id: string;
    formType?: 'product' | 'sponsor';
    onBack: () => void;
    onSave: (media: MediaDTO) => void;
    setError: (error: string) => void;
}

// Define interfaces for media constraints
export interface ImageConstraints {
    aspectRatio: number;
    minWidth: number;
    minHeight: number;
    formats: string[];
    formatNames: string[];
}

export interface VideoConstraints {
    aspectRatios: number[];
    minWidth: number;
    minHeight: number;
    formats: string[];
    formatNames: string[];
    aspectRatio?: number; // Some constraints might have this instead of aspectRatios
}
