import { CouponDTO, MediaDTO, ProductDTO, SponsorData, SponsorDTO } from "../types/form-types";
import { uuidv7 } from "uuidv7";

/**
 * 
 * @param data - SponsorDTO or ProductDTO returned from the API
 * @param type - Type of the sponsor (e.g., "Redeem Shop", "Star Store", etc.)
 * @returns SponsorData Object
 */
export function mapToSponsor(data: SponsorDTO | ProductDTO, type: String): SponsorData {
    if (type === "Redeem Shop" || type === "Star Store") {
        // Product
        const ProductData = data as ProductDTO;
        return {
            id: ProductData.id.toLowerCase(),
            type: type as string,
            sponsor: ProductData.title || '',
            title: ProductData.title || '',
            userLevelID: ProductData?.userLevelID || '',
            userLevel: ProductData?.userLevel || null,
            stockKeepingUnit: ProductData?.stockKeepingUnit || '',
            shortDescription: ProductData?.shortDescription || '',
            longDescription: ProductData?.longDescription || '',
            url: ProductData?.url || '',
            level: ProductData.level || null,
            priority: ProductData.priority || null,
            discountType: ProductData?.discountAmount
                ? "dollar"
                : ProductData?.discountPercent ? "percent" : null,
            discountAmount: ProductData?.discountAmount || null,
            discountPercent: ProductData?.discountPercent || null,
            couponsAvailable: ProductData?.couponsAvailable || null,
            couponsToRedeem: ProductData?.couponsToRedeem || null,
            couponUsageCount: ProductData?.couponUsageCount || null,
            purpleCoins: ProductData?.purpleCoins || null,
            beginDate: ProductData?.beginDate || "",
            endDate: ProductData?.endDate || "",
            active: ProductData?.active || false,
            media: ProductData.media?.map((media: MediaDTO) => ({
                id: media.id.toLowerCase(),
                productID: media.productID,
                s3Key: media?.s3Key || '',
                url: media.url,
                thumbnailURL: media.thumbnailURL,
                contentType: media.contentType,
                order: media.order,
                width: media.width,
                height: media.height,
                videoDurationInSeconds: media.videoDurationInSeconds || 0,
            }) as MediaDTO) || [],
        }
    } else {
        // Sponsor
        const SponsorData = data as SponsorDTO;
        return {
            id: SponsorData.id.toLowerCase(),
            type: type as string,
            sponsor: SponsorData.title || '',
            title: SponsorData.title || '',
            subtitle: SponsorData.subtitle || '',
            summary: SponsorData.summary || '',
            description: SponsorData.sponsorDescription || '',
            couponCode: SponsorData.couponCode || '',
            discountType: SponsorData?.discountAmount
                ? "dollar"
                : SponsorData?.discountPercent ? "percent" : null,
            discountAmount: SponsorData.discountAmount,
            discountPercent: SponsorData.discountPercent,
            couponsAvailable: SponsorData.couponsAvailable || 0,
            couponsToRedeem: /*SponsorData.couponsToRedeem */ 0,
            couponUsageCount: SponsorData.couponUsageCount || 0,
            url: SponsorData.url || '',
            urlTitle: SponsorData.urlTitle || '',
            glowing: SponsorData.glowing,
            order: SponsorData.order,
            active: /*SponsorData?.active*/ SponsorData.title ? true : false,
            // beginDate: SponsorData?.beginDate || "",
            // endDate: SponsorData?.endDate || "",
            media: SponsorData.media?.map((media: MediaDTO) => ({
                id: media.id.toLowerCase(),
                sponsorID: media.sponsorID,
                tag: media.tag,
                s3Key: media?.s3Key || '',
                url: media.url,
                thumbnailURL: media.thumbnailURL,
                contentType: media.contentType,
                order: media.order,
                width: media.width,
                height: media.height,
                videoDurationInSeconds: media.videoDurationInSeconds || 0,
            }) as MediaDTO) || [],
        }
    };
}

/**
 * 
 * @param data - SponsorData Object
 * @param type - Type of the sponsor (e.g., "Redeem Shop", "Star Store", etc.)
 * @returns SponsorDTO or ProductDTO Object (formatted for API)
 */
export function mapToDTO(data: SponsorData, type: String): SponsorDTO | ProductDTO {
    if (type === "Redeem Shop" || type === "Star Store") {
        // ProductDTO
        return {
            id: data.id,
            userLevelID: data.userLevelID || null,
            userLevel: data.userLevel || null,
            stockKeepingUnit: data.stockKeepingUnit || "",
            title: data.title || "",
            shortDescription: data.shortDescription || "",
            longDescription: data.longDescription || "",
            url: data.url || "",
            level: data.level ? parseInt(data.level as string) : 0,
            priority: data.priority ? parseInt(data.priority as string) : 0,
            discountAmount: data.discountAmount ? parseFloat(data.discountAmount as string) : 0,
            discountPercent: data.discountPercent ? parseFloat(data.discountPercent as string) : 0,
            couponUsageCount: data.couponUsageCount ? parseInt(data.couponUsageCount as string) : 0,
            purpleCoins: data.purpleCoins ? parseInt(data.purpleCoins as string) : 0,
            beginDate: data.beginDate || null,
            endDate: data.endDate || null,
            active: data.active || false,
            couponsAvailable: data.couponsAvailable ? parseInt(data.couponsAvailable as string) : 0,
            couponsToRedeem: data.purpleCoins ? parseInt(data.purpleCoins as string) : 0
        } as ProductDTO;
    } else {
        // SponsorDTO
        return {
            id: data.id,
            title: data.title || "",
            subtitle: data.subtitle || "",
            summary: data.summary || "",
            sponsorDescription: data.description || "",
            couponCode: data.couponCode || "",
            discountAmount: data.discountAmount ? parseFloat(data.discountAmount as string) : 0,
            discountPercent: data.discountPercent ? parseFloat(data.discountPercent as string) : 0,
            couponUsageCount: data.couponUsageCount ? parseInt(data.couponUsageCount as string) : 0,
            url: data.url || "",
            urlTitle: data.urlTitle || "",
            glowing: data.glowing || false,
            order: data.order ? parseInt(data.order as string) : 0,
            couponsAvailable: data.couponsAvailable ? parseInt(data.couponsAvailable as string) : 0,
            couponsToRedeem: data.couponsToRedeem ? parseInt(data.couponsToRedeem as string) : 0,
        } as SponsorDTO;
    }
}

