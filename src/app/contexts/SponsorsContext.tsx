'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { sponsorApi } from '@/src/lib/api/sponsors';
import { productApi } from '@/src/lib/api/products';
import { couponApi } from '@/src/lib/api/coupons';
import { SponsorData, SponsorDTO, ProductDTO, MediaDTO, UserLevelDTO, CouponDTO } from '@/src/app/types/form-types';
import { deleteMedia, uploadMedia } from '@/src/lib/api/media';
import { mapToSponsor, sortByDate, formatDateTable, mapToDTO, removeDuplicates, sortByActiveAndDate, mapToCouponDTO } from '../utils/utils';
import { useAuth } from './AuthContext';

interface SponsorsContextType {
    sponsors: SponsorData[];
    userLevels: UserLevelDTO[];
    stats: Stats;
    loading: boolean;
    error: Error | null;
    fetchSponsorData: (type: string) => Promise<void>;
    addSponsor: (data: any) => Promise<void>;
    editSponsor: (id: string, data: any, removedMedia: MediaDTO[]) => Promise<void>;
    deleteSponsor: (id: string) => Promise<void>;
}

interface Stats {
    total: number;
    active: number;
    inactive: number;
}

interface SponsorsProviderProps {
    children: ReactNode;
}

const SponsorsContext = createContext<SponsorsContextType | undefined>(undefined);

// Cache configuration
const CACHE_KEY = 'sponsors_cache';
const CACHE_EXPIRATION = 30 * 60 * 1000; // 30 minutes

export function SponsorsProvider({ children }: SponsorsProviderProps) {
    const { isAuthenticated } = useAuth();

    const [sponsors, setSponsors] = useState<SponsorData[]>([]);
    const [userLevels, setUserLevels] = useState<UserLevelDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [stats, setStats] = useState<Stats>({
        total: 0,
        active: 0,
        inactive: 0
    });

    useEffect(() => {
        if (isAuthenticated) {
            // Check if we have any cached data
            const loadCachedData = () => {
                try {
                    const cached = localStorage.getItem(CACHE_KEY);
                    if (cached) {
                        const cacheData = JSON.parse(cached);
                        const isExpired = Date.now() - cacheData.timestamp > CACHE_EXPIRATION;

                        if (!isExpired && cacheData.sponsors && cacheData.sponsors.length > 0) {
                            setSponsors(cacheData.sponsors);
                            return;
                        }
                    }
                } catch (error) {
                    console.error('Failed to load cached data:', error);
                }
            };

            loadCachedData();
            fetchData();
        }
    }, [isAuthenticated]);

    // useEffect(() => { sponsors.length > 0 && console.log(sponsors) }, [sponsors]);

    // Fetch user levels and statistics
    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const userLevelsData: UserLevelDTO[] = await productApi.getAllUserLevels();
            setUserLevels(userLevelsData);

            await fetchStats(userLevelsData);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch data'));
        } finally {
            setLoading(false);
        }
    };

    // Fetch sponsors/products statistics. Can be optimzied with an API to return necessary stat data 
    const fetchStats = async (levels: UserLevelDTO[]) => {
        try {
            // Get all Sponsor data
            const allSponsorData: SponsorDTO[] = await sponsorApi.getAll();

            // Get all Product data
            const redeemProducts: ProductDTO[] = await productApi.getAllRedeem();
            const starStorePromises = levels.map((level: UserLevelDTO) =>
                productApi.getAllStarByLevel(level.id)
            );
            const starStoreProducts = await Promise.all(starStorePromises);
            const allProductData = removeDuplicates([...redeemProducts, ...starStoreProducts.flat()]);

            const allSponsors = [...allSponsorData, ...allProductData]
            setStats({
                total: allSponsors.length,
                active: allSponsors.filter(sponsor => sponsor.active === true).length,
                inactive: allSponsors.filter(sponsor => sponsor.active === false).length
            })
        } catch (err) {
            console.error('Error fetching sponsor statistics:', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch statistics'));
        }
    };

    const updateStatData = (newData: SponsorData | null, add: boolean, prevData: SponsorData | null, remove: boolean) => {
        if (add && newData) {
            setStats({
                total: stats.total + 1,
                active: newData.active ? stats.active + 1 : stats.active,
                inactive: !newData.active ? stats.inactive + 1 : stats.inactive,
            })
        } else if (remove && prevData) {
            setStats({
                total: stats.total - 1,
                active: prevData.active ? stats.active - 1 : stats.active,
                inactive: !prevData.active ? stats.inactive - 1 : stats.inactive,
            })
        } else if (prevData!.active != newData!.active) {
            if (newData!.active) {
                setStats({
                    ...stats,
                    active: stats.active + 1,
                    inactive: stats.inactive - 1
                })
            } else {
                setStats({
                    ...stats,
                    active: stats.active - 1,
                    inactive: stats.inactive + 1
                })
            }
        }
    };

    // Fetch sponsors/products from DB given a sponsor type (Title, Redeem, Star, Flash)
    const fetchSponsorData = async (type: string) => {
        try {
            setLoading(true);

            // Try to load from cache first
            const cachedSponsors = loadFromCache(type);
            if (cachedSponsors) {
                setSponsors(cachedSponsors);
                setLoading(false);
                return;
            }

            let sponsorData: SponsorDTO[] | ProductDTO[] = [];
            let sponsorType: string;
            switch (type) {
                case 'Title':
                    sponsorData = await sponsorApi.getAll();
                    sponsorType = "Title";
                    break;
                case 'Redeem':
                    sponsorData = await productApi.getAllRedeem();
                    sponsorType = "Redeem Shop";
                    break;
                case 'Star':
                    const starStorePromises = userLevels.map((level: UserLevelDTO) =>
                        productApi.getAllStarByLevel(level.id)
                    );
                    const starStoreResults = await Promise.all(starStorePromises);
                    sponsorData = removeDuplicates(starStoreResults.flat());
                    sponsorType = "Star Store";
                    break;
                case 'Flash':
                    // *** NEED an API to grab only flashData ***
                    sponsorData = [];
                    sponsorType = "Hot Flash";
                    break;
                default:
                    // Default to Title data
                    sponsorData = await sponsorApi.getAll();
                    sponsorType = "Title";
                    break;
            }

            // Sort and set the sponsors data
            const sortedSponsors = sortByActiveAndDate(
                sponsorData.map((sponsor: SponsorDTO | ProductDTO) => (
                    mapToSponsor(sponsor, sponsorType)
                ))
            );
            setSponsors(sortedSponsors);

            // Save to cache
            saveToCache(sortedSponsors, type);
        } catch (err) {
            console.error('Error fetching sponsors:', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch sponsors'));
        } finally {
            setLoading(false);
        }
    };

    // Helper function to save sponsor data to a cache(local storage)
    const saveToCache = (data: SponsorData[], type: string) => {
        try {
            const cacheData = {
                sponsors: data,
                type: type,
                timestamp: Date.now()
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Failed to save to cache:', error);
        }
    };

    // Helper function to load sponsor data from cache(local storage)
    const loadFromCache = (type: string): SponsorData[] | null => {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached) return null;

            const cacheData = JSON.parse(cached);

            // Check if cache is expired or different type
            const isExpired = Date.now() - cacheData.timestamp > CACHE_EXPIRATION;
            if (isExpired || cacheData.type !== type) {
                localStorage.removeItem(CACHE_KEY);
                return null;
            }
            return cacheData.sponsors;
        } catch (error) {
            console.error('Failed to load from cache:', error);
            localStorage.removeItem(CACHE_KEY);
            return null;
        }
    };

    // Helper function to clear sponsor data from the cache(local storage)
    const clearCache = () => {
        try {
            localStorage.removeItem(CACHE_KEY);
        } catch (error) {
            console.error('Failed to clear cache:', error);
        }
    };

    // Add new sponsor
    const addSponsor = async (data: SponsorData): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const sponsorData: SponsorDTO | ProductDTO = mapToDTO(data, data.type);
            const mediaData: MediaDTO[] = data.media ? data.media : [];
            const type = data.type === "Redeem Shop" || data.type === "Star Store" ? 'products' : "sponsors";
            let sponsorCreated = false

            console.log("Sponsor Data (upload):", sponsorData)
            console.log("Media Data (upload):", mediaData)

            // Step 1. Call API to create sponsor
            if (type === 'products') {
                await productApi.createOrUpdate(sponsorData as ProductDTO);
                sponsorCreated = true;
            } else {
                await sponsorApi.createOrUpdate(sponsorData as SponsorDTO);
                sponsorCreated = true;
            }

            // Step 2. Call api to create Coupon in coupons table
            if (sponsorCreated && sponsorData.couponsAvailable! > 0) {
                const couponsAvailable = sponsorData.couponsAvailable!;
                const code = type === 'products' ? data.stockKeepingUnit : data.couponCode;

                for (let i = 1; i <= couponsAvailable; i++) {
                    if (code && sponsorData.couponUsageCount) {
                        // await couponApi.createOrUpdate(mapToCouponDTO(sponsorData.id, (code + `-${i}`), type, sponsorData.couponUsageCount))
                    }
                }
            }

            // Step 3. Handle media uploads properly with Promise.all
            if (sponsorCreated && mediaData.length > 0) {
                const uploadPromises = mediaData.map(async (media: MediaDTO) => {
                    try {
                        const result = await uploadMedia(media, type, data.id);
                        if (result && result.success) {
                            media.url = result.fileUrl;
                            delete media.previewUrl;
                            delete media.file;
                        }
                        return media;
                    } catch (error) {
                        console.error('Error uploading media:', error);
                        // Clean up properties even on error
                        delete media.previewUrl;
                        delete media.file;
                        return media;
                    }
                });

                await Promise.all(uploadPromises);
                console.log('Updated media after upload:', data.media);
            }

            // Step 4. Update stats and local state
            updateStatData(data, true, null, false);
            clearCache();
            setSponsors(prevSponsors => {
                const updatedSponsors = sortByActiveAndDate([...prevSponsors, data]);
                saveToCache(updatedSponsors, data.type);
                return updatedSponsors;
            });
        } catch (err) {
            console.error('Error adding sponsor:', err);
            setError(err instanceof Error ? err : new Error('Failed to add sponsor'));
        } finally {
            setLoading(false);
        }
    };

    // Edit existing sponsor
    const editSponsor = async (id: string, data: SponsorData, removedMedia: MediaDTO[]): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const sponsorData: SponsorDTO | ProductDTO = mapToDTO(data, data.type);
            const mediaData: MediaDTO[] = data.media ? data.media : [];
            const sponsorToEdit = sponsors.find(sponsor => sponsor.id === id)!;
            const type = data.type === "Redeem Shop" || data.type === "Star Store" ? 'products' : "sponsors";

            console.log("Sponsor Data (update):", sponsorData)
            console.log("Media Data (update):", mediaData)

            // Step 1. Call API to update sponsor
            try {
                if (type === 'products') {
                    await productApi.createOrUpdate(sponsorData);
                } else {
                    await sponsorApi.createOrUpdate(sponsorData as SponsorDTO);
                }
            } catch (error) {
                console.error('Error editting sponsor:', error);
            }

            // Step 2. Edit Coupons (couponUsageCount && couponCode)
            // if (sponsorData.couponUsageCount != sponsorToEdit.couponUsageCount) {
            //     const coupons: CouponDTO[] = type === 'products'
            //         ? await couponApi.getAllProduct(id)
            //         : await couponApi.getAllSponsor(id);

            //     await Promise.all(
            //         coupons.map(async (coupon: CouponDTO) => {
            //             const updatedCoupon: CouponDTO = {
            //                 ...coupon,
            //                 usageCount: sponsorData.couponUsageCount,
            //                 code: `${coupon.code}-${coupon.code!.split("-")[1]}`
            //             };
            //             return await couponApi.createOrUpdate(updatedCoupon);
            //         })
            //     );
            // }

            // Step 3. Edit Coupons (amount)
            // if (sponsorData.couponsAvailable != parseInt(sponsorToEdit.couponsAvailable as string)) {
            //     const couponsAvailable = sponsorData.couponsAvailable!;
            //     const code = type === 'products' ? data.stockKeepingUnit : data.couponCode;
            //     const coupons: CouponDTO[] = type === 'products'
            //         ? await couponApi.getAllProduct(id)
            //         : await couponApi.getAllSponsor(id);

            //     if (couponsAvailable > parseInt(sponsorToEdit.couponsAvailable as string)) {
            //         // Add Coupons
            //         const start = parseInt(sponsorToEdit.couponsAvailable as string);
            //         for (let i = start; i <= couponsAvailable; i++) {
            //             if (code && sponsorData.couponUsageCount) {
            //                 await couponApi.createOrUpdate(mapToCouponDTO(sponsorData.id, (code + `${i}`), type, sponsorData.couponUsageCount))
            //             }
            //         }
            //     }
            //     else if (couponsAvailable < parseInt(sponsorToEdit.couponsAvailable as string)) {
            //         // Delete coupons (based on code postfix)
            //         const couponsToDelete = coupons
            //             .map(coupon => {
            //                 const match = coupon.code!.match(/-(\d+)$/);
            //                 const suffix = match ? parseInt(match[1], 10) : NaN;
            //                 return { ...coupon, suffix };
            //             })
            //             .filter(coupon => !isNaN(coupon.suffix) && coupon.suffix > couponsAvailable)
            //             .sort((a, b) => b.suffix - a.suffix);

            //         for (const coupon of couponsToDelete) {
            //             await couponApi.deleteCoupon(coupon.id);
            //         }
            //     }
            // }

            // Step 4. Call api to store media data in s3
            if (mediaData.length > 0) {
                // Filter media that needs to be uploaded (has previewUrl or file)
                const mediaToUpload = mediaData.filter(media => media.previewUrl || media.file);

                if (mediaToUpload.length > 0) {
                    const uploadPromises = mediaToUpload.map(async (media: MediaDTO) => {
                        try {
                            const result = await uploadMedia(media, type, id);
                            if (result && result.success) {
                                media.url = result.fileUrl;
                                delete media.previewUrl;
                                delete media.file;
                            }
                            return media;
                        } catch (error) {
                            console.error('Error uploading media:', error);
                            // Clean up properties even on error
                            delete media.previewUrl;
                            delete media.file;
                            return media;
                        }
                    });

                    await Promise.all(uploadPromises);
                    console.log('Updated media after upload:', data.media);
                }
            }

            // Step 5. Handle media deletions with Promise.all
            if (removedMedia.length > 0) {
                const deletePromises = removedMedia.map(async (media: MediaDTO) => {
                    try {
                        await deleteMedia(media, type, id);
                        return media;
                    } catch (error) {
                        console.error('Error deleting media:', error);
                        return media;
                    }
                });

                await Promise.all(deletePromises);
                console.log('Deleted media:', removedMedia);
            }

            // Step 6. Update stats and local state
            updateStatData(data, false, sponsorToEdit, false);
            setSponsors(prevSponsors => {
                const updatedSponsor = prevSponsors.map(sponsor =>
                    sponsor.id === id ? data : sponsor
                )
                // return sortByDate(updatedSponsor)
                return sortByActiveAndDate(updatedSponsor)
            });
            clearCache();
        } catch (err) {
            console.error('Error updating sponsor:', err);
            setError(err instanceof Error ? err : new Error('Failed to update sponsor'));
        } finally {
            setLoading(false);
        }
    };

    // Delete sponsor
    const deleteSponsor = async (id: string): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const sponsorToDelete = sponsors.find(sponsor => sponsor.id === id)!;
            const type = sponsorToDelete.type === "Redeem Shop" || sponsorToDelete.type === "Star Store" ? 'products' : "sponsors";

            console.log("Sponsor Data (delete):", sponsorToDelete)
            console.log("Media Data (delete):", sponsorToDelete.media)

            if (!sponsorToDelete) {
                throw new Error('Sponsor not found');
            }

            // Step 1. Call API to delete the sponsor
            try {
                if (type === 'products') {
                    await productApi.deleteProduct(id);
                } else {
                    await sponsorApi.deleteSponsor(id);
                }
            } catch (error) {
                console.error('Error deleting sponsor:', error);
            }

            // Step 2. Delete any associated media files from S3
            try {
                if (sponsorToDelete.media!.length > 0) {
                    sponsorToDelete.media!.forEach(async (media: MediaDTO) => {
                        await deleteMedia(media, type, sponsorToDelete.id, true);
                    })
                }
            } catch (s3Error) {
                console.error('Error deleting sponsor media files:', s3Error);
            }

            // 3. Update stats and local state to remove the deleted sponsor
            updateStatData(null, false, sponsorToDelete, true);
            setSponsors(prevSponsors =>
                prevSponsors.filter(sponsor => sponsor.id !== id)
            );
            clearCache();
        } catch (err) {
            console.error('Error deleting sponsor:', err);
            setError(err instanceof Error ? err : new Error('Failed to delete sponsor'));
        } finally {
            setLoading(false);
        }
    };

    const value = {
        sponsors,
        userLevels,
        stats,
        loading,
        error,
        fetchSponsorData,
        addSponsor,
        editSponsor,
        deleteSponsor
    };

    return <SponsorsContext.Provider value={value}> {children} </SponsorsContext.Provider>;
}

export function useSponsorsContext(): SponsorsContextType {
    const context = useContext(SponsorsContext);

    if (context === undefined) {
        throw new Error('useSponsorsContext must be used within a SponsorsProvider');
    }

    return context;
}