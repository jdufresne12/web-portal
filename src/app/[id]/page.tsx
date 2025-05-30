'use client'
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';
import { FiArrowLeft, FiX, FiTrash2 } from 'react-icons/fi';

// Imported Functions & Types
import { useSponsorsContext } from '../contexts/SponsorsContext';
import { MediaDTO, SponsorData } from '../types/form-types';
import { sponsorTypes } from '../types/form-types';

// Imported Components
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner'
import ProductForm from '../components/forms/ProductForm';
import SponsorForm from '../components/forms/SponsorForm';

interface EditSponsorProps {
    id: string;
}

export default function EditSponsor({ params }: { params: Promise<EditSponsorProps> }) {
    const router = useRouter();
    const unwrappedParams = React.use(params);
    const id = unwrappedParams.id;
    const searchParams = useSearchParams();
    const location = searchParams.get('location');

    const { sponsors, deleteSponsor } = useSponsorsContext();

    const [sponsorType, setSponsorType] = useState<string>(location || "Title");
    const [formData, setFormData] = useState<{}>({});
    const [mediaList, setMediaList] = useState<{}>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

    // Fetch the sponsor data using id
    useEffect(() => {
        const sponsorInfo = sponsors.find((sponsor: SponsorData) => sponsor.id === id);
        if (sponsorInfo) {
            setFormData(sponsorInfo || {});
            setMediaList(sponsorInfo!.media || {});
            console.log('Sponsor Info:', sponsorInfo);
        }
    }, [id, sponsors]);

    useEffect(() => {
        console.log(sponsors);
    }, [sponsors])

    // Handle sponsor deletion
    const handleDeleteSponsor = async () => {
        setDeleteLoading(true);
        try {
            // Delete sponsor using context
            await deleteSponsor(id);

            // Redirect to home page after successful deletion
            router.push('/')
        } catch (error) {
            console.error('Error deleting sponsor:', error);
            setError('Failed to delete sponsor. Please try again.');
            setShowDeleteModal(false);
        } finally {
            setDeleteLoading(false);
        }
    };

    // Render form component function
    const renderFormComponent = () => {
        if (sponsorType === 'Redeem Shop' || sponsorType === 'Star Store') {
            return (
                <ProductForm setLoading={setLoading} setError={setError} FormData={formData as SponsorData} MediaList={mediaList as MediaDTO[]} formType={sponsorType === "Redeem Shop" ? "Redeem Shop" : "Star Store"} />
            )
        } else {
            return (
                <SponsorForm setLoading={setLoading} setError={setError} FormData={formData as SponsorData} MediaList={mediaList as MediaDTO[]} formType={sponsorType === "Title" ? "Title" : "Hot Flash"} />
            )
        }
    }

    return (
        <div className="min-h-screen bg-slate-900">
            <Head>
                <link href="https://fonts.googleapis.com/css2?family=Goldman:wght@700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <Link href="/">
                        <button className="flex items-center text-slate-300 hover:text-[#C8A560] transition-colors">
                            <FiArrowLeft className="mr-2" />
                            Back to Sponsors Hub
                        </button>
                    </Link>
                </div>

                <Card>
                    <div className="p-6 border-b border-slate-700">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-white">Edit Sponsor Data</h2>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                aria-label="Delete sponsor"
                            >
                                <FiTrash2 size={20} />
                            </button>
                        </div>
                        <div className='mt-5'>
                            <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="type">
                                Sponsor type
                            </label>
                            <select
                                className="bg-slate-700 border border-slate-600 text-white rounded-md block w-full px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent"
                                id="type"
                                name="type"
                                value={sponsorType}
                                onChange={(e) => {
                                    setSponsorType(e.target.value)
                                    setFormData({});
                                    setMediaList({});
                                }}
                                disabled
                            >
                                {sponsorTypes.map(type => (
                                    <option key={type} value={type} disabled={type === 'Hot Flash' ? true : false}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="mx-6 mt-6 bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded flex items-start">
                            <FiX className="mr-2 mt-0.5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading ? renderFormComponent() : <LoadingSpinner size="md" color="gold" />}
                </Card>
            </main>

            {/* Delete Confirmation Modal - Redesigned */}
            {showDeleteModal && (
                <div
                    className="fixed inset-0 z-50 overflow-auto"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                >
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <div
                            className="bg-slate-800 rounded-lg shadow-xl mx-auto max-w-lg w-full relative"
                            onClick={(e) => e.stopPropagation()}  // Prevent clicks from closing modal
                        >
                            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                                        <FiTrash2 className="h-6 w-6 text-red-400" aria-hidden="true" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg font-medium text-white">
                                            Delete Sponsor
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-slate-300">
                                                Are you sure you want to delete this sponsor? This action cannot be undone
                                                and all associated data will be permanently removed.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={handleDeleteSponsor}
                                    disabled={deleteLoading}
                                >
                                    {deleteLoading ? (
                                        <span className="flex items-center">
                                            <LoadingSpinner size="sm" color="white" />
                                            <span className="ml-2">Deleting...</span>
                                        </span>
                                    ) : (
                                        'Delete'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-600 shadow-sm px-4 py-2 bg-slate-700 text-base font-medium text-slate-200 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={deleteLoading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}