/**
 * 
 * @param data - Coupon code prefix (e.g. SUMMER2025, WELCOME10)
 * @param type - Type of the sponsor (products / sponsors)
 * @returns SponsorDTO or ProductDTO Object (formatted for API)
 */
export function mapToCouponDTO(id: string, code: string, type: string, couponUsageCount: number): CouponDTO {
    return {
        id: generateUUID(),
        code: code,
        usageCount: couponUsageCount,
        ...(type === 'products' ? { productID: id } : { sponsorID: id })
    } as CouponDTO
}

/**
 * Generates a unique id in UUIDv7
 * @returns 
 */
export function generateUUID(): string {
    return uuidv7().toLowerCase();
}

/**
 * 
 * @param sponsors - Array of SponsorData objects
 * @returns Array of SponsorData objects sorted by date descending
 */
export function sortByDate(sponsors: SponsorData[]): SponsorData[] {
    const ret = sponsors.sort((a, b) => {
        const dateA = new Date(Array.isArray(a.beginDate) ? a.beginDate[0] : a.beginDate || 0).getTime();
        const dateB = new Date(Array.isArray(b.beginDate) ? b.beginDate[0] : b.beginDate || 0).getTime();
        return dateB - dateA;
    });
    return ret
};

/**
 * Combined sort function that sorts by active status first, then by date
 * 
 * @param sponsors - Array of SponsorData objects
 * @returns Array of SponsorData objects sorted by active status first (active first), then by date descending
 */
export function sortByActiveAndDate(sponsors: SponsorData[]): SponsorData[] {
    const ret = sponsors.sort((a, b) => {
        // First sort by active status
        const activeA = a.active ? 1 : 0;
        const activeB = b.active ? 1 : 0;

        // If active status is different, sort by active first
        if (activeA !== activeB) {
            return activeB - activeA; // Active items first
        }

        // If active status is the same, sort by date (newest first)
        const dateA = new Date(Array.isArray(a.beginDate) ? a.beginDate[0] : a.beginDate || 0).getTime();
        const dateB = new Date(Array.isArray(b.beginDate) ? b.beginDate[0] : b.beginDate || 0).getTime();
        return dateB - dateA;
    });
    return ret;
}

/**
 * 
 * @param date - Date string in YYYY-MM-DD OR YYYY-MM-DDT00:00:00Z format
 * @returns Formatted date string in MM/DD/YYYY format
 */
export function formatDateTable(date: string): string {
    if (date.includes(',')) {
        return date.split(',')[0];
    }
    if (date.includes('T')) {
        date = date.split('T')[0];
    }
    const [year, month, day] = date.split('-');
    return `${month}/${day}/${year}`
};

/**
 * 
 * @param date - Date string in YYYY-MM-DDT00:00:00Z format
 * @returns Formatted date string in yyyy-mm-dd format
 */
export const formatDateSponsor = (dateString: any) => {
    const date = dateString.split('T')[0];
    const [year, month, day] = date.split('-');
    return `${year}-${month}-${day}`;
}

/**
 * Removes duplicate items from an array based on id property
 * @param items Array of items that may contain duplicates
 * @param keepStrategy Strategy to determine which duplicate to keep ('first', 'last', or a custom function)
 * @returns Array with duplicates removed
 */
export function removeDuplicates<T extends { id: string | number }>(
    items: T[],
    keepStrategy: 'first' | 'last' | ((duplicates: T[]) => T) = 'first'
): T[] {
    // Create a map to store items by id
    const idMap = new Map<string | number, T[]>();

    // Group items by id
    items.forEach(item => {
        const id = item.id;
        if (!idMap.has(id)) {
            idMap.set(id, [item]);
        } else {
            idMap.get(id)!.push(item);
        }
    });

    // No duplicates found, return the original array
    const hasDuplicates = Array.from(idMap.values()).some(group => group.length > 1);
    if (!hasDuplicates) {
        return items;
    }

    // Select which item to keep for each id
    const uniqueItems = Array.from(idMap.entries()).map(([_, duplicates]) => {
        if (duplicates.length === 1) {
            return duplicates[0]; // Only one item, no decision needed
        }

        // Choose which item to keep based on strategy
        if (keepStrategy === 'first') {
            return duplicates[0];
        } else if (keepStrategy === 'last') {
            return duplicates[duplicates.length - 1];
        } else {
            // Use custom function to choose which duplicate to keep
            return keepStrategy(duplicates);
        }
    });

    return uniqueItems;
}
