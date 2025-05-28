'use client'
import * as React from 'react';
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import {
    FiAlignLeft,
    FiList,
    FiBarChart2,
    FiLayers,
    FiTag,
    FiDollarSign,
    FiBox,
    FiSave,
    FiUser,
    FiUsers,
    FiLink,
    FiType,
    FiPercent,
    FiImage,
    FiPlus,
    FiXCircle
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useSponsorsContext } from '../../contexts/SponsorsContext';
import { SponsorData, MediaDTO, ProductFormProps, FormErrors } from '../../types/form-types';
import MediaForm from './MediaForm';
import { formatDateSponsor, generateUUID } from '../../utils/utils';

const createEmptyFormData = (): SponsorData => ({
    id: generateUUID(),
    sponsor: '',
    type: '',
    title: '',
    shortDescription: '',
    longDescription: '',
    priority: '',
    level: '',
    userLevelID: '',
    userLevel: null,
    stockKeepingUnit: '',
    discountType: '',
    discountAmount: '',
    discountPercent: '',
    couponsAvailable: '',
    couponUsageCount: '',
    purpleCoins: '',
    beginDate: '',
    endDate: '',
    url: '',
    active: true,
})

const emptyErrors: FormErrors = {
    sponsor: '',
    stockKeepingUnit: '',
    title: '',
    shortDescription: '',
    longDescription: '',
    priority: '',
    level: '',
    userLevelID: '',
    beginDate: '',
    endDate: '',
    discountType: '',
    discountAmount: '',
    discountPercent: '',
    couponsAvailable: '',
    purpleCoins: '',
    url: '',
};

export default function ProductForm({ setLoading, setError, FormData, MediaList, formType = 'Redeem Shop' }: ProductFormProps) {
    const router = useRouter();
    const { userLevels, addSponsor, editSponsor } = useSponsorsContext();

    // Initialize form data with appropriate type based on formType
    const initialFormData = (FormData || { ...createEmptyFormData(), type: formType }) as SponsorData;

    const [formData, setFormData] = useState<SponsorData>(initialFormData);
    const [errors, setErrors] = useState<FormErrors>(emptyErrors);
    const [submitting, setSubmitting] = useState<boolean>(false);

    const [showMediaForm, setShowMediaForm] = useState<boolean>(false);
    const [mediaList, setMediaList] = useState<MediaDTO[]>(MediaList || []);
    const [removedMediaList, setRemovedMediaList] = useState<MediaDTO[]>([]);

    // Clean up URLs when component unmounts
    useEffect(() => {
        return () => {
            // Clean up any object URLs to prevent memory leaks
            mediaList.length > 0 && mediaList.forEach(media => {
                if (media.previewUrl) {
                    URL.revokeObjectURL(media.previewUrl as string);
                }
            });
        };
    }, []);

    useEffect(() => {
        setFormData({ ...createEmptyFormData(), type: formType })
        setMediaList([]);
        setErrors(emptyErrors);
    }, [formType]);

    useEffect(() => {
        if (FormData) {
            setFormData(prevData => ({
                ...createEmptyFormData(),  // Start with empty defaults
                ...prevData,       // Keep any current values
                ...FormData,       // Override with provided data
            }));

            if (MediaList) {
                setMediaList(MediaList);
            }
        }
    }, [FormData, MediaList]);

    const ensureStringValue = (value: any): string => {
        if (value === null || value === undefined) return '';
        return String(value);
    };

    // Function to handle media form visibility
    const toggleMediaForm = (): void => {
        setShowMediaForm(!showMediaForm);
    };

    // Function to handle when media is saved from MediaForm
    const handleMediaSave = (media: MediaDTO): void => {
        setMediaList(prev => [...prev, media]);
        setShowMediaForm(false);
    };

    // Function to remove media from list
    const removeMedia = (id: String): void => {
        const mediaToRemove = mediaList.find(media => media.id === id);

        // Revoke the URL to avoid memory leaks
        if (mediaToRemove && mediaToRemove.previewUrl) {
            URL.revokeObjectURL(mediaToRemove.previewUrl as string);
        }

        setMediaList(mediaList.filter(media => media.id !== id));
        setRemovedMediaList(prev => [...prev, mediaToRemove as MediaDTO]);
    };

    const validateField = (name: keyof SponsorData, value: any, data: Partial<SponsorData>): string => {
        let error = "";

        switch (name) {
            case 'sponsor':
                if (!value?.toString().trim()) error = 'Sponsor name is required';
                break;
            case 'stockKeepingUnit':
                // if (!value?.toString().trim()) error = 'SKU is required';
                break;
            case 'title':
                if (!value?.toString().trim()) error = 'Title is required';
                break;
            case 'shortDescription':
                // if (!value?.toString().trim()) error = 'Short description is required';
                break;
            case 'longDescription':
                // if (!value?.toString().trim()) error = 'Long description is required';
                break;
            case 'priority':
                // if (!value || isNaN(Number(value))) error = 'Priority is required and must be a number';
                // else if (parseInt(value.toString()) < 0) error = 'Priority must be a non-negative number';
                break;
            case 'level':
                // if (!value?.toString().trim()) error = 'Level is required';
                break;
            case 'userLevelID':
                if (formType === 'Star Store') {
                    if (!value?.toString().trim()) error = 'User level is required';
                }
                break;
            case 'beginDate':
                // if (!value) error = 'Start date is required';
                // else if (isNaN(Date.parse(value))) error = 'Start date must be a valid date';
                break;
            case 'endDate':
                // if (!value) error = 'End date is required';
                // else if (isNaN(Date.parse(value))) error = 'End date must be a valid date';
                // else if (data?.beginDate && new Date(value as string) < new Date(data.beginDate as string)) {
                //     error = 'End date must be after start date';
                // }
                break;
            case 'discountType':
                // if (!value?.toString().trim()) error = 'Please select a discount type';
                break;
            case 'discountAmount':
                // if (data?.discountType === 'dollar') {
                //     if (!value || isNaN(Number(value)) || parseFloat(value.toString()) <= 0) {
                //         error = 'Please enter a valid dollar amount';
                //     }
                // }
                break;
            case 'discountPercent':
                // if (data?.discountType === 'percent') {
                //     if (!value || isNaN(Number(value))) {
                //         error = 'Please enter a valid percentage';
                //     } else if (parseFloat(value.toString()) <= 0 || parseFloat(value.toString()) > 100) {
                //         error = 'Percentage must be between 0 and 100';
                //     }
                // }
                break;
            case 'couponsAvailable':
                // if (!value) error = 'Customer quantity is required';
                // else if (isNaN(Number(value)) || parseInt(value.toString()) < 1) {
                //     error = 'Customer quantity must be a positive number';
                // }
                break;
            case 'couponUsageCount':
                // if (value && (isNaN(Number(value)) || parseInt(value.toString()) < 1)) {
                //     error = 'Customer quantity must be a positive number';
                // }
                break;
            case 'purpleCoins':
                // if (!value) error = 'Redeem amount is required';
                // else if (isNaN(Number(value)) || parseInt(value.toString()) < 1) {
                //     error = 'Redeem amount must be a positive number';
                // }
                break;
            case 'url':
                // try {
                //     if (!value?.toString().trim()) {
                //         error = 'URL is required';
                //     } else {
                //         const url = new URL(value.toString());
                //         if (!['http:', 'https:'].includes(url.protocol)) {
                //             error = 'URL must start with http or https';
                //         }
                //     }
                // } catch {
                //     error = 'URL must be valid';
                // }
                break;
            default:
                break;
        }

        return error;
    };

    const validateForm = (data: SponsorData): boolean => {
        const newErrors: Partial<FormErrors> = {};
        let hasErrors = false;

        // Map SponsorData keys to FormErrors keys for validation
        const fieldMap: { [key in keyof SponsorData]?: keyof FormErrors } = {
            sponsor: 'sponsor',
            stockKeepingUnit: 'stockKeepingUnit',
            title: 'title',
            shortDescription: 'shortDescription',
            longDescription: 'longDescription',
            priority: 'priority',
            level: 'level',
            userLevelID: 'userLevelID',
            beginDate: 'beginDate',
            endDate: 'endDate',
            discountType: 'discountType',
            discountAmount: 'discountAmount',
            discountPercent: 'discountPercent',
            couponsAvailable: 'couponsAvailable',
            purpleCoins: 'purpleCoins',
            url: 'url',
        };

        // Validate each field
        Object.keys(fieldMap).forEach(key => {
            const sponsorKey = key as keyof SponsorData;
            const errorKey = fieldMap[sponsorKey] as keyof FormErrors;

            if (errorKey) {
                const error = validateField(sponsorKey, data[sponsorKey], data);
                if (error) {
                    newErrors[errorKey] = error;
                    hasErrors = true;
                } else {
                    newErrors[errorKey] = '';
                }
            }
        });

        // Additional cross-field validations
        if (data.discountType === 'dollar' && !data.discountAmount) {
            newErrors.discountAmount = 'Dollar amount is required for dollar discount type';
            hasErrors = true;
        }

        if (data.discountType === 'percent' && !data.discountPercent) {
            newErrors.discountPercent = 'Percentage is required for percent discount type';
            hasErrors = true;
        }

        setErrors(newErrors as FormErrors);
        return !hasErrors;
    };

    const isValidUrl = (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        let newValue = type === 'checkbox' ? checked : value;

        // Convert date inputs to ISO format
        if (type === 'date' && value) {
            newValue = `${value}T00:00:00Z`;
        }

        // Convert percent discount to decimal and clear discountAmount
        if (name === 'discountPercent' && value) {
            newValue = String(parseFloat(value) / 100);
            setFormData(prev => ({
                ...prev,
                discountAmount: '' // Clear discountAmount when discountPercent is set
            }));
        }
        // Clear percentage when adding a dollar amount
        if (name === 'discountAmount' && value) {
            setFormData(prev => ({
                ...prev,
                discountPercent: '' // Clear discountAmount when discountPercent is set
            }));
        }

        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));

        // Convert form field name to SponsorData key for validation
        const sponsorDataKey = name as keyof SponsorData;
        const error = validateField(sponsorDataKey, newValue, {
            ...formData,
            [sponsorDataKey]: newValue
        });

        // Map SponsorData key to FormErrors key
        const errorKey = name as keyof FormErrors;
        setErrors(prev => ({
            ...prev,
            [errorKey]: error
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        const isValid = validateForm(formData);
        if (!isValid) {
            setError('Please fix the errors in the form');
            return;
        }

        setLoading(true);
        setSubmitting(true);
        setError('');

        // Combine form data with media list
        const combinedData = {
            ...formData,
            media: mediaList
        };

        let success = true;
        try {
            if (FormData) {
                if (MediaList) {
                    // Grabbing media that was deleted to delete from s3
                    const removedMedia = MediaList.filter(originalItem => {
                        return removedMediaList.some(removedItem =>
                            removedItem.id === originalItem.id
                        );
                    });
                    await editSponsor(FormData.id as string, combinedData, removedMedia);
                }
                else {
                    await editSponsor(FormData.id as string, combinedData, []);
                }
            }
            else await addSponsor(combinedData);
        } catch (err) {
            success = false;
            console.error(err);
            setError('Failed to add sponsor. Please try again.');
        } finally {
            setSubmitting(false);
            setLoading(false);
        }

        if (success) router.push('/');
    };

    // Helper function to render required asterisk based on field and form type
    const renderRequiredAsterisk = (fieldName: string): React.JSX.Element | null => {
        const alwaysRequired = ['sponsor', 'title'];

        if (alwaysRequired.includes(fieldName)) {
            return <span className="text-red-500">*</span>;
        }

        return null;
    };

    // If the media form is showing, render it instead of the sponsor form
    if (showMediaForm) {
        return (
            <div className="bg-slate-800 min-h-screen">
                <div className="max-w-6xl mx-auto p-6">
                    <MediaForm
                        id={formData.id || ''}
                        onBack={() => setShowMediaForm(false)}
                        onSave={handleMediaSave}
                        setError={setError}
                    />
                </div>
            </div>
        );
    }

    // Otherwise, render the sponsor form
    return (
        <div className="bg-slate-800 min-h-screen">
            <div className="max-w-6xl mx-auto p-6">
                <div className="bg-slate-900 rounded-lg shadow-xl overflow-hidden">
                    <form autoComplete="off" onSubmit={handleSubmit}>
                        {/* Form Header */}
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Sponsor Details</h2>
                                <p className="text-slate-400 mt-1">Complete all required fields</p>
                            </div>
                        </div>

                        {/* Media List Section - Only shown when media has been added */}
                        {mediaList.length > 0 && (
                            <div className="p-6 border-b border-slate-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-white">Media Assets</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {mediaList.map(media => (
                                        <div key={media.id as string} className="bg-slate-800 rounded-lg overflow-hidden shadow-md">
                                            <div className="relative aspect-video">
                                                {media.contentType?.includes('image') ? (
                                                    <img
                                                        src={(media.url || media.thumbnailURL || media.previewUrl) as string}
                                                        alt={"Couldn't Load Media"}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <video
                                                        src={media.previewUrl as string}
                                                        className="w-full h-full object-cover"
                                                        muted
                                                        controls={false}
                                                        preload="metadata"
                                                        poster={(media.url || media.thumbnailURL || media.previewUrl) as string || ''}
                                                        onClick={(e) => {
                                                            // Toggle play/pause on click
                                                            if (e.currentTarget.paused) {
                                                                e.currentTarget.play();
                                                            } else {
                                                                e.currentTarget.pause();
                                                            }
                                                        }}
                                                    />
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeMedia(media.id)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                                >
                                                    <FiXCircle size={18} />
                                                </button>
                                            </div>
                                            <div className="p-3">
                                                <div className="mt-1 flex justify-between text-xs text-slate-500">
                                                    <span>{media.contentType?.toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Media Teaser - Only shown when no media has been added */}
                        {mediaList.length === 0 && (
                            <div className="p-6 border-b border-slate-700 bg-slate-800">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-medium text-white mb-1">Media Assets</h3>
                                        <p className="text-slate-400">Add images or videos for this sponsor</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={toggleMediaForm}
                                        className="px-5 py-2.5 bg-gradient-to-r from-[#EECB6C] to-[#C8A560] hover:from-[#C8A560] hover:to-[#B89550] text-slate-900 font-semibold rounded-md flex items-center transition-all duration-200"
                                    >
                                        <FiImage className="mr-2" />
                                        Add Media
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Basic Information */}
                        <div className="p-6 border-b border-slate-700">
                            <h3 className="text-lg font-medium text-white mb-4">Basic Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Sponsor Name */}
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="sponsor">
                                        Sponsor Name {renderRequiredAsterisk('sponsor')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiTag className="text-slate-500" />
                                        </div>
                                        <input
                                            className={`bg-slate-700 border ${errors.sponsor ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                            id="sponsor"
                                            name="sponsor"
                                            type="text"
                                            value={ensureStringValue(formData.sponsor as string)}
                                            onChange={handleChange}
                                            placeholder="e.g. Virgin Atlantic"
                                        />
                                    </div>
                                    {errors.sponsor && (
                                        <p className="mt-2 text-sm text-red-500">{errors.sponsor}</p>
                                    )}
                                </div>

                                {/* SKU */}
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="stockKeepingUnit">
                                        SKU {renderRequiredAsterisk('stockKeepingUnit')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiBox className="text-slate-500" />
                                        </div>
                                        <input
                                            className={`bg-slate-700 border ${errors.stockKeepingUnit ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                            id="stockKeepingUnit"
                                            name="stockKeepingUnit"
                                            type="text"
                                            value={ensureStringValue(formData.stockKeepingUnit as string)}
                                            onChange={handleChange}
                                            placeholder="e.g. VA-PREM-2025"
                                        />
                                    </div>
                                    {errors.stockKeepingUnit && (
                                        <p className="mt-2 text-sm text-red-500">{errors.stockKeepingUnit}</p>
                                    )}
                                </div>

                                {/* Active Status */}
                                <div className="col-span-1 col-start-3">
                                    <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="active">
                                        Active Status
                                    </label>
                                    <div >
                                        <label className="relative inline-flex items-center cursor-pointer mt-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.active === true}
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        active: isChecked
                                                    }));
                                                }}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer 
                                                peer-checked:after:translate-x-full peer-checked:after:border-white 
                                                after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                                after:bg-white after:border-gray-300 after:border after:rounded-full 
                                                after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500">
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Title */}
                                <div className="col-span-3">
                                    <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="title">
                                        Title {renderRequiredAsterisk('title')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiType className="text-slate-500" />
                                        </div>
                                        <input
                                            className={`bg-slate-700 border ${errors.title ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                            id="title"
                                            name="title"
                                            type="text"
                                            value={ensureStringValue(formData.title as string)}
                                            onChange={handleChange}
                                            placeholder="Display title"
                                        />
                                    </div>
                                    {errors.title && (
                                        <p className="mt-2 text-sm text-red-500">{errors.title}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description & Details */}
                        <div className="p-6 border-b border-slate-700">
                            <h3 className="text-lg font-medium text-white mb-4">Description & Details</h3>

                            <div className="grid grid-cols-1 gap-6">
                                {/* Short Description */}
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="shortDescription">
                                        Short Description {renderRequiredAsterisk('shortDescription')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute top-3 left-3 pointer-events-none">
                                            <FiAlignLeft className="text-slate-500" />
                                        </div>
                                        <textarea
                                            className={`bg-slate-700 border ${errors.shortDescription ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                            id="shortDescription"
                                            name="shortDescription"
                                            rows={2}
                                            value={ensureStringValue(formData.shortDescription as string)}
                                            onChange={handleChange}
                                            placeholder="Brief description"
                                        />
                                    </div>
                                    {errors.shortDescription && (
                                        <p className="mt-2 text-sm text-red-500">{errors.shortDescription}</p>
                                    )}
                                </div>

                                {/* Long Description */}
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="longDescription">
                                        Long Description {renderRequiredAsterisk('longDescription')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute top-3 left-3 pointer-events-none">
                                            <FiList className="text-slate-500" />
                                        </div>
                                        <textarea
                                            className={`bg-slate-700 border ${errors.longDescription ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                            id="longDescription"
                                            name="longDescription"
                                            rows={4}
                                            value={ensureStringValue(formData.longDescription as string)}
                                            onChange={handleChange}
                                            placeholder="Detailed description"
                                        />
                                    </div>
                                    {errors.longDescription && (
                                        <p className="mt-2 text-sm text-red-500">{errors.longDescription}</p>
                                    )}
                                </div>

                                {/* URL */}
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="url">
                                        URL {renderRequiredAsterisk('url')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiLink className="text-slate-500" />
                                        </div>
                                        <input
                                            className={`bg-slate-700 border ${errors.url ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                            id="url"
                                            name="url"
                                            type="text"
                                            value={ensureStringValue(formData.url as string)}
                                            onChange={handleChange}
                                            placeholder="https://example.com/promo"
                                        />
                                        {errors.url && (
                                            <p className="mt-1 text-sm text-red-500">{errors.url}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Classification */}
                        <div className="p-6 border-b border-slate-700">
                            <h3 className="text-lg font-medium text-white mb-4">Classification</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Priority */}
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="priority">
                                        Priority {renderRequiredAsterisk('priority')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiBarChart2 className="text-slate-500" />
                                        </div>
                                        <select
                                            className={`bg-slate-700 border ${errors.priority ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                            id="priority"
                                            name="priority"
                                            value={ensureStringValue(formData.priority as string)}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select priority</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                        </select>
                                    </div>
                                    {errors.priority && (
                                        <p className="mt-2 text-sm text-red-500">{errors.priority}</p>
                                    )}
                                </div>

                                {/* Level */}
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="level">
                                        Level {renderRequiredAsterisk('level')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiLayers className="text-slate-500" />
                                        </div>
                                        <select
                                            className={`bg-slate-700 border ${errors.level ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                            id="level"
                                            name="level"
                                            value={ensureStringValue(formData.level as string)}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select level</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                            <option value="5">5</option>
                                        </select>
                                    </div>
                                    {errors.level && (
                                        <p className="mt-2 text-sm text-red-500">{errors.level}</p>
                                    )}
                                </div>

                                {/* User Level - Only shown for Star Store type */}
                                {formType === 'Star Store' && (
                                    <div>
                                        <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="userLevelID">
                                            User Level of Access {renderRequiredAsterisk('userLevelID')}
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiUsers className="text-slate-500" />
                                            </div>
                                            <select
                                                className={`bg-slate-700 border ${errors.userLevelID ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                                id="userLevelID"
                                                name="userLevelID"
                                                value={formData.userLevelID || ""}
                                                onChange={(e) => {
                                                    const selectedLevelId = e.target.value;
                                                    const selectedLevel = userLevels.find(level => level.id === selectedLevelId);

                                                    setFormData(prev => ({
                                                        ...prev,
                                                        userLevelID: selectedLevelId,
                                                        userLevel: selectedLevel || null
                                                    }));

                                                    // Clear any errors
                                                    setErrors(prev => ({
                                                        ...prev,
                                                        userLevelID: ''
                                                    }));
                                                }}
                                            >
                                                <option value="">Select user level</option>
                                                {userLevels.map(level => (
                                                    <option key={level.id} value={level.id}>
                                                        {level.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.userLevelID && (
                                            <p className="mt-2 text-sm text-red-500">{errors.userLevelID}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Availability & Promotion */}
                        <div className="p-6 border-b border-slate-700">
                            <h3 className="text-lg font-medium text-white mb-4">Availability & Promotion</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Start Date */}
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="beginDate">
                                        Start Date {renderRequiredAsterisk('beginDate')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            className={`bg-slate-700 border ${errors.beginDate ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-3 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                            id="beginDate"
                                            name="beginDate"
                                            type="date"
                                            value={formData.beginDate ? formatDateSponsor(formData.beginDate) : ensureStringValue(formData.beginDate)}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {errors.beginDate && (
                                        <p className="mt-2 text-sm text-red-500">{errors.beginDate}</p>
                                    )}
                                </div>

                                {/* End Date */}
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="endDate">
                                        End Date {renderRequiredAsterisk('endDate')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            className={`bg-slate-700 border ${errors.endDate ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-3 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                            id="endDate"
                                            name="endDate"
                                            type="date"
                                            value={formData.endDate ? formatDateSponsor(formData.endDate) : ensureStringValue(formData.endDate)}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {errors.endDate && (
                                        <p className="mt-2 text-sm text-red-500">{errors.endDate}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Discount Details */}
                        <div className="p-6 border-b border-slate-700">
                            <h3 className="text-lg font-medium text-white mb-4">Discount Details</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Discount Type */}
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="discountType">
                                        Discount Type {renderRequiredAsterisk('discountType')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiDollarSign className="text-slate-500" />
                                        </div>
                                        <select
                                            className={`bg-slate-700 border ${errors.discountType ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                            id="discountType"
                                            name="discountType"
                                            value={ensureStringValue(formData.discountType as string)}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select discount type</option>
                                            <option value="dollar">Dollar Amount</option>
                                            <option value="percent">Percentage</option>
                                        </select>
                                    </div>
                                    {errors.discountType && (
                                        <p className="mt-2 text-sm text-red-500">{errors.discountType}</p>
                                    )}
                                </div>

                                {/* Redeem Amount (Purple Coins) */}
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="purpleCoins">
                                        Redeem Amount (Points) {renderRequiredAsterisk('purpleCoins')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiDollarSign className="text-slate-500" />
                                        </div>
                                        <input
                                            className={`bg-slate-700 border ${errors.purpleCoins ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                            id="purpleCoins"
                                            name="purpleCoins"
                                            min="1"
                                            value={ensureStringValue(formData.purpleCoins as string)}
                                            onChange={handleChange}
                                            placeholder="e.g. 500"
                                        />
                                        {errors.purpleCoins && (
                                            <p className="mt-1 text-sm text-red-500">{errors.purpleCoins}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Dollar Amount (shown only if discount type is dollar) */}
                                {formData.discountType === 'dollar' && (
                                    <div>
                                        <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="discountAmount">
                                            Dollar Amount {renderRequiredAsterisk('discountAmount')}
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiDollarSign className="text-slate-500" />
                                            </div>
                                            <input
                                                className={`bg-slate-700 border ${errors.discountAmount ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                                id="discountAmount"
                                                name="discountAmount"
                                                min="0.01"
                                                step="0.01"
                                                value={ensureStringValue(formData.discountAmount as string)}
                                                onChange={handleChange}
                                                placeholder="e.g. 25.99"
                                            />
                                        </div>
                                        {errors.discountAmount && (
                                            <p className="mt-2 text-sm text-red-500">{errors.discountAmount}</p>
                                        )}
                                    </div>
                                )}

                                {/* Percent Amount (shown only if discount type is percent) */}
                                {formData.discountType === 'percent' && (
                                    <div>
                                        <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="discountPercent">
                                            Percentage {renderRequiredAsterisk('discountPercent')}
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiPercent className="text-slate-500" />
                                            </div>
                                            <input
                                                className={`bg-slate-700 border ${errors.discountPercent ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                                id="discountPercent"
                                                name="discountPercent"
                                                min="0.1"
                                                max="100"
                                                step="0.1"
                                                value={ensureStringValue(formData.discountPercent! as number * 100)}
                                                onChange={handleChange}
                                                placeholder="e.g. 25"
                                            />
                                        </div>
                                        {errors.discountPercent && (
                                            <p className="mt-2 text-sm text-red-500">{errors.discountPercent}</p>
                                        )}
                                    </div>
                                )}

                                {/* Quantity */}
                                <div className='col-span-1 col-start-2'>
                                    <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="couponsAvailable">
                                        Quantity {renderRequiredAsterisk('couponsAvailable')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiUser className="text-slate-500" />
                                        </div>
                                        <input
                                            className={`bg-slate-700 border ${errors.couponsAvailable ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                            id="couponsAvailable"
                                            name="couponsAvailable"
                                            min="1"
                                            value={ensureStringValue(formData.couponsAvailable as string)}
                                            onChange={handleChange}
                                            placeholder="e.g. 0"
                                        />
                                        {errors.couponsAvailable && (
                                            <p className="mt-1 text-sm text-red-500">{errors.couponsAvailable}</p>
                                        )}
                                    </div>
                                </div>
                                {/* Customer Quantity */}
                                <div className='col-span-1 col-start-2'>
                                    <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="couponUsageCount">
                                        Per Customer Limit
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiUser className="text-slate-500" />
                                        </div>
                                        <input
                                            className={`bg-slate-700 border ${errors.couponUsageCount ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                            id="couponUsageCount"
                                            name="couponUsageCount"
                                            min="1"
                                            placeholder="Leave blank for unlimited"
                                            value={ensureStringValue(formData.couponUsageCount)}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.couponUsageCount && (
                                        <p className="mt-2 text-sm text-red-500">{errors.couponUsageCount}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="p-6 flex items-center justify-end space-x-4">
                            <Link href="/">
                                <button type="button" className="px-4 py-2 border border-slate-600 text-slate-300 rounded-md hover:bg-slate-700 transition-colors">
                                    Cancel
                                </button>
                            </Link>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-gradient-to-r from-[#EECB6C] to-[#C8A560] hover:from-[#C8A560] hover:to-[#B89550] text-slate-900 font-semibold rounded-md flex items-center transition-all duration-200 disabled:opacity-50"
                                disabled={submitting}
                            >
                                <FiSave className="mr-2" />
                                {submitting ? 'Saving...' : 'Save Sponsor'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}