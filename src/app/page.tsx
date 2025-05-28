'use client'
import * as React from 'react';
import { useState, useEffect } from 'react';
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

// Import data
import { useSponsorsContext } from './contexts/SponsorsContext';
import { SponsorData } from './types/form-types';

interface Stats {
  total: number;
  active: number;
  inactive: number;
}

export default function Home() {
  const { sponsors, loading } = useSponsorsContext();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    inactive: 0
  });

  // Fetch sponsors data
  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const active = sponsors.filter(sponsor => sponsor.active === true).length;
        setStats({
          total: sponsors.length,
          active: active,
          inactive: sponsors.length - active
        })
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching sponsors:', error);
        setIsLoading(false);
      }
    };

    fetchSponsors();
  }, [sponsors]);

  // Filter sponsors based on active tab
  const filteredSponsors = (): SponsorData[] => {
    switch (activeTab) {
      case 'Active':
        return sponsors.filter(sponsor => sponsor.active);
      case 'Inactive':
        return sponsors.filter(sponsor => !sponsor.active);
      default:
        return sponsors;
    }
  };

  // Add sponsor button element2
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
            <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </Card>

        {/* Table Section */}
        <Card>
          <SectionHeader
            title="Sponsors List"
            description={
              activeTab === 'All'
                ? 'Showing all sponsors'
                : activeTab === 'Active'
                  ? 'Showing only active sponsors'
                  : 'Showing only inactive sponsors'
            }
          />

          <div className="border-t border-slate-700">
            {isLoading || loading ? (
              <LoadingSpinner size="md" color="gold" />
            ) : (
              <SponsorTable sponsors={filteredSponsors()} />
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}