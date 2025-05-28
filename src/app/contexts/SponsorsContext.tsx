'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { sponsorApi } from '@/src/lib/api/sponsors';
import { productApi } from '@/src/lib/api/products';
import { couponApi } from '@/src/lib/api/coupons';
import { SponsorData, SponsorDTO, ProductDTO, MediaDTO, UserLevelDTO, CouponDTO } from '@/src/app/types/form-types';
import { deleteMedia, uploadMedia } from '@/src/lib/api/media';
import { mapToSponsor, sortByDate, formatDateTable, mapToDTO, removeDuplicates, sortByActiveAndDate, mapToCouponDTO } from '../utils/utils';
import { useAuth } from './AuthContext';


// Define the context type
interface SponsorsContextType {
    sponsors: SponsorData[];
    userLevels: UserLevelDTO[];
    loading: boolean;
    error: Error | null;
    addSponsor: (data: any) => Promise<void>;
    editSponsor: (id: string, data: any, removedMedia: MediaDTO[]) => Promise<void>;
    deleteSponsor: (id: string) => Promise<void>;
}

// Create context with undefined as default value
const SponsorsContext = createContext<SponsorsContextType | undefined>(undefined);

// Define props for provider component
interface SponsorsProviderProps {
    children: ReactNode;
}

export function SponsorsProvider({ children }: SponsorsProviderProps) {
    const { isAuthenticated } = useAuth();

    const [sponsors, setSponsors] = useState<SponsorData[]>([]);
    const [userLevels, setUserLevels] = useState<UserLevelDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated]);

    // useEffect(() => { sponsors.length > 0 && console.log(sponsors) }, [sponsors]);

    // Fetch both user levels and sponsors in one operation
    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetching user levels
            const userLevelsData: UserLevelDTO[] = await productApi.getAllUserLevels();
            setUserLevels(userLevelsData);

            // Fetching sponsors/products
            await fetchSponsorsList(userLevelsData);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch data'));
        } finally {
            setLoading(false);
        }
    };

    // Fetch sponsors/products from DB and combine to one list
    const fetchSponsorsList = async (levels: UserLevelDTO[]) => {
        try {
            const sponsorsData: SponsorDTO[] = await sponsorApi.getAll();

            // Get Redeem Shop products
            let redeemProducts: ProductDTO[] = await productApi.getAllRedeem();

            // Get Star Store products for each level
            const starStorePromises = levels.map((level: UserLevelDTO) =>
                productApi.getAllStarByLevel(level.id)
            );
            const starStoreResults = await Promise.all(starStorePromises);
            const allStarStoreProducts = starStoreResults.flat();

            const allProducts = [...redeemProducts, ...allStarStoreProducts];
            const uniqueProducts = removeDuplicates(allProducts);

            const formattedSponsors = sponsorsData.map((sponsor: SponsorDTO) => (
                mapToSponsor(sponsor, Array.isArray(sponsor.created) ? "Hot Flash" : "Title")
            ));
            const formattedProducts = uniqueProducts.map((product: ProductDTO) => (
                mapToSponsor(product, product?.userLevel ? "Star Store" : "Redeem Shop")
            ));

            // const allSponsors = sortByDate([...formattedSponsors, ...formattedProducts]);
            const allSponsors = sortByActiveAndDate([...formattedSponsors, ...formattedProducts]);
            setSponsors(allSponsors);
        } catch (err) {
            console.error('Error fetching sponsors:', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch sponsors'));
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

            // Step 3. Call api to store media data
            if (sponsorCreated && mediaData.length > 0) {
                mediaData.forEach(async (media: MediaDTO) => {
                    const temp = media;

                    const result = await uploadMedia(media, type, data.id);
                    if (result.success) {
                        media.url = result.fileUrl
                        delete media.previewUrl
                        delete media.file
                    } else {
                        media = temp;
                    }
                });
            }

            // Step 4. Update local state
            setSponsors(prevSponsors => {
                const updatedSponsors = [...prevSponsors, data];
                // return sortByDate(updatedSponsors);
                return sortByActiveAndDate(updatedSponsors)
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
            if (mediaData) {
                try {
                    mediaData.forEach(async (media: MediaDTO) => {
                        if (media.previewUrl || media.file) {
                            const result = await uploadMedia(media, type, id);
                            if (result.success) {
                                media.url = result.fileUrl
                                delete media.previewUrl
                                delete media.file
                            }
                        }
                    });
                } catch (s3Error) {
                    console.error('Error adding sponsor media files:', s3Error);
                }
            }

            // Step 5. Call api to delete media data in s3 
            if (removedMedia.length > 0) {
                try {
                    removedMedia.forEach(async (media: MediaDTO) => {
                        await deleteMedia(media, type, id)
                    });
                } catch (s3Error) {
                    console.error('Error deleting sponsor media files:', s3Error);
                }
            }

            // Step 6. Update local state
            setSponsors(prevSponsors => {
                const updatedSponsor = prevSponsors.map(sponsor =>
                    sponsor.id === id ? data : sponsor
                )
                // return sortByDate(updatedSponsor)
                return sortByActiveAndDate(updatedSponsor)
            });
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

            // 3. Update local state to remove the deleted sponsor
            setSponsors(prevSponsors =>
                prevSponsors.filter(sponsor => sponsor.id !== id)
            );

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
        loading,
        error,
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