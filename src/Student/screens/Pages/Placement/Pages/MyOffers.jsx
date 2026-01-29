'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Download, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MyOffers() {
  const [offers, setOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    setLoading(true);
    const mockData = [
      {
        offer_id: 301,
        placement_id: 'PL20260453',
        organisation: 'TCS',
        job_role: 'Software Developer',
        ctc: '4.5 LPA',
        offer_date: '20/01/2026',
        joining_date: '01/03/2026',
        offer_letter_url: '/offers/tcs_offer_letter.pdf',
        status: 'accepted',
        location: 'Bangalore',
        bond_period: '2 years',
        remarks: 'Congratulations! Welcome to TCS family.'
      },
      {
        offer_id: 302,
        placement_id: 'PL20260454',
        organisation: 'Infosys',
        job_role: 'System Engineer',
        ctc: '5 LPA',
        offer_date: '22/01/2026',
        joining_date: '15/03/2026',
        offer_letter_url: '/offers/infosys_offer_letter.pdf',
        status: 'pending',
        location: 'Pune',
        bond_period: '1.5 years',
        remarks: 'Please accept or decline by 30/01/2026'
      },
      {
        offer_id: 303,
        placement_id: 'PL20260455',
        organisation: 'Wipro',
        job_role: 'Frontend Developer',
        ctc: '6 LPA',
        offer_date: '15/01/2026',
        joining_date: '01/04/2026',
        offer_letter_url: '/offers/wipro_offer_letter.pdf',
        status: 'declined',
        location: 'Hyderabad',
        bond_period: '1 year',
        remarks: 'Declined due to better opportunity'
      }
    ];
    setOffers(mockData);
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      accepted: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Accepted' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Pending' },
      declined: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Declined' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={'inline-flex items-center gap-1 px-3 py-1 ' + config.bg + ' ' + config.text + ' text-xs font-semibold rounded-full'}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const handleAcceptOffer = (offerId) => {
    setOffers(offers.map(offer => 
      offer.offer_id === offerId ? { ...offer, status: 'accepted' } : offer
    ));
  };

  const handleDeclineOffer = (offerId) => {
    setOffers(offers.map(offer => 
      offer.offer_id === offerId ? { ...offer, status: 'declined' } : offer
    ));
  };

  const paginatedData = useMemo(() => {
    let list = offers.filter(offer =>
      offer.organisation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.job_role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalEntries = list.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const currentEntries = list.slice(start, end);

    return { currentEntries, totalEntries, totalPages, start, end };
  }, [offers, searchTerm, currentPage]);

  const { currentEntries, totalEntries, totalPages } = paginatedData;

  const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);

  // Stats
  const stats = {
    total: offers.length,
    accepted: offers.filter(o => o.status === 'accepted').length,
    pending: offers.filter(o => o.status === 'pending').length
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-0 md:p-0">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Offers</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-xl font-bold text-gray-900">{stats.accepted}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search offers"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Placement ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">CTC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Offer Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Joining Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50  tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-50  tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEntries.length > 0 ? (
                currentEntries.map((item) => (
                  <tr key={item.offer_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.placement_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.organisation}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.job_role}</td>
                    <td className="px-6 py-4 text-sm text-green-600 font-semibold">{item.ctc}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.offer_date}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.joining_date}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.location}</td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => window.open(item.offer_letter_url, '_blank')}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {item.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAcceptOffer(item.offer_id)}
                              className="px-3 py-1 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition text-xs font-medium"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleDeclineOffer(item.offer_id)}
                              className="px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition text-xs font-medium"
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                    No offers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalEntries > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
            <button onClick={handlePrev} disabled={currentPage === 1} className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
              Previous
            </button>
            <span className="text-gray-700 font-medium">
              Showing {paginatedData.start + 1}–{Math.min(paginatedData.end, totalEntries)} of {totalEntries} entries
            </span>
            <button onClick={handleNext} disabled={currentPage === totalPages} className={`px-4 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
              Next
            </button>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {currentEntries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No offers found</p>
            </div>
          </div>
        ) : (
          currentEntries.map((item) => (
            <div key={item.offer_id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{item.placement_id}</p>
                  <p className="text-sm text-gray-500">{item.organisation}</p>
                  <p className="text-xs text-gray-400">{item.job_role}</p>
                </div>
                {getStatusBadge(item.status)}
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-medium">CTC:</span> <span className="text-green-600 font-semibold">{item.ctc}</span></div>
                  <div><span className="font-medium">Location:</span> {item.location}</div>
                  <div><span className="font-medium">Offer Date:</span> {item.offer_date}</div>
                  <div><span className="font-medium">Joining:</span> {item.joining_date}</div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-2">
                <button
                  onClick={() => window.open(item.offer_letter_url, '_blank')}
                  className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                {item.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleAcceptOffer(item.offer_id)}
                      className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition text-sm font-medium"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclineOffer(item.offer_id)}
                      className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition text-sm font-medium"
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

      {/* Mobile Pagination */}
      {totalEntries > 0 && (
        <div className="lg:hidden flex justify-between items-center px-4 py-4 bg-white rounded-lg shadow-sm border border-gray-200 mt-4 text-sm text-gray-600">
          <button onClick={handlePrev} disabled={currentPage === 1} className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
            Previous
          </button>
          <span className="text-gray-700 font-medium text-xs">
            {paginatedData.start + 1}–{Math.min(paginatedData.end, totalEntries)} of {totalEntries}
          </span>
          <button onClick={handleNext} disabled={currentPage === totalPages} className={`px-4 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
