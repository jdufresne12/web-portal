'use client'
import * as React from 'react';
import { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    FiTag,
    FiBox,
    FiHash,
    FiDollarSign,
    FiUser,
    FiLink,
    FiType,
    FiPercent,
    FiSave,
    FiAlignLeft,
    FiList,
    FiLayers,
    FiImage,
    FiPlus,
    FiXCircle
} from 'react-icons/fi';
import { useSponsorsContext } from '../../contexts/SponsorsContext';
import { SponsorData, FormErrors, MediaDTO, SponsorFormProps } from '../../types/form-types';
import { formatDateSponsor, generateUUID } from '../../utils/utils';

import MediaForm from './MediaForm';
import MultipleDateRange from '../MultipleDateRange';


// Move emptyFormData creation inside the component to generate fresh UUIDs
const createEmptyFormData = (): SponsorData => ({
    id: generateUUID(), // Fresh UUID each time
    sponsor: "",
    type: '',
    title: "",
    subtitle: "",
    description: "",
    summary: "",
    couponCode: "",
    discountType: "",
    discountAmount: "",
    discountPercent: "",
    couponsAvailable: 0,
    couponUsageCount: "",
    url: "",
    urlTitle: "",
    glowing: false,
    order: "",
    beginDate: "",
    endDate: "",
    active: true
});

const emptyErrors: FormErrors = {
    sponsor: '',
    title: '',
    glowing: '',
    subtitle: '',
    description: '',
    summary: '',
    order: '',
    beginDate: '',
    endDate: '',
    couponCode: '',
    discountType: '',
    discountAmount: '',
    discountPercent: '',
    couponsAvailable: '',
    couponUsageCount: '',
    url: '',
    urlTitle: ''
};

export default function SponsorForm({
    setLoading,
    setError,
    FormData,
    MediaList,
    formType = 'Title'
}: SponsorFormProps) {
    const { addSponsor, editSponsor } = useSponsorsContext();
    const router = useRouter();
    const initialLoadComplete = useRef(false);

    // Form States
    const [formData, setFormData] = useState<SponsorData>(
        FormData ? { ...createEmptyFormData(), ...FormData } : createEmptyFormData()
    );
    const [errors, setErrors] = useState<FormErrors>(emptyErrors);
    const [showDateRange, setShowDateRange] = useState<boolean>(formType === 'Hot Flash');
    const [submitting, setSubmitting] = useState<boolean>(false);

    // Media States
    const [showMediaForm, setShowMediaForm] = useState<boolean>(false);
    const [mediaList, setMediaList] = useState<MediaDTO[]>(MediaList || []);
    const [removedMediaList, setRemovedMediaList] = useState<MediaDTO[]>([]);

    // Clean up URLs when component unmounts
    useEffect(() => {
        return () => {
            if (mediaList.length > 0) {
                mediaList.forEach(media => {
                    if (media.previewUrl) {
                        URL.revokeObjectURL(media.previewUrl as string);
                    }
                });
            }
        };
    }, []);

    useEffect(() => {
        if (formType === "Hot Flash") {
            setShowDateRange(true);
        } else {
            setShowDateRange(false);
        }
        setFormData({ ...createEmptyFormData(), type: formType })
        setMediaList([]);
        setErrors(emptyErrors);

        initialLoadComplete.current = false;
    }, [formType]);

    useEffect(() => {
        if (FormData && !initialLoadComplete.current) {
            setFormData(prevData => ({
                ...createEmptyFormData(),
                ...prevData,
                ...FormData,
            }));

            if (MediaList) {
                setMediaList(MediaList);
            }

            initialLoadComplete.current = true;
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

    const validateField = (name: keyof FormErrors, value: any, formData: Partial<SponsorData>): string => {
        let error = "";

        // Define which fields are required based on the form type
        const isRequired = {
            subtitle: formType === 'Hot Flash',
            description: formType === 'Hot Flash',
            summary: formType === 'Hot Flash'
        };

        switch (name) {
            case 'sponsor':
                if (!value?.toString().trim()) error = 'Sponsor name is required';
                break;
            case 'title':
                if (!value.toString().trim()) error = 'Title is required';
                break;
            case 'glowing':
                // Optional field
                break;
            case 'subtitle':
                // if (isRequired.subtitle && !value?.toString().trim()) error = 'Subtitle is required';
                break;
            case 'description':
                // if (isRequired.description && !value?.toString().trim()) error = 'Description is required';
                // else if (value?.toString().length > 500) error = 'Description must be less than 500 characters';
                break;
            case 'summary':
                // if (isRequired.summary && !value?.toString().trim()) error = 'Summary is required';
                break;
            case 'order':
                // if (!value) error = 'Display order is required';
                // else if (isNaN(Number(value)) || parseInt(value.toString()) < 1) error = 'Order must be a positive number';
                break;
            case 'beginDate':
                // if (!value) error = 'Start date is required';
                break;
            case 'endDate':
                // if (!value) error = 'End date is required';
                // else if (value && formData?.beginDate && new Date(value as string) < new Date(formData.beginDate as string)) {
                //     error = 'End date must be after start date';
                // }
                break;
            case 'couponCode':
                // if (!value?.toString().trim()) error = "Coupon Code is required"
                break;
            case 'discountType':
                // if (!value) error = 'Please select a discount type';
                break;
            case 'discountAmount':
                // if (formData?.discountType === 'dollar' && (!value || isNaN(Number(value)) || parseFloat(value.toString()) <= 0)) {
                //     error = 'Please enter a valid dollar amount';
                // }
                break;
            case 'discountPercent':
                // if (formData?.discountType === 'percent') {
                //     if (!value || isNaN(Number(value))) {
                //         error = 'Please enter a valid percentage';
                //     } else if (parseFloat(value.toString()) <= 0 || parseFloat(value.toString()) > 100) {
                //         error = 'Percentage must be between 0 and 100';
                //     }
                // }
                break;
            case 'couponsAvailable':
                // if (!value) error = 'Quantity is required';
                // else if (isNaN(Number(value)) || parseInt(value.toString()) < 1) error = 'Quantity must be a positive number';
                break;
            case 'couponUsageCount':
                // if (value && (isNaN(Number(value)) || parseInt(value.toString()) < 1)) {
                //     error = 'Customer quantity must be a positive number';
                // }
                break;
            case 'url':
                // if (value && !isValidUrl(value.toString())) {
                //     error = 'Please enter a valid URL';
                // }
                break;
            case 'urlTitle':
                // Optional field
                break;
            default:
                break;
        }

        return error;
    };

    const validateForm = (formData: SponsorData): boolean => {
        const newErrors: Partial<FormErrors> = {};
        let hasErrors = false;

        // Validate each field
        (Object.keys(errors) as Array<keyof FormErrors>).forEach(fieldName => {
            const error = validateField(fieldName, formData[fieldName], formData);
            if (error) {
                newErrors[fieldName] = error;
                hasErrors = true;
            } else {
                newErrors[fieldName] = '';
            }
        });

        // Additional cross-field validations
        if (formData.discountType === 'dollar' && !formData.discountAmount) {
            newErrors.discountAmount = 'Dollar amount is required for dollar discount type';
            hasErrors = true;
        }

        if (formData.discountType === 'percent' && !formData.discountPercent) {
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

        // Convert string "true"/"false" to actual boolean
        if (name === 'glowing') {
            newValue = value === 'true' ? true : false;
        }

        // Update form data
        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));

        // Validate the changed field
        const error = validateField(name as keyof FormErrors, newValue, {
            ...formData,
            [name]: newValue
        });

        // Update errors state for this field
        setErrors(prev => ({
            ...prev,
            [name]: error
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
            setError('Failed to add sponsor. Please try again.');
            success = false;
            console.error(err);
            setLoading(false);
        } finally {
            setSubmitting(false);
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
            <div className="max-w-6xl mx-auto p-6">
                <MediaForm
                    id={formData.id || ''}
                    onBack={() => setShowMediaForm(false)}
                    onSave={handleMediaSave}
                    setError={setError}
                    formType='sponsor'
                />
            </div>
        );
    }

    // Otherwise, render the sponsor form
    return (
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
                                <button
                                    type="button"
                                    onClick={toggleMediaForm}
                                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-md flex items-center text-sm transition-colors"
                                >
                                    <FiPlus className="mr-1" />
                                    Add More
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {mediaList.map(media => (
                                    <div key={media.id.toString()} className="bg-slate-800 rounded-lg overflow-hidden shadow-md">
                                        <div className="relative aspect-video">
                                            {media.contentType && media.contentType.toString().includes('image') ? (
                                                <img
                                                    src={(media.url || media.thumbnailURL || media.previewUrl) as string}
                                                    alt={"Couldn't Load Media"}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <video
                                                    src={(media.url || media.thumbnailURL || media.previewUrl) as string}
                                                    className="w-full h-full object-cover"
                                                    muted
                                                    controls={false}
                                                    preload="metadata"
                                                    poster={media.thumbnailURL as string || ''}
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
                                            <div className="mt-2 flex justify-between text-xs text-slate-500">
                                                <span>{media.contentType ? media.contentType.toString().split('/')[0].toUpperCase() : ''}</span>
                                                <span>{media.tag}</span>
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
                            <div className="col-span-1">
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
                                        value={ensureStringValue(formData.sponsor)}
                                        onChange={handleChange}
                                        placeholder="e.g. Virgin Atlantic"
                                    />
                                </div>
                                {errors.sponsor && (
                                    <p className="mt-2 text-sm text-red-500">{errors.sponsor}</p>
                                )}
                            </div>

                            {/* Glowing Title */}
                            <div className="col-span-1">
                                <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="glowing">
                                    Glowing Title
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiLayers className="text-slate-500" />
                                    </div>
                                    <select
                                        className={`bg-slate-700 border ${errors.glowing ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                        id="glowing"
                                        name="glowing"
                                        value={String(formData.glowing)}
                                        onChange={handleChange}
                                    >
                                        <option value="true">True</option>
                                        <option value="false">False</option>
                                    </select>
                                </div>
                                {errors.glowing && (
                                    <p className="mt-2 text-sm text-red-500">{errors.glowing}</p>
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
                                        value={ensureStringValue(formData.title)}
                                        onChange={handleChange}
                                        placeholder="Main title"
                                    />
                                </div>
                                {errors.title && (
                                    <p className="mt-2 text-sm text-red-500">{errors.title}</p>
                                )}
                            </div>

                            {/* Subtitle */}
                            <div className="col-span-3">
                                <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="subtitle">
                                    Subtitle {renderRequiredAsterisk('subtitle')}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiType className="text-slate-500" />
                                    </div>
                                    <input
                                        className={`bg-slate-700 border ${errors.subtitle ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                        id="subtitle"
                                        name="subtitle"
                                        type="text"
                                        value={ensureStringValue(formData.subtitle)}
                                        onChange={handleChange}
                                        placeholder="Subtitle"
                                    />
                                </div>
                                {errors.subtitle && (
                                    <p className="mt-2 text-sm text-red-500">{errors.subtitle}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description & Details */}
                    <div className="p-6 border-b border-slate-700">
                        <h3 className="text-lg font-medium text-white mb-4">Description & Details</h3>

                        <div className="grid grid-cols-1 gap-6">
                            {/* Description */}
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="description">
                                    Description {renderRequiredAsterisk('description')}
                                </label>
                                <div className="relative">
                                    <div className="absolute top-3 left-3 pointer-events-none">
                                        <FiList className="text-slate-500" />
                                    </div>
                                    <textarea
                                        className={`bg-slate-700 border ${errors.description ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                        id="description"
                                        name="description"
                                        rows={4}
                                        value={ensureStringValue(formData.description)}
                                        onChange={handleChange}
                                        placeholder="Detailed description"
                                    />
                                </div>
                                {errors.description && (
                                    <p className="mt-2 text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>

                            {/* Summary */}
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="summary">
                                    Summary {renderRequiredAsterisk('summary')}
                                </label>
                                <div className="relative">
                                    <div className="absolute top-3 left-3 pointer-events-none">
                                        <FiAlignLeft className="text-slate-500" />
                                    </div>
                                    <textarea
                                        className={`bg-slate-700 border ${errors.summary ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                        id="summary"
                                        name="summary"
                                        rows={2}
                                        value={ensureStringValue(formData.summary)}
                                        onChange={handleChange}
                                        placeholder="Brief summary"
                                    />
                                </div>
                                {errors.summary && (
                                    <p className="mt-2 text-sm text-red-500">{errors.summary}</p>
                                )}
                            </div>

                            {/* URL */}
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="url">
                                    URL
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
                                        value={ensureStringValue(formData.url)}
                                        onChange={handleChange}
                                        placeholder="https://example.com/promo"
                                    />
                                </div>
                                {errors.url && (
                                    <p className="mt-2 text-sm text-red-500">{errors.url}</p>
                                )}
                            </div>

                            {/* URL Title */}
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="urlTitle">
                                    URL Title
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiType className="text-slate-500" />
                                    </div>
                                    <input
                                        className={`bg-slate-700 border ${errors.urlTitle ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                        id="urlTitle"
                                        name="urlTitle"
                                        type="text"
                                        value={ensureStringValue(formData.urlTitle)}
                                        onChange={handleChange}
                                        placeholder="e.g. Visit Website"
                                    />
                                </div>
                                {errors.urlTitle && (
                                    <p className="mt-2 text-sm text-red-500">{errors.urlTitle}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Display Settings */}
                    <div className="p-6 border-b border-slate-700">
                        <h3 className="text-lg font-medium text-white mb-4">Display Settings</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Order */}
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="order">
                                    Display Order {renderRequiredAsterisk('order')}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiHash className="text-slate-500" />
                                    </div>
                                    <input
                                        className={`bg-slate-700 border ${errors.order ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                        id="order"
                                        name="order"
                                        min="1"
                                        value={ensureStringValue(formData.order)}
                                        onChange={handleChange}
                                        placeholder="e.g. 1"
                                    />
                                </div>
                                {errors.order && (
                                    <p className="mt-2 text-sm text-red-500">{errors.order}</p>
                                )}
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="couponsAvailable">
                                    Total Quantity {renderRequiredAsterisk('couponsAvailable')}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiBox className="text-slate-500" />
                                    </div>
                                    <input
                                        className={`bg-slate-700 border ${errors.couponsAvailable ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                        id="couponsAvailable"
                                        name="couponsAvailable"
                                        min="1"
                                        placeholder="e.g. 100"
                                        value={ensureStringValue(formData.couponsAvailable)}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.couponsAvailable && (
                                    <p className="mt-2 text-sm text-red-500">{errors.couponsAvailable}</p>
                                )}
                            </div>

                            {/* Customer Quantity */}
                            <div>
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

                    {/* Availability */}
                    {formType === 'Hot Flash' &&
                        <div className="p-6 border-b border-slate-700">
                            <h3 className="text-lg font-medium text-white mb-4">Availability </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {showDateRange ? (
                                    <MultipleDateRange
                                        beginDate={formData.beginDate || []}
                                        endDate={formData.endDate || []}
                                        beginDateError={errors.beginDate as string}
                                        endDateError={errors.endDate as string}
                                        onBeginDateChange={(dates) => {
                                            setFormData((prev: any) => ({
                                                ...prev,
                                                beginDate: dates
                                            }));

                                            // Clear any errors
                                            setErrors(prev => ({
                                                ...prev,
                                                beginDate: ''
                                            }));
                                        }}
                                        onEndDateChange={(dates) => {
                                            setFormData((prev: any) => ({
                                                ...prev,
                                                endDate: dates
                                            }));

                                            // Clear any errors
                                            setErrors(prev => ({
                                                ...prev,
                                                endDate: ''
                                            }));
                                        }}
                                        required={false}
                                        includeTime={true}
                                    />
                                ) : (
                                    <>
                                        {/* Start Date */}
                                        {/* <div>
                                            <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="beginDate">
                                                Start Date {renderRequiredAsterisk('beginDate')}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    className={`bg-slate-700 border ${errors.beginDate ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-3 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                                    id="beginDate"
                                                    name="beginDate"
                                                    type="date"
                                                    value={formData.beginDate ? formatDateSponsor(formData.beginDate as string) : ''}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            {errors.beginDate && (
                                                <p className="mt-2 text-sm text-red-500">{errors.beginDate}</p>
                                            )}
                                        </div> */}

                                        {/* End Date */}
                                        {/* <div>
                                            <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="endDate">
                                                End Date {renderRequiredAsterisk('endDate')}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    className={`bg-slate-700 border ${errors.endDate ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-3 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                                    id="endDate"
                                                    name="endDate"
                                                    type="date"
                                                    value={formData.endDate ? formatDateSponsor(formData.endDate as string) : ''}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            {errors.endDate && (
                                                <p className="mt-2 text-sm text-red-500">{errors.endDate}</p>
                                            )}
                                        </div> */}

                                    </>
                                )}

                            </div>
                        </div>
                    }

                    {/* Discount Details */}
                    <div className="p-6 border-b border-slate-700">
                        <h3 className="text-lg font-medium text-white mb-4">Discount Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Coupon Code */}
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="couponCode">
                                    Coupon Code {renderRequiredAsterisk('couponCode')}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiTag className="text-slate-500" />
                                    </div>
                                    <input
                                        className={`bg-slate-700 border ${errors.couponCode ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                        id="couponCode"
                                        name="couponCode"
                                        type="text"
                                        value={ensureStringValue(formData.couponCode)}
                                        onChange={handleChange}
                                        placeholder="e.g. SUMMER25"
                                    />
                                </div>
                                {errors.couponCode && (
                                    <p className="mt-2 text-sm text-red-500">{errors.couponCode}</p>
                                )}
                            </div>

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
                                        value={ensureStringValue(formData.discountType)}
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

                            {/* 1 column spacer */}
                            <div className='col-span-1'></div>

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
                                            value={ensureStringValue(formData.discountAmount)}
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
                                            value={ensureStringValue(formData.discountPercent! as number * 100 || 0)}
                                            onChange={handleChange}
                                            placeholder="e.g. 25"
                                        />
                                    </div>
                                    {errors.discountPercent && (
                                        <p className="mt-2 text-sm text-red-500">{errors.discountPercent}</p>
                                    )}
                                </div>
                            )}
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
    );
}