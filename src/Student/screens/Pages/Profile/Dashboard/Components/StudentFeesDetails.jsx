import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, CheckCircle, AlertCircle, TrendingUp, DollarSign, FileText } from 'lucide-react';
// import studentFeesService from '../../../../../_services/studentFees.service';
import studentFeesService from '../../../.././../../_services/studentFees.service';
import moment from 'moment';
const StudentFeesDetails = ({ studentId }) => {
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFees = async () => {
            if (!studentId) return;
            try {
                setLoading(true);
                const data = await studentFeesService.getStudentFeeAllocations(studentId);
                setAllocations(data || []);
            } catch (err) {
                console.error('Error fetching fees:', err);
                setError(err.message || 'Failed to load fee details');
            } finally {
                setLoading(false);
            }
        };

        fetchFees();
    }, [studentId]);

    const getOverdueStatus = (dueDate) => {
        if (!dueDate) return false;
        const currentISTDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        return new Date(dueDate) < currentISTDate;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500">Fetching your fee records...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-100 rounded-xl text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h3 className="text-red-800 font-bold mb-1">Could not load fees</h3>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (allocations.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-gray-700 font-bold">No Fees Allocated</h3>
                <p className="text-gray-500 text-sm">You don't have any fee allocations for the current term.</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {allocations.map((allocation) => (
                <div key={allocation.fee_allocation_id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden group">
                    {/* Header with gradient */}
                    <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-6 sm:p-10 text-white relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <CreditCard size={80} />
                        </div>
                        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="text-center lg:text-left">
                                <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
                                    {allocation.semester_name || 'Academic Term'}
                                </h2>
                                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                    <div className="flex items-center gap-2 text-blue-100 font-bold text-xs uppercase tracking-widest">
                                        <Calendar size={14} />
                                        <span>{allocation.academic_year_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-blue-100 font-bold text-xs uppercase tracking-widest">
                                        <TrendingUp size={14} />
                                        <span>{allocation.program_name}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 flex flex-col items-center lg:items-end shadow-2xl">
                                <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] mb-2">Total Outstanding</p>
                                <div className="text-3xl sm:text-4xl font-black">
                                    <span className="text-xl mr-1 opacity-50 font-medium">₹</span>
                                    {(allocation.pending_amount || 0).toLocaleString('en-IN')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Compact Stats Row */}
                    <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x border-b border-gray-100 bg-gray-50/50">
                        <div className="flex-1 p-6 text-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Fees</p>
                            <p className="text-xl font-bold text-gray-800">₹{(allocation.total_fees || 0).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="flex-1 p-6 text-center">
                            <p className="text-[10px] font-black text-green-500/70 uppercase tracking-widest mb-1">Paid Amount</p>
                            <p className="text-xl font-bold text-green-600">₹{(allocation.paid_amount || 0).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="flex-1 p-6 text-center">
                            <p className="text-[10px] font-black text-red-500/70 uppercase tracking-widest mb-1">Pending</p>
                            <p className="text-xl font-bold text-red-600">₹{(allocation.pending_amount || 0).toLocaleString('en-IN')}</p>
                        </div>
                    </div>

                    <div className="p-6 sm:p-10">
                        {/* Installment breakdown or line items */}
                        {allocation.is_in_installment && allocation.installments?.length > 0 ? (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                                    <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                                        <Calendar size={18} />
                                    </div>
                                    <h3 className="text-base font-black text-gray-900 uppercase tracking-widest">Installment Strategy</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {allocation.installments.map((inst) => {
                                        const isOverdue = inst.balance > 0 && getOverdueStatus(inst.due_date);
                                        return (
                                            <div key={inst.installment_id} className={`group/inst p-6 rounded-[1.5rem] border transition-all duration-300 ${inst.balance === 0 ? 'bg-green-50/50 border-green-100' :
                                                isOverdue ? 'bg-red-50/50 border-red-100 ring-2 ring-red-50' : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50'
                                                }`}>

                                                <div className="flex justify-between items-center mb-6">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 py-1 bg-gray-100 rounded-lg">
                                                        Milestone #{inst.installment_number}
                                                    </span>
                                                    {inst.balance === 0 ? (
                                                        <div className="bg-green-500 text-white p-1 rounded-full shadow-lg shadow-green-200">
                                                            <CheckCircle size={14} />
                                                        </div>
                                                    ) : isOverdue ? (
                                                        <span className="text-[9px] font-black text-red-600 uppercase bg-red-100 px-2 py-1 rounded-full">Critical Overdue</span>
                                                    ) : (
                                                        <span className="text-[9px] font-black text-amber-600 uppercase bg-amber-50 px-2 py-1 rounded-full">Future Expected</span>
                                                    )}
                                                </div>

                                                <div className="flex items-end justify-between">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Outstanding</p>
                                                        <p className={`text-2xl font-black tracking-tight ${inst.balance === 0 ? 'text-green-600' : 'text-gray-900 group-hover/inst:text-blue-600 transition-colors'}`}>
                                                            <span className="text-sm mr-0.5 opacity-50">₹</span>
                                                            {inst.balance.toLocaleString('en-IN')}
                                                        </p>
                                                    </div>
                                                    {inst.balance > 0 && (
                                                        <button
                                                            className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2"
                                                            onClick={() => alert(`Redirecting to payment for Milestone #${inst.installment_number}`)}
                                                        >
                                                            Pay <TrendingUp size={12} />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="mt-4 pt-4 border-t border-dashed border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                    Due Date: {moment(inst.due_date).format('MMM DD, YYYY')}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                                    <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                                        <FileText size={18} />
                                    </div>
                                    <h3 className="text-base font-black text-gray-900 uppercase tracking-widest">Fee Structure Components</h3>
                                </div>

                                <div className="divide-y divide-gray-50 bg-gray-50/30 rounded-3xl p-6 border border-gray-100">
                                    {allocation.fee_lines?.map((line) => (
                                        <div key={line.fee_line_id} className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group/line">
                                            <div>
                                                <p className="font-black text-gray-800 tracking-tight text-sm uppercase group-hover/line:text-indigo-600 transition-colors">{line.particular_name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Timeline: {line.due_date ? moment(line.due_date).format('MMM DD, YYYY') : 'Not Scheduled'}</p>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <p className="text-lg font-black text-gray-900">₹{line.total_amount.toLocaleString('en-IN')}</p>
                                                {line.balance > 0 && (
                                                    <span className="text-[9px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full ring-1 ring-red-100">₹{line.balance.toLocaleString('en-IN')} UNPAID</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {allocation.pending_amount > 0 && (
                                    <div className="pt-6">
                                        <button
                                            className="w-full bg-indigo-600 hover:bg-slate-900 text-white font-black px-10 py-5 rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-4"
                                            onClick={() => alert('Proceeding to Secure Payment Gateway...')}
                                        >
                                            <div className="p-2 bg-white/10 rounded-xl">
                                                <CreditCard size={24} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest leading-none mb-1">Secure Action</p>
                                                <p className="text-base sm:text-lg">Settle Balance (₹{allocation.pending_amount.toLocaleString('en-IN')})</p>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StudentFeesDetails;
