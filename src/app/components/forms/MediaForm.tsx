'use client'
import * as React from 'react';
import { useState, useEffect, useRef, FormEvent, ChangeEvent, DragEvent } from 'react';
import {
    FiImage,
    FiVideo,
    FiUpload,
    FiXCircle,
    FiAlertCircle,
    FiCheckCircle,
    FiSave,
    FiInfo,
    FiArrowLeft,
    FiLayout
} from 'react-icons/fi';
import { MediaDTO, MediaFormErrors, MediaFormProps, ImageConstraints, VideoConstraints } from '../../types/form-types';
import { generateUUID } from '../../utils/utils';

interface SectionConstraints {
    image: ImageConstraints;
    video: VideoConstraints;
}

interface MediaConstraints {
    [key: string]: SectionConstraints;
}

// Media info for preview display
interface MediaInfo {
    width: number;
    height: number;
    aspectRatio: number;
    format: string;
    duration?: number;
}

// Default Media validation constants for standard MediaForm
const DEFAULT_IMAGE_CONSTRAINTS: ImageConstraints = {
    aspectRatio: 16 / 9,
    minWidth: 1000,
    minHeight: 562,
    formats: ['image/jpeg'],
    formatNames: ['JPEG'],
};

const DEFAULT_VIDEO_CONSTRAINTS: VideoConstraints = {
    aspectRatios: [16 / 9, 9 / 16],
    minWidth: 640,
    minHeight: 480,
    formats: ['video/mp4', 'video/quicktime'],
    formatNames: ['MP4', 'MOV'],
};

// Media constraints by section type for SponsorMediaForm
const SECTION_MEDIA_CONSTRAINTS: MediaConstraints = {
    Main: {
        image: {
            aspectRatio: 16 / 9,
            minWidth: 1000,
            minHeight: 562,
            formats: ['image/jpeg'],
            formatNames: ['JPEG'],
        },
        video: {
            aspectRatios: [16 / 9, 9 / 16],
            minWidth: 640,
            minHeight: 480,
            formats: ['video/mp4', 'video/quicktime'],
            formatNames: ['MP4', 'MOV'],
        }
    },
    Header: {
        image: {
            aspectRatio: 16 / 9,
            minWidth: 1000,
            minHeight: 562,
            formats: ['image/jpeg'],
            formatNames: ['JPEG'],
        },
        video: {
            aspectRatios: [16 / 9, 9 / 16],
            minWidth: 640,
            minHeight: 480,
            formats: ['video/mp4', 'video/quicktime'],
            formatNames: ['MP4', 'MOV'],
        }
    },
    Section1: {
        image: {
            aspectRatio: 9 / 16,
            minWidth: 563,
            minHeight: 1000,
            formats: ['image/jpeg'],
            formatNames: ['JPEG'],
        },
        video: {
            aspectRatios: [9 / 16],
            minWidth: 0,
            minHeight: 0,
            formats: ['video/mp4', 'video/quicktime'],
            formatNames: ['MP4', 'MOV'],
        }
    },
    Section2: {
        image: {
            aspectRatio: 9 / 16,
            minWidth: 563,
            minHeight: 1000,
            formats: ['image/jpeg'],
            formatNames: ['JPEG'],
        },
        video: {
            aspectRatios: [9 / 16],
            minWidth: 0,
            minHeight: 0,
            formats: ['video/mp4', 'video/quicktime'],
            formatNames: ['MP4', 'MOV'],
        }
    }
};

export default function MediaForm({ id, onBack, onSave, setError = () => { }, formType = 'product' }: MediaFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isSponsorsForm = formType === 'sponsor';

    const [mediaData, setMediaData] = useState<MediaDTO>({
        id: generateUUID(),
        contentType: '',
        order: 0,
        file: null,
        previewUrl: '',
        tag: '',
        ...(formType === 'product' ? { productID: id } : { sponsorID: id })
    });
    const [mediaErrors, setMediaErrors] = useState<MediaFormErrors>({
        contentType: '',
        order: '',
        file: '',
        previewUrl: ''
    });
    const [dragActive, setDragActive] = useState<boolean>(false);
    const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
    const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);

    // Clean up preview URL when component unmounts
    useEffect(() => {
        return () => {
            if (mediaData.previewUrl && !uploadSuccess) {
                // Only revoke if we're truly unmounting and the upload wasn't successful
                URL.revokeObjectURL(mediaData.previewUrl);
            }
        };
    }, [mediaData.previewUrl, uploadSuccess]);

    const resetStates = () => {
        setMediaData({
            id: generateUUID(),
            contentType: '',
            order: 0,
            file: null,
            previewUrl: '',
            tag: '',
            ...(formType === 'product' ? { productID: id } : { sponsorID: id })
        });
        setMediaErrors({
            contentType: '',
            order: '',
            file: '',
            previewUrl: ''
        });
        setMediaInfo(null);
        setUploadSuccess(false);
        setSubmitting(false);
    };

    // Determine if the media is an image based on contentType
    const isImage = () => mediaData.contentType?.startsWith('image/') || false;

    // Helper function to extract media type (image/video) from contentType
    const getMediaType = (): 'image' | 'video' | '' => {
        if (!mediaData.contentType) return '';
        return mediaData.contentType.startsWith('image/') ? 'image' : 'video';
    };

    // Get appropriate Media Constraints based on media type and tag
    const getConstraints = (mediaType: 'image' | 'video' | '', tag?: string): ImageConstraints | VideoConstraints => {
        if (isSponsorsForm && tag) {
            return mediaType === 'image'
                ? SECTION_MEDIA_CONSTRAINTS[tag].image
                : SECTION_MEDIA_CONSTRAINTS[tag].video;
        } else {
            return mediaType === 'image' ? DEFAULT_IMAGE_CONSTRAINTS : DEFAULT_VIDEO_CONSTRAINTS;
        }
    };

    // Get appropriate accept attribute for file input
    const getAcceptAttribute = (): string => {
        const mediaType = getMediaType();
        if (!mediaType) {
            return '';
        }

        const constraints = getConstraints(mediaType, mediaData.tag);
        return constraints.formats.join(',');
    };

    // Field Validation Helper function
    const validateField = (name: keyof MediaDTO, value: any): string => {
        let error = "";

        switch (name) {
            case 'contentType':
                if (!value?.toString().trim()) error = 'Media type is required';
                break;
            case 'order':
                if (value === undefined || value === null) error = 'Order is required';
                else if (isNaN(Number(value)) || Number(value) <= 0) error = 'Order must be a positive number';
                break;
            case 'tag':
                if (isSponsorsForm && !value?.toString().trim()) error = 'App section type is required';
                break;
            case 'file':
                if (!value) error = 'Media file is required';
                break;
            default:
                break;
        }

        return error;
    };

    const validateForm = (formData: MediaDTO): boolean => {
        const newErrors: Partial<MediaFormErrors> = {};
        let hasErrors = false;

        // Validate required fields
        const fieldsToValidate: (keyof MediaDTO)[] = ['contentType', 'order', 'file'];
        if (isSponsorsForm) fieldsToValidate.push('tag');

        // Validate each field
        fieldsToValidate.forEach(fieldName => {
            const error = validateField(fieldName, formData[fieldName]);
            if (error) {
                if (fieldName === 'contentType') {
                    newErrors.contentType = error;
                } else if (fieldName === 'order') {
                    newErrors.order = error;
                } else if (fieldName === 'file') {
                    newErrors.file = error;
                } else if (fieldName === 'tag') {
                    newErrors.tage = error;
                }
                hasErrors = true;
            }
        });

        setMediaErrors({
            ...mediaErrors,
            ...newErrors
        });

        return !hasErrors;
    };

    const validateMediaFile = (file: File, mediaType: 'image' | 'video', tag?: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject('No file selected');
                return;
            }

            if (isSponsorsForm && !tag) {
                reject('Please select an app section type first');
                return;
            }

            const constraints = getConstraints(mediaType, tag);

            // Check file format
            if (!constraints.formats.includes(file.type)) {
                reject(`File must be ${constraints.formatNames.join(' or ')} format`);
                return;
            }

            // Create object URL for preview
            const objectUrl = URL.createObjectURL(file);

            if (mediaType === 'image') {
                const img = new Image();
                img.onload = () => {
                    const aspectRatio = img.width / img.height;
                    // Use type assertion to inform TypeScript we're working with ImageConstraints here
                    const imageConstraints = constraints as ImageConstraints;
                    const aspectRatioError = Math.abs(aspectRatio - imageConstraints.aspectRatio) > 0.01;

                    if (aspectRatioError) {
                        URL.revokeObjectURL(objectUrl); // Only revoke if validation fails
                        reject(`Image must have a ${imageConstraints.aspectRatio === 16 / 9 ? '16:9' : '9:16'} aspect ratio`);
                    } else if (img.width < imageConstraints.minWidth || img.height < imageConstraints.minHeight) {
                        URL.revokeObjectURL(objectUrl); // Only revoke if validation fails
                        reject(`Image must be at least ${imageConstraints.minWidth}x${imageConstraints.minHeight} pixels`);
                    } else {
                        setMediaInfo({
                            width: img.width,
                            height: img.height,
                            aspectRatio: parseFloat(aspectRatio.toFixed(2)),
                            format: file.type.split('/')[1].toUpperCase()
                        });
                        resolve(objectUrl);
                    }
                };
                img.onerror = () => {
                    URL.revokeObjectURL(objectUrl);
                    reject('Error loading image');
                };
                img.src = objectUrl;
            } else {
                // For video, we'll need to create a video element
                const video = document.createElement('video');
                video.preload = 'metadata';

                video.onloadedmetadata = () => {
                    // Check video dimensions and aspect ratio
                    const aspectRatio = video.videoWidth / video.videoHeight;
                    const videoConstraints = constraints as VideoConstraints;

                    // Check if aspect ratio is acceptable based on constraints
                    let aspectRatioValid = false;
                    if (Array.isArray(videoConstraints.aspectRatios)) {
                        aspectRatioValid = videoConstraints.aspectRatios.some(ratio =>
                            Math.abs(aspectRatio - ratio) < 0.1
                        );
                    } else if (videoConstraints.aspectRatio) {
                        aspectRatioValid = Math.abs(aspectRatio - videoConstraints.aspectRatio) < 0.1;
                    }

                    if (!aspectRatioValid) {
                        URL.revokeObjectURL(objectUrl); // Only revoke if validation fails
                        const ratioText = Array.isArray(videoConstraints.aspectRatios)
                            ? videoConstraints.aspectRatios.map(r => r === 16 / 9 ? '16:9' : '9:16').join(' or ')
                            : videoConstraints.aspectRatio === 16 / 9 ? '16:9' : '9:16';
                        reject(`Video must have ${ratioText} aspect ratio`);
                    } else if (videoConstraints.minWidth && videoConstraints.minHeight &&
                        (video.videoWidth < videoConstraints.minWidth || video.videoHeight < videoConstraints.minHeight)) {
                        URL.revokeObjectURL(objectUrl); // Only revoke if validation fails
                        reject(`Video must be at least ${videoConstraints.minWidth}x${videoConstraints.minHeight} pixels`);
                    } else {
                        setMediaInfo({
                            width: video.videoWidth,
                            height: video.videoHeight,
                            aspectRatio: parseFloat(aspectRatio.toFixed(2)),
                            format: file.type.split('/')[1].toUpperCase(),
                            duration: Math.round(video.duration)
                        });
                        resolve(objectUrl);
                    }
                };

                video.onerror = () => {
                    URL.revokeObjectURL(objectUrl);
                    reject('Error loading video');
                };

                video.src = objectUrl;
            }
        });
    };

    const handleMediaTypeChange = (e: ChangeEvent<HTMLSelectElement>): void => {
        const { value } = e.target;
        const contentType = value === 'image' ? 'image/jpeg' : value === 'video' ? 'video/mp4' : '';

        // Clear file and preview if media type changes
        if (mediaData.previewUrl) {
            URL.revokeObjectURL(mediaData.previewUrl);
        }

        setMediaData(prev => ({
            ...prev,
            contentType,
            file: null,
            previewUrl: ''
        }));

        setMediaInfo(null);
        setUploadSuccess(false);

        const error = validateField('contentType', contentType);

        setError('');
        setMediaErrors(prev => ({
            ...prev,
            contentType: error,
            file: ''
        }));
    };

    const handleTagChange = (e: ChangeEvent<HTMLSelectElement>): void => {
        const { value } = e.target;

        // Clear file and preview if tag changes
        if (mediaData.previewUrl) {
            URL.revokeObjectURL(mediaData.previewUrl);
        }

        setMediaData(prev => ({
            ...prev,
            tag: value,
            file: null,
            previewUrl: ''
        }));

        setMediaInfo(null);
        setUploadSuccess(false);

        const error = validateField('tag', value);

        setError('');
        setMediaErrors(prev => ({
            ...prev,
            tage: error,
            file: ''
        }));
    };

    const handleOrderChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { value } = e.target;
        const orderValue = parseInt(value, 10);

        setMediaData(prev => ({
            ...prev,
            order: isNaN(orderValue) ? 0 : orderValue
        }));

        const error = validateField('order', orderValue);

        setError('');
        setMediaErrors(prev => ({
            ...prev,
            order: error
        }));
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement> | File): Promise<void> => {
        let file: File | null = null;

        if ((e as File).name) {
            // If e is a File
            file = e as File;
        } else {
            // If e is an event
            const inputEvent = e as ChangeEvent<HTMLInputElement>;
            file = inputEvent.target?.files?.[0] || null;
        }

        if (!file || !mediaData.contentType || (isSponsorsForm && !mediaData.tag)) {
            return;
        }

        try {
            setError('');

            const mediaType = getMediaType();
            if (!mediaType) return;

            // Validate file dimensions and format
            const previewUrl = await validateMediaFile(file, mediaType, mediaData.tag);

            setMediaData(prev => ({
                ...prev,
                file: file,
                previewUrl: previewUrl,
                // Update width, height, and videoDurationInSeconds if we have mediaInfo
                ...(mediaInfo ? {
                    width: mediaInfo.width,
                    height: mediaInfo.height,
                    videoDurationInSeconds: mediaInfo.duration
                } : {})
            }));

            setMediaErrors(prev => ({
                ...prev,
                file: ''
            }));

            setUploadSuccess(true);

        } catch (err) {
            console.error(err);
            setError(typeof err === 'string' ? err : 'An error occurred');

            setMediaErrors(prev => ({
                ...prev,
                file: typeof err === 'string' ? err : 'Error validating file'
            }));

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            setUploadSuccess(false);
        }
    };

    const handleDrag = (e: DragEvent<HTMLFormElement | HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0] && mediaData.contentType && (!isSponsorsForm || mediaData.tag)) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleClickUpload = (): void => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleRemoveFile = (): void => {
        if (mediaData.previewUrl) {
            URL.revokeObjectURL(mediaData.previewUrl);
        }

        setMediaData(prev => ({
            ...prev,
            file: null,
            previewUrl: ''
        }));

        setMediaInfo(null);
        setUploadSuccess(false);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const isValid = validateForm(mediaData);
        if (!isValid) {
            setError('Please fix the errors in the media form');
            return;
        }

        setSubmitting(true);

        // Create media object using MediaDTO interface
        const newMedia: MediaDTO = {
            id: generateUUID(),
            order: mediaData.order,
            contentType: mediaData.contentType,
            previewUrl: mediaData.previewUrl,
            file: mediaData.file,
            width: mediaInfo?.width,
            height: mediaInfo?.height,
            videoDurationInSeconds: mediaInfo?.duration,
            tag: mediaData.tag,
            ...(formType === 'product' ? { productID: id } : { sponsorID: id })
        };

        onSave(newMedia);
        resetStates();
    };

    const mediaType = getMediaType();
    const constraints = mediaType
        ? getConstraints(mediaType, mediaData.tag)
        : null;

    return (
        <div className="bg-slate-900 rounded-lg shadow-xl overflow-hidden">
            <form autoComplete="off" onSubmit={handleSubmit} onDragEnter={handleDrag}>
                {/* Form Header */}
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center">
                        <button
                            type="button"
                            onClick={onBack}
                            className="mr-4 p-2 rounded-full hover:bg-slate-800 transition-colors"
                        >
                            <FiArrowLeft className="text-slate-300" />
                        </button>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Media Upload</h2>
                            <p className="text-slate-400 mt-1">Add image or video content</p>
                        </div>
                    </div>
                </div>

                {/* Media Information */}
                <div className="p-6 border-b border-slate-700">
                    <h3 className="text-lg font-medium text-white mb-4">Media Information</h3>

                    <div className={`grid grid-cols-1 ${isSponsorsForm ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
                        {/* App Section Type - Only for Sponsors Form */}
                        {isSponsorsForm && (
                            <div className="col-span-1">
                                <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="tag">
                                    App Section <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiLayout className="text-slate-500" />
                                    </div>
                                    <select
                                        className={`bg-slate-700 border ${mediaErrors.tage ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                        id="tag"
                                        name="tag"
                                        value={mediaData.tag || ''}
                                        onChange={handleTagChange}
                                        required={isSponsorsForm}
                                    >
                                        <option value="">Select section</option>
                                        <option value="Main">Main</option>
                                        <option value="Header">Header</option>
                                        <option value="Section1">Section 1</option>
                                        <option value="Section2">Section 2</option>
                                    </select>
                                </div>
                                {mediaErrors.tage && (
                                    <p className="mt-2 text-sm text-red-500">{mediaErrors.tage}</p>
                                )}
                            </div>
                        )}

                        {/* Media Type */}
                        <div className="col-span-1">
                            <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="contentType">
                                Media Type <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    {isImage() ? (
                                        <FiImage className="text-slate-500" />
                                    ) : mediaType === 'video' ? (
                                        <FiVideo className="text-slate-500" />
                                    ) : (
                                        <FiImage className="text-slate-500" />
                                    )}
                                </div>
                                <select
                                    className={`bg-slate-700 border ${mediaErrors.contentType ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                    id="contentType"
                                    name="contentType"
                                    value={mediaType}
                                    onChange={handleMediaTypeChange}
                                    required
                                >
                                    <option value="">Select media type</option>
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                </select>
                            </div>
                            {mediaErrors.contentType && (
                                <p className="mt-2 text-sm text-red-500">{mediaErrors.contentType}</p>
                            )}
                        </div>

                        {/* Order */}
                        <div className={`col-span-1 ${!isSponsorsForm ? 'md:col-span-1' : ''}`}>
                            <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="order">
                                Order <span className="text-red-500">*</span>
                            </label>
                            <input
                                className={`bg-slate-700 border ${mediaErrors.order ? 'border-red-500' : 'border-slate-600'} text-white rounded-md block w-full pl-3 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent`}
                                id="order"
                                name="order"
                                type="number"
                                value={mediaData.order || 0}
                                onChange={handleOrderChange}
                                placeholder="Media order"
                                required
                            />
                            {mediaErrors.order && (
                                <p className="mt-2 text-sm text-red-500">{mediaErrors.order}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* File Upload */}
                <div className="p-6 border-b border-slate-700">
                    <h3 className="text-lg font-medium text-white mb-4">Media Upload</h3>

                    {/* Requirements Info Box */}
                    <div className="mb-6 bg-slate-800 p-4 rounded-md">
                        <div className="flex items-start">
                            <FiInfo className="text-blue-400 mt-1 mr-3 flex-shrink-0" />
                            <div>
                                <h4 className="text-white font-medium mb-2">
                                    Media Requirements {isSponsorsForm && `for ${mediaData.tag || 'selected section'}`}
                                </h4>
                                {isSponsorsForm && !mediaData.tag ? (
                                    <p className="text-slate-300 text-sm">Please select an app section first</p>
                                ) : !mediaData.contentType ? (
                                    <p className="text-slate-300 text-sm">Please select a media type</p>
                                ) : constraints && (
                                    <ul className="text-slate-300 text-sm space-y-1 list-disc list-inside">
                                        {isImage() ? (
                                            <>
                                                <li>Image format: {constraints.formatNames.join(' or ')}</li>
                                                <li>Aspect ratio: {(constraints as ImageConstraints).aspectRatio === 16 / 9 ? '16:9' : '9:16'}</li>
                                                <li>Minimum dimensions: {(constraints as ImageConstraints).minWidth} x {(constraints as ImageConstraints).minHeight} pixels</li>
                                            </>
                                        ) : (
                                            <>
                                                <li>Video format: {constraints.formatNames.join(' or ')}</li>
                                                <li>Aspect ratio: {Array.isArray((constraints as VideoConstraints).aspectRatios)
                                                    ? (constraints as VideoConstraints).aspectRatios.map(r => r === 16 / 9 ? '16:9' : '9:16').join(' or ')
                                                    : (constraints as any).aspectRatio === 16 / 9 ? '16:9' : '9:16'
                                                }</li>
                                                {(constraints as VideoConstraints).minWidth && (constraints as VideoConstraints).minHeight && (
                                                    <li>Minimum dimensions: {(constraints as VideoConstraints).minWidth} x {(constraints as VideoConstraints).minHeight} pixels</li>
                                                )}
                                            </>
                                        )}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    {mediaData.contentType && (!isSponsorsForm || mediaData.tag) && (
                        <div className="mt-4">
                            {/* Drag and Drop Area */}
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all
                                    ${dragActive ? 'border-[#C8A560] bg-slate-800' : 'border-slate-600'} 
                                    ${mediaErrors.file ? 'border-red-500' : ''}
                                    ${mediaData.file ? 'bg-slate-800' : 'hover:bg-slate-800 hover:border-slate-500'}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    id="file"
                                    name="file"
                                    className="hidden"
                                    accept={getAcceptAttribute()}
                                    onChange={(e) => handleFileChange(e)}
                                />

                                {mediaData.file ? (
                                    <div className="flex flex-col items-center">
                                        {/* Preview Area */}
                                        <div className="mb-4 relative max-w-xl mx-auto w-full">
                                            {isImage() ? (
                                                <img
                                                    src={mediaData.previewUrl}
                                                    alt="Preview"
                                                    className="max-h-64 max-w-full rounded shadow-lg"
                                                />
                                            ) : (
                                                <video
                                                    src={mediaData.previewUrl}
                                                    controls
                                                    className="max-h-64 max-w-full rounded shadow-lg"
                                                />
                                            )}

                                            {/* Remove Button */}
                                            <button
                                                type="button"
                                                onClick={handleRemoveFile}
                                                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                            >
                                                <FiXCircle size={20} />
                                            </button>
                                        </div>

                                        {/* File Info */}
                                        <div className="text-slate-300 text-sm mt-2">
                                            <p className="font-medium">{mediaData.file.name}</p>
                                            <p>{(mediaData.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                        </div>

                                        {/* Media Info */}
                                        {mediaInfo && (
                                            <div className="mt-3 text-sm">
                                                <div className="bg-slate-700 rounded-md p-3 text-left">
                                                    <h4 className="text-white font-medium mb-2 flex items-center">
                                                        <FiCheckCircle className="text-green-400 mr-2" />
                                                        Media Details
                                                    </h4>
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-300">
                                                        <div>Format:</div>
                                                        <div>{mediaInfo.format}</div>
                                                        <div>Dimensions:</div>
                                                        <div>{mediaInfo.width} x {mediaInfo.height} px</div>
                                                        <div>Aspect Ratio:</div>
                                                        <div>{mediaInfo.aspectRatio}</div>
                                                        {mediaInfo.duration && (
                                                            <>
                                                                <div>Duration:</div>
                                                                <div>{mediaInfo.duration} sec</div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <div className="mb-3">
                                            {isImage() ? (
                                                <FiImage className="h-12 w-12 text-slate-500 mx-auto mb-2" />
                                            ) : (
                                                <FiVideo className="h-12 w-12 text-slate-500 mx-auto mb-2" />
                                            )}
                                            <p className="text-slate-300">Drag and drop your {isImage() ? 'image' : 'video'} here</p>
                                            <p className="text-slate-400 text-sm mt-1">or</p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleClickUpload}
                                            className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors flex items-center mx-auto"
                                        >
                                            <FiUpload className="mr-2" />
                                            Browse Files
                                        </button>
                                    </>
                                )}
                            </div>

                            {mediaErrors.file && (
                                <div className="flex items-center mt-3 text-red-500">
                                    <FiAlertCircle className="mr-2" />
                                    <p className="text-sm">{mediaErrors.file}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Form Actions */}
                <div className="p-6 flex items-center justify-end space-x-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-4 py-2 border border-slate-600 text-slate-300 rounded-md hover:bg-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-gradient-to-r from-[#EECB6C] to-[#C8A560] hover:from-[#C8A560] hover:to-[#B89550] text-slate-900 font-semibold rounded-md flex items-center transition-all duration-200 disabled:opacity-50"
                        disabled={!mediaData.file || submitting}
                    >
                        <FiSave className="mr-2" />
                        Add Media
                    </button>
                </div>
            </form>
        </div>
    );
}