'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Download, CheckCircle, Clock, XCircle } from 'lucide-react';
import { studentPlacementService } from '../Services/studentPlacement.service';
import { api } from '../../../../../_services/api';

/* ===================== MAPPER ===================== */
const mapOffersResponseToUI = (offers = []) =>
  offers.map((offer) => ({
    placement_id: offer.placement_id,
    organisation: offer.company?.company_name || '-',
    job_role: offer.job_roles?.[0]?.role_name || '-',
    ctc: offer.ctc_amount || '-',
    offer_letter_url: offer.offer_letter_url,
    location: offer.drive?.location || offer.drive?.venue || '-',
    offer_date: offer.created_at
      ? new Date(offer.created_at).toLocaleDateString()
      : '-',
    status:
      offer.offer_status === 'ACCEPTED'
        ? 'accepted'
        : offer.offer_status === 'REJECTED'
        ? 'declined'
        : 'pending'
  }));

/* ================================================= */

export default function MyOffers() {
  const [offers, setOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [prnId, setPrnId] = useState(null);

  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  /* ===================== LOAD OFFERS ===================== */
  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);

      const profileRes = await api.getUserProfile();
      const prnNo = profileRes?.data?.permanent_registration_number;

      if (!prnNo) {
        setOffers([]);
        return;
      }

      setPrnId(prnNo);

      const res = await studentPlacementService.getStudentOfferLetters(prnNo);
      const normalized = mapOffersResponseToUI(res?.offers || []);

      setOffers(normalized);
    } catch (err) {
      console.error('Error loading offers:', err);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  /* ===================== UPDATE STATUS ===================== */
  const updateOfferStatus = async (placementId, status) => {
    try {
      await studentPlacementService.updateStudentOfferLetters(
        prnId,
        placementId,
        status.toUpperCase()
      );

      // optimistic UI update
      setOffers((prev) =>
        prev.map((o) =>
          o.placement_id === placementId
            ? { ...o, status }
            : o
        )
      );
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update offer status');
    }
  };

  /* ===================== STATUS BADGE ===================== */
  const getStatusBadge = (status) => {
    const config = {
      accepted: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: CheckCircle,
        label: 'Accepted'
      },
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        icon: Clock,
        label: 'Pending'
      },
      declined: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: XCircle,
        label: 'Declined'
      }
    };

    const cfg = config[status] || config.pending;
    const Icon = cfg.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
        <Icon className="w-3 h-3" />
        {cfg.label}
      </span>
    );
  };

  /* ===================== FILTER + PAGINATION ===================== */
  const paginatedData = useMemo(() => {
    const filtered = offers.filter(
      (o) =>
        o.organisation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.job_role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalEntries = filtered.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const start = (currentPage - 1) * entriesPerPage;

    return {
      currentEntries: filtered.slice(start, start + entriesPerPage),
      totalEntries,
      totalPages,
      start
    };
  }, [offers, searchTerm, currentPage]);

  const { currentEntries, totalEntries, totalPages, start } = paginatedData;

  /* ===================== STATS ===================== */
  const stats = {
    total: offers.length,
    accepted: offers.filter((o) => o.status === 'accepted').length,
    pending: offers.filter((o) => o.status === 'pending').length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin h-12 w-12 border-t-4 border-blue-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-0">

      {/* ===================== STATS ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Offers" value={stats.total} />
        <StatCard label="Accepted" value={stats.accepted} />
        <StatCard label="Pending" value={stats.pending} />
      </div>

      {/* ===================== SEARCH ===================== */}
      <div className="mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="search"
            placeholder="Search offers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-xl"
          />
        </div>
      </div>

      {/* ===================== TABLE ===================== */}
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead className="table-header">
            <tr>
              <th className="p-3 text-left">Placement ID</th>
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">CTC</th>
              <th className="p-3 text-left">Offer Date</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentEntries.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-6 text-center text-gray-500">
                  No offers found
                </td>
              </tr>
            ) : (
              currentEntries.map((item) => (
                <tr key={item.placement_id} className="border-t">
                  <td className="p-3">{item.placement_id}</td>
                  <td className="p-3">{item.organisation}</td>
                  <td className="p-3">{item.job_role}</td>
                  <td className="p-3 text-green-600 font-semibold">{item.ctc}</td>
                  <td className="p-3">{item.offer_date}</td>
                  <td className="p-3">{item.location}</td>
                  <td className="p-3">{getStatusBadge(item.status)}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => window.open(item.offer_letter_url, '_blank')}
                        className="p-2 bg-blue-50 text-blue-600 rounded"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {item.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateOfferStatus(item.placement_id, 'accepted')}
                            className="px-3 py-1 bg-green-600 text-white rounded text-xs"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateOfferStatus(item.placement_id, 'rejected')}
                            className="px-3 py-1 bg-red-600 text-white rounded text-xs"
                          >
                            Decline
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===================== PAGINATION ===================== */}
      {totalEntries > 0 && (
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Showing {start + 1} – {Math.min(start + entriesPerPage, totalEntries)} of {totalEntries}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

/* ===================== STAT CARD ===================== */
function StatCard({ label, value }) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
