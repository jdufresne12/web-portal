'use client'
import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { FiPlusCircle, FiActivity, FiDatabase } from 'react-icons/fi';

// Import components
import Card from './components/Card';
import SectionHeader from './components/SectionHeader';
import LoadingSpinner from './components/LoadingSpinner';
import ActionButton from './components/ActionButton';
import TabBar from './components/TabBar';
import SponsorTable from './components/SponsorTable';
import StatsCards from './components/StatsCards';
import Pagination from './components/Pagination';

// Import data
import { useSponsorsContext } from './contexts/SponsorsContext';
import { SponsorData } from './types/form-types';

interface Stats {
  total: number;
  active: number;
  inactive: number;
}

export default function Home() {
  const { sponsors, stats, loading, fetchSponsorData } = useSponsorsContext();

  const [activeTab, setActiveTab] = useState<string>('All');
  const [sponsorTypeTab, setSponsorTypeTab] = useState<string>('Title');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  // Filter sponsors based on active tab
  const filteredSponsors = useMemo((): SponsorData[] => {
    switch (activeTab) {
      case 'Active':
        return sponsors.filter(sponsor => sponsor.active);
      case 'Inactive':
        return sponsors.filter(sponsor => !sponsor.active);
      default:
        return sponsors;
    }
  }, [sponsors, activeTab]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredSponsors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSponsors = filteredSponsors.slice(startIndex, endIndex);

  // Handles pagination page and sponsor data state updated
  useEffect(() => {
    setCurrentPage(1);
    fetchSponsorData(sponsorTypeTab);
  }, [activeTab, sponsorTypeTab]);

  useEffect(() => {
    console.log(sponsors)
  }, [])

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const tableElement = document.querySelector('[data-table-container]');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Add sponsor button element
  const addSponsorButton = (
    <Link href="/add-sponsor">
      <ActionButton
        variant="primary"
        icon={<FiPlusCircle />}
      >
        Add New Sponsor
      </ActionButton>
    </Link>
  );

  return (
    <div className="min-h-screen bg-slate-900">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Goldman:wght@700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCards
            label="Total Sponsors"
            amount={stats.total}
          />
          <StatsCards
            label="Active Sponsors"
            amount={stats.active}
          />
          <StatsCards
            label="Inactive Sponsors"
            amount={stats.inactive}
          />
        </div>

        {/* Control Panel */}
        <Card className="mb-8">
          <SectionHeader
            title="Sponsor Management"
            description="View and manage all sponsor details for the mobile application."
            action={addSponsorButton}
          />

          <div className="border-t border-slate-700 px-6 py-4">
            <TabBar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              sponsorTypeTab={sponsorTypeTab}
              setSponsorTypeTab={setSponsorTypeTab}
            />
          </div>
        </Card>

        {/* Table Section */}
        <Card data-table-container>
          <SectionHeader
            title="Sponsors List"
            description={
              activeTab === 'All'
                ? `Showing all sponsors (${filteredSponsors.length} total)`
                : activeTab === 'Active'
                  ? `Showing only active sponsors (${filteredSponsors.length} total)`
                  : `Showing only inactive sponsors (${filteredSponsors.length} total)`
            }
          />

          <div className="border-t border-slate-700">
            {loading ? (
              <LoadingSpinner size="md" color="gold" />
            ) : (
              <>
                <SponsorTable sponsors={paginatedSponsors} />
                {filteredSponsors.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredSponsors.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}