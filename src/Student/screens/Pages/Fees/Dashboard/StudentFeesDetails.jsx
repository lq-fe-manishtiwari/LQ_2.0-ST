import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, CheckCircle, AlertCircle, TrendingUp, DollarSign, FileText } from 'lucide-react';
import SweetAlert from 'react-bootstrap-sweetalert';
import studentFeesService from '../../../../../_services/studentFees.service';
const StudentFeesDetails = () => {
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedInstallments, setSelectedInstallments] = useState({});
    const [successAlert, setSuccessAlert] = useState(null);
    const [errorAlert, setErrorAlert] = useState(null);
    const [warningAlert, setWarningAlert] = useState(null);

    const getStudentId = () => {
        try {
            const profileStr = localStorage.getItem('userProfile');
            if (!profileStr) return null;
            const profile = JSON.parse(profileStr);
            return profile?.student_id || null;
        } catch (error) {
            console.error('Error parsing profile:', error);
            return null;
        }
    };

    useEffect(() => {
        const fetchFees = async () => {
            const studentId = getStudentId();
            if (!studentId) {
                setError('Student ID not found');
                setLoading(false);
                return;
            }
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
        setSelectedInstallments({});
    }, []);

    const getOverdueStatus = (dueDate) => {
        if (!dueDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        return due < today;
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
        <>
            {successAlert && (
                <SweetAlert
                    success
                    title={successAlert.title}
                    onConfirm={() => setSuccessAlert(null)}
                    confirmBtnCssClass="btn-confirm"
                >
                    {successAlert.message}
                </SweetAlert>
            )}
            {errorAlert && (
                <SweetAlert
                    error
                    title={errorAlert.title}
                    onConfirm={() => setErrorAlert(null)}
                    confirmBtnCssClass="btn-confirm"
                >
                    {errorAlert.message}
                </SweetAlert>
            )}
            {warningAlert && (
                <SweetAlert
                    warning
                    title={warningAlert.title}
                    onConfirm={() => setWarningAlert(null)}
                    confirmBtnCssClass="btn-confirm"
                >
                    {warningAlert.message}
                </SweetAlert>
            )}
            <div className="space-y-8">
            {allocations.map((allocation) => (
                <div key={allocation.fee_allocation_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Semester Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 sm:p-6 text-white">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                                    {allocation.class_year_name || 'Current Year'}
                                </h2>
                                <p className="text-blue-100 text-xs sm:text-sm mt-1">
                                    {allocation.academic_year_name} | {allocation.program_name}
                                </p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 px-4 sm:px-5 border border-white/10 w-fit">
                                <p className="text-blue-50 text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-1">Outstanding Balance</p>
                                <p className="text-xl sm:text-2xl font-black">₹{(allocation.pending_amount || 0).toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 xs:grid-cols-3 divide-y xs:divide-y-0 xs:divide-x border-b bg-gray-50/50">
                        <div className="p-3 sm:p-5 text-center">
                            <p className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase mb-1">Total Fee</p>
                            <p className="text-base sm:text-xl font-bold text-gray-800">₹{(allocation.total_fees || 0).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="p-3 sm:p-5 text-center">
                            <p className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase mb-1 text-green-600">Total Paid</p>
                            <p className="text-base sm:text-xl font-bold text-green-600">₹{(allocation.paid_amount || 0).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="p-3 sm:p-5 text-center">
                            <p className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase mb-1 text-red-500">Total Pending</p>
                            <p className="text-base sm:text-xl font-bold text-red-500">₹{(allocation.pending_amount || 0).toLocaleString('en-IN')}</p>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6">
                        {/* Installments Breakdown */}
                        {allocation.is_in_installment && allocation.installments?.length > 0 ? (
                            <div className="space-y-4">
                                <h3 className="text-[10px] sm:text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b pb-2">
                                    <Calendar className="w-4 h-4" />
                                    Installment Breakdown
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {allocation.installments.map((inst) => {
                                        const isOverdue = inst.balance > 0 && getOverdueStatus(inst.due_date);
                                        const isSelected = selectedInstallments[allocation.fee_allocation_id]?.includes(inst.installment_id);
                                        return (
                                            <div
                                                key={inst.installment_id}
                                                className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                                    inst.balance === 0
                                                        ? 'bg-green-50 border-green-200'
                                                        : isSelected
                                                        ? 'bg-blue-50 border-blue-500 shadow-md'
                                                        : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                                }`}
                                                onClick={() => {
                                                    if (inst.balance > 0) {
                                                        setSelectedInstallments(prev => {
                                                            const current = prev[allocation.fee_allocation_id] || [];
                                                            const updated = current.includes(inst.installment_id)
                                                                ? current.filter(id => id !== inst.installment_id)
                                                                : [...current, inst.installment_id];
                                                            return { ...prev, [allocation.fee_allocation_id]: updated };
                                                        });
                                                    }
                                                }}
                                            >
                                                {inst.balance > 0 && (
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => {}}
                                                        className="absolute top-3 left-3 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 pointer-events-none"
                                                    />
                                                )}
                                                <div className={`flex justify-between items-start ${inst.balance > 0 ? 'ml-6' : ''}`}>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-sm font-bold text-gray-700">
                                                                Installment #{inst.installment_number}
                                                            </span>
                                                            {inst.balance === 0 && (
                                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                            )}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-gray-500">Amount:</span>
                                                                <span className="font-semibold text-gray-700">₹{(inst.amount || 0).toLocaleString('en-IN')}</span>
                                                            </div>
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-gray-500">Paid:</span>
                                                                <span className="font-semibold text-green-600">₹{(inst.paid_amount || 0).toLocaleString('en-IN')}</span>
                                                            </div>
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-gray-500">Balance:</span>
                                                                <span className={`font-bold ${inst.balance === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                    ₹{inst.balance.toLocaleString('en-IN')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {isOverdue && inst.balance > 0 && (
                                                    <div className="mt-2 pt-2 border-t border-red-200">
                                                        <span className="text-[10px] font-bold text-red-600 uppercase bg-red-100 px-2 py-0.5 rounded">Overdue</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                {(selectedInstallments[allocation.fee_allocation_id]?.length || 0) > 0 && (
                                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3">
                                        <div>
                                            <p className="text-sm font-bold text-blue-900">{selectedInstallments[allocation.fee_allocation_id].length} Installment(s) Selected</p>
                                            <p className="text-xs text-blue-700">Total: ₹{allocation.installments.filter(i => selectedInstallments[allocation.fee_allocation_id]?.includes(i.installment_id)).reduce((sum, i) => sum + i.balance, 0).toLocaleString('en-IN')}</p>
                                        </div>
                                        <button
                                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-2.5 rounded-lg shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                                            onClick={() => {
                                                const total = allocation.installments.filter(i => selectedInstallments[allocation.fee_allocation_id]?.includes(i.installment_id)).reduce((sum, i) => sum + i.balance, 0);
                                                setSuccessAlert({
                                                    title: 'Payment Initiated',
                                                    message: `Proceeding to payment gateway for ${selectedInstallments[allocation.fee_allocation_id].length} installment(s). Total Amount: ₹${total.toLocaleString('en-IN')}`
                                                });
                                            }}
                                        >
                                            <CreditCard size={16} />
                                            Pay Selected
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Simple Fee Line Items for non-installment */
                            <div className="space-y-3">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b pb-2">
                                    <FileText className="w-4 h-4" />
                                    Fee Components
                                </h3>
                                <div className="divide-y">
                                    {allocation.fee_lines?.map((line) => (
                                        <div key={line.fee_line_id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2 group">
                                            <div>
                                                <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors uppercase">{line.particular_name}</p>
                                                <p className="text-[10px] text-gray-400 font-medium mt-0.5">Due by: {line.due_date ? new Date(line.due_date).toLocaleDateString('en-IN') : 'N/A'}</p>
                                            </div>
                                            <div className="flex sm:flex-col justify-between items-center sm:items-end sm:text-right border-t sm:border-0 pt-2 sm:pt-0">
                                                <p className="text-sm font-black text-gray-800">₹{line.total_amount.toLocaleString('en-IN')}</p>
                                                {line.balance > 0 && (
                                                    <p className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded">₹{line.balance.toLocaleString('en-IN')} PENDING</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {allocation.pending_amount > 0 && (
                                    <div className="pt-4 flex justify-end">
                                        <button
                                            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 sm:px-8 py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                            onClick={() => {
                                                setSuccessAlert({
                                                    title: 'Payment Initiated',
                                                    message: `Proceeding to payment gateway. Total Amount: ₹${allocation.pending_amount.toLocaleString('en-IN')}`
                                                });
                                            }}
                                        >
                                            <CreditCard size={18} />
                                            <span className="text-sm sm:text-base">Pay Semester Balance (₹{allocation.pending_amount.toLocaleString('en-IN')})</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
            </div>
        </>
    );
};

export default StudentFeesDetails;
