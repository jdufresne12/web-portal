'use client'
import * as React from 'react';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FiArrowLeft, FiX } from 'react-icons/fi';

// Import Function & Types
import { sponsorTypes } from '../types/form-types';

// Import Components
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner'
import ProductForm from '../components/forms/ProductForm';
import SponsorForm from '../components/forms/SponsorForm';

export default function AddSponsor() {
    const [sponsorType, setSponsorType] = useState<string>("Title");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const renderFormComponent = () => {
        if (sponsorType === 'Redeem Shop' || sponsorType === 'Star Store') {
            return (
                <ProductForm setLoading={setLoading} setError={setError} formType={sponsorType === "Redeem Shop" ? "Redeem Shop" : "Star Store"} />
            )
        } else {
            return (
                <SponsorForm setLoading={setLoading} setError={setError} formType={sponsorType === "Title" ? "Title" : "Hot Flash"} />
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
                        <h2 className="text-xl font-semibold text-white">Add New Sponsor</h2>
                        <div className='mt-5'>
                            <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="location">
                                Sponsor Location
                            </label>
                            <select
                                className="bg-slate-700 border border-slate-600 text-white rounded-md block w-full px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8A560] focus:border-transparent"
                                id="location"
                                name="location"
                                value={sponsorType}
                                onChange={(e) => setSponsorType(e.target.value)}
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
        </div>
    );
}