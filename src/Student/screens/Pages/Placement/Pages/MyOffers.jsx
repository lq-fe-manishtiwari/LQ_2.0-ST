'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Download, CheckCircle, Clock, XCircle } from 'lucide-react';
import { studentPlacementService } from '../Services/studentPlacement.service';
import { api } from '../../../../../_services/api';

/* ===================== HELPERS ===================== */
const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatCTC = (amount) => {
  if (!amount || isNaN(amount)) return '-';
  return `${(amount / 100000).toFixed(1)} LPA`;
};

/* ===================== MAPPER ===================== */
const mapOffersResponseToUI = (offers = []) =>
  offers.map((offer) => ({
    placement_id: offer.placement_id,
    organisation: offer.company?.company_name || '-',
    job_role: offer.job_roles?.[0]?.role_name || '-',
    ctc: formatCTC(offer.ctc_amount),
    offer_letter_url: offer.offer_letter_url,
    location: offer.drive?.location || offer.drive?.venue || '-',
    offer_date: formatDate(offer.created_at),
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

      setOffers((prev) =>
        prev.map((o) =>
          o.placement_id === placementId ? { ...o, status } : o
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
        <Icon className="w-3.5 h-3.5" />
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
    <div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Offers" value={stats.total} />
        <StatCard label="Accepted" value={stats.accepted} />
        <StatCard label="Pending" value={stats.pending} />
      </div>

      {/* SEARCH */}
      <div className="mb-6 w-full sm:w-80 relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="search"
          placeholder="Search offers..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-10 pr-4 py-3 border rounded-xl"
        />
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Placement ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">CTC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Offer Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {currentEntries.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No offers found
                  </td>
                </tr>
              ) : (
                currentEntries.map((item) => (
                  <tr key={item.placement_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-left text-gray-900">{item.placement_id}</td>
                    <td className="px-6 py-4 text-sm text-left text-gray-500 truncate max-w-[100px]" title={item.organisation}>{item.organisation}</td>
                    <td className="px-6 py-4 text-sm text-left text-gray-500 truncate max-w-[120px]" title={item.job_role}>{item.job_role}</td>
                    <td className="px-6 py-4 text-sm text-left font-semibold text-green-600">{item.ctc}</td>
                    <td className="px-6 py-4 text-sm text-left text-gray-500">{item.offer_date}</td>
                    <td className="px-6 py-4 text-sm text-left text-gray-500">{item.location}</td>
                    <td className="px-6 py-4 text-sm text-left">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => window.open(item.offer_letter_url, '_blank')}
                          className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
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

        {/* PAGINATION */}
        {totalEntries > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className={`px-4 py-2 rounded-md ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Previous
            </button>
            <span className="text-gray-700 font-medium">
              Showing {start + 1}–{Math.min(start + entriesPerPage, totalEntries)} of {totalEntries} entries
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className={`px-4 py-2 rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* MOBILE CARDS */}
      <div className="lg:hidden space-y-4">
        {currentEntries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No offers found</p>
              <p className="text-sm">
                {searchTerm ? 'No offers found matching your search' : 'No offers available at the moment'}
              </p>
            </div>
          </div>
        ) : (
          currentEntries.map((item) => (
            <div
              key={item.placement_id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{item.organisation}</p>
                  <p className="text-sm text-gray-500">{item.job_role}</p>
                </div>
                {getStatusBadge(item.status)}
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-medium">Placement ID:</span> {item.placement_id}</div>
                  <div><span className="font-medium">CTC:</span> {item.ctc}</div>
                  <div><span className="font-medium">Offer Date:</span> {item.offer_date}</div>
                  <div><span className="font-medium">Location:</span> {item.location}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.open(item.offer_letter_url, '_blank')}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                {item.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateOfferStatus(item.placement_id, 'accepted')}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateOfferStatus(item.placement_id, 'rejected')}
                      className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Decline
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MOBILE PAGINATION */}
      {totalEntries > 0 && (
        <div className="lg:hidden flex justify-between items-center px-4 py-4 bg-white rounded-lg shadow-sm border border-gray-200 mt-4 text-sm text-gray-600">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className={`px-4 py-2 rounded-md ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Previous
          </button>
          <span className="text-gray-700 font-medium text-xs">
            {start + 1}–{Math.min(start + entriesPerPage, totalEntries)} of {totalEntries}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className={`px-4 py-2 rounded-md ${
              currentPage === totalPages
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
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
