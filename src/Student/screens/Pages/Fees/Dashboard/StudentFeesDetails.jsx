import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, CheckCircle, AlertCircle, TrendingUp, DollarSign, FileText } from 'lucide-react';
import SweetAlert from 'react-bootstrap-sweetalert';
import studentFeesService from '../../../../../_services/studentFees.service';
import { checkInstallmentActiveStatus } from '../Services/installmentActiveService';
const StudentFeesDetails = () => {
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedInstallments, setSelectedInstallments] = useState({});
    const [successAlert, setSuccessAlert] = useState(null);
    const [errorAlert, setErrorAlert] = useState(null);
    const [warningAlert, setWarningAlert] = useState(null);
    const [installmentActiveStatus, setInstallmentActiveStatus] = useState({});
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentModes, setPaymentModes] = useState([]);

    // Razorpay keys
    // For development/testing, use test keys (rzp_test_...) to avoid website mismatch errors
    // For production, use live keys (rzp_live_...)
    // Get test keys from: https://dashboard.razorpay.com/app/website-app-settings/api-keys
    const RAZORPAY_KEY_ID = 'rzp_live_e1RWThJDwXuKic';
    const RAZORPAY_KEY_SECRET = 'hV8WqaXrBlQ9sbhhaWLFErJO';

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

        const fetchPaymentModes = async () => {
            try {
                const modes = await studentFeesService.getActivePaymentModes();
                setPaymentModes(modes || []);
            } catch (err) {
                console.error('Error fetching payment modes:', err);
            }
        };

        fetchFees();
        fetchPaymentModes();
        setSelectedInstallments({});
    }, []);

    // Fetch installment active status for each allocation
    useEffect(() => {
        const fetchStatuses = async () => {
            if (allocations.length > 0) {
                const statusMap = {};
                for (const allocation of allocations) {
                    try {
                        const status = await checkInstallmentActiveStatus(allocation.fee_allocation_id);
                        statusMap[allocation.fee_allocation_id] = status;
                    } catch (error) {
                        console.error(`Error fetching status for allocation ${allocation.fee_allocation_id}:`, error);
                        statusMap[allocation.fee_allocation_id] = false;
                    }
                }
                setInstallmentActiveStatus(statusMap);
            }
        };

        fetchStatuses();
    }, [allocations]);

    // Load Razorpay script dynamically
    useEffect(() => {
        if (window.Razorpay) {
            console.log('Razorpay already loaded');
            setRazorpayLoaded(true);
            return;
        }

        console.log('Initializing Razorpay script load...');
        const script = document.createElement('script');
        script.id = 'razorpay-checkout-js';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        
        script.onload = () => {
            console.log('Razorpay SDK loaded successfully');
            setRazorpayLoaded(true);
        };
        
        script.onerror = () => {
            console.error('Razorpay SDK failed to load. Please check your internet connection or ad-blockers.');
            setRazorpayLoaded(false);
        };

        document.body.appendChild(script);

        return () => {
            const existingScript = document.getElementById('razorpay-checkout-js');
            if (existingScript && document.body.contains(existingScript)) {
                // Keep it loaded to avoid multiple re-loads if component re-renders
                // Or remove if you want strict cleanup
                // document.body.removeChild(existingScript);
            }
        };
    }, []);

    const getOverdueStatus = (dueDate) => {
        if (!dueDate) return false;
        // Get current date in IST for accurate overdue comparison
        const currentISTDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        currentISTDate.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        return due < currentISTDate;
    };

    const handlePayment = async (allocation, installmentIds = null, isOverduePayment = false) => {
        if (processingPayment) return;

        try {
            setProcessingPayment(true);
            const studentId = getStudentId();

            if (!studentId) {
                setErrorAlert({ title: 'Error', message: 'Student ID not found' });
                return;
            }

            // Calculate amount and prepare fee line payments
            let totalAmount = 0;
            let feeLinePayments = [];

            if (allocation.is_in_installment && installmentIds) {
                // Installment-based payment
                const selectedInsts = allocation.installments.filter(inst => 
                    installmentIds.includes(inst.installment_id)
                );
                totalAmount = selectedInsts.reduce((sum, inst) => sum + inst.balance, 0);

                // Map installments to fee lines
                selectedInsts.forEach(inst => {
                    feeLinePayments.push({
                        fee_line_id: inst.fee_line_id || allocation.fee_lines[0]?.fee_line_id,
                        amount: inst.balance
                    });
                });
            } else {
                // Full balance payment
                totalAmount = allocation.pending_amount;
                if (allocation.fee_lines && allocation.fee_lines.length > 0) {
                    feeLinePayments = allocation.fee_lines
                        .filter(fl => fl.balance > 0)
                        .map(fl => ({
                            fee_line_id: fl.fee_line_id,
                            amount: fl.balance
                        }));
                } else {
                    feeLinePayments = [{
                        fee_line_id: allocation.fee_allocation_id,
                        amount: totalAmount
                    }];
                }
            }

            if (totalAmount <= 0) {
                setWarningAlert({ title: 'Invalid Amount', message: 'No pending amount to pay' });
                return;
            }

            // Get dynamic payment mode ID for ONLINE(APP)
            const onlineAppMode = paymentModes.find(m => m.payment_mode_code === "ONLINE_APP");
            const dynamicPaymentModeId = onlineAppMode ? onlineAppMode.payment_mode_id : 4; // Default to 4 if not found

            // Step 1: Initialize Payment
            const initPayload = {
                student_id: studentId,
                allocation_id: allocation.fee_allocation_id,
                amount: totalAmount,
                payment_mode_id: dynamicPaymentModeId
            };

            const initResponse = await studentFeesService.initializeStudentPayment(initPayload);
            console.log('Init Response:', initResponse);
            
            // Check for both camelCase and snake_case as backend might vary
            const initializationId = initResponse?.initializationId || initResponse?.initialization_id;

            if (!initializationId) {
                setErrorAlert({ title: 'Error', message: 'Failed to initialize payment tracking' });
                return;
            }

            // Step 2: Create Razorpay Order
            const orderPayload = {
                amount: totalAmount, // Backend usually performs * 100 internally for student fees if following PublicForm pattern
                currency: 'INR',
                student_id: studentId,
                allocation_id: allocation.fee_allocation_id,
                gateway_key_id: RAZORPAY_KEY_ID,
                gateway_secret_key: RAZORPAY_KEY_SECRET
            };

            const orderResponse = await studentFeesService.createRazorpayOrder(orderPayload);
            console.log('Order Response:', orderResponse);

            if (!orderResponse || !orderResponse.order || !orderResponse.order.id) {
                setErrorAlert({ title: 'Error', message: 'Failed to create payment order' });
                return;
            }

            // Step 3: Open Razorpay Checkout
            // Passing the full order object to ensure exact match with backend
            openRazorpay(
                orderResponse.order, 
                initializationId,
                allocation,
                feeLinePayments,
                dynamicPaymentModeId
            );

        } catch (err) {
            console.error('Payment error:', err);
            setErrorAlert({ 
                title: 'Payment Failed', 
                message: err.message || 'Something went wrong. Please try again.' 
            });
        } finally {
            setProcessingPayment(false);
        }
    };

    const openRazorpay = async (order, initializationId, allocation, feeLinePayments, paymentModeId) => {
        console.log('Opening Razorpay with order:', order);
        
        if (!window.Razorpay) {
            console.log('Razorpay not found, waiting 500ms...');
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (!window.Razorpay) {
            console.error('Razorpay SDK not available');
            setErrorAlert({ 
                title: 'Payment System Error', 
                message: 'Payment system not loaded. Please refresh the page.' 
            });
            return;
        }

        const profileStr = localStorage.getItem('userProfile');
        const profile = profileStr ? JSON.parse(profileStr) : {};

        const options = {
            key: RAZORPAY_KEY_ID,
            amount: order.amount, // Already in paise from backend
            currency: order.currency || 'INR',
            name: 'Student Fee Payment',
            description: `Fee for ${allocation.class_year_name || 'Current Year'}`,
            order_id: order.id,
            prefill: {
                name: profile.full_name || '',
                email: profile.email || '',
                contact: profile.mobile || ''
            },
            handler: async (response) => {
                console.log('Payment Success:', response);
                await handlePaymentSuccess(
                    response,
                    initializationId,
                    allocation,
                    order.amount / 100, // Convert back to rupees
                    feeLinePayments,
                    paymentModeId
                );
            },
            modal: {
                ondismiss: async () => {
                    console.log('Payment cancelled by user');
                    await handlePaymentFailure(initializationId);
                }
            }
        };

        console.log('Razorpay options:', options);

        try {
            const rzp = new window.Razorpay(options);
            console.log('Razorpay instance created, opening modal...');
            rzp.open();
        } catch (err) {
            console.error('Razorpay open error:', err);
            setErrorAlert({ title: 'Error', message: 'Unable to open payment gateway: ' + err.message });
        }
    };

    const handlePaymentSuccess = async (razorpayResponse, initializationId, allocation, amount, feeLinePayments, paymentModeId) => {
        try {
            // Step 4: Finalize Payment
            await studentFeesService.finalizeStudentPayment(
                initializationId,
                razorpayResponse.razorpay_payment_id
            );

            // Step 5: Collect Fee
            const collectPayload = {
                initialization_id: initializationId,
                student_fee_allocation_id: allocation.fee_allocation_id,
                payment_mode_id: paymentModeId,
                total_amount_paid: amount,
                payment_date: new Date().toISOString().split('T')[0],
                transaction_reference: razorpayResponse.razorpay_payment_id,
                remarks: `Online payment via Razorpay - Order: ${razorpayResponse.razorpay_order_id}`,
                fee_line_payments: feeLinePayments
            };

            const collectResponse = await studentFeesService.collectStudentFee(collectPayload);

            if (collectResponse && collectResponse.receiptNumber) {
                setSuccessAlert({
                    title: 'Payment Successful!',
                    message: `Payment of ₹${amount.toLocaleString('en-IN')} completed successfully. Receipt No: ${collectResponse.receiptNumber}`
                });

                // Clear selections and refresh data
                setSelectedInstallments({});
                
                // Refresh allocations
                const studentId = getStudentId();
                if (studentId) {
                    const data = await studentFeesService.getStudentFeeAllocations(studentId);
                    setAllocations(data || []);
                }
            } else {
                setWarningAlert({
                    title: 'Payment Processed',
                    message: 'Payment was successful but receipt generation may be pending.'
                });
            }
        } catch (err) {
            console.error('Error processing payment:', err);
            setErrorAlert({
                title: 'Processing Error',
                message: 'Payment was received but there was an error processing it. Please contact administration.'
            });
        }
    };

    const handlePaymentFailure = async (initializationId) => {
        try {
            await studentFeesService.finalizeStudentPayment(initializationId, 'CANCELLED');
            setWarningAlert({
                title: 'Payment Cancelled',
                message: 'You have cancelled the payment.'
            });
        } catch (err) {
            console.error('Error handling payment cancellation:', err);
        }
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
                                    {/* Pay All Overdue Button */}
                                    {(() => {
                                        // Check if this allocation is reactivated
                                        const isReactivated = installmentActiveStatus[allocation.fee_allocation_id];

                                        // Calculate overdue installments using the same logic as individual cards
                                        const sortedFeeLines = allocation.fee_lines
                                            ? [...allocation.fee_lines]
                                                .filter(fl => fl.due_date)
                                                .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                                            : [];

                                        const overdueInstallments = allocation.installments.filter(inst => {
                                            if (inst.balance <= 0) return false;

                                            // Calculate due date using fee line logic
                                            let dueDate = null;

                                            if (sortedFeeLines.length > 0) {
                                                // Calculate cumulative amount covered by this installment
                                                let cumulativeInstallmentAmount = 0;
                                                for (let i = 1; i <= inst.installment_number; i++) {
                                                    const installment = allocation.installments.find(
                                                        ins => ins.installment_number === i
                                                    );
                                                    if (installment) {
                                                        cumulativeInstallmentAmount += installment.amount;
                                                    }
                                                }

                                                // Find which fee line this installment falls into
                                                let cumulativeFeeAmount = 0;
                                                let assignedDueDate = null;

                                                for (const feeLine of sortedFeeLines) {
                                                    cumulativeFeeAmount += feeLine.total_amount;
                                                    if (cumulativeInstallmentAmount <= cumulativeFeeAmount) {
                                                        assignedDueDate = new Date(feeLine.due_date);
                                                        break;
                                                    }
                                                }

                                                // If no match found, use the last fee line's due date
                                                if (!assignedDueDate && sortedFeeLines.length > 0) {
                                                    assignedDueDate = new Date(
                                                        sortedFeeLines[sortedFeeLines.length - 1].due_date
                                                    );
                                                }

                                                dueDate = assignedDueDate;
                                            } else if (inst.due_date) {
                                                dueDate = new Date(inst.due_date);
                                            }

                                            // Check if overdue
                                            if (!dueDate) return false;
                                            const currentISTDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
                                            return currentISTDate > dueDate;
                                        });

                                        const totalOverdue = overdueInstallments.reduce((sum, inst) => sum + inst.balance, 0);

                                        // Show banner if there are overdue installments AND system is NOT reactivated
                                        return totalOverdue > 0 && !isReactivated && (
                                            <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-xl">
                                                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                                                    <div>
                                                        <p className="text-sm font-bold text-red-900">⚠️ {overdueInstallments.length} Overdue Installment(s)</p>
                                                        <p className="text-xs text-red-700">Total Overdue: ₹{totalOverdue.toLocaleString('en-IN')}</p>
                                                    </div>
                                                    <button
                                                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-6 py-2.5 rounded-lg shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                                                        onClick={() => {
                                                            const overdueInstIds = overdueInstallments.map(inst => inst.installment_id);
                                                            handlePayment(allocation, overdueInstIds, true);
                                                        }}
                                                        disabled={processingPayment}
                                                    >
                                                        <AlertCircle size={16} />
                                                        Pay All Overdue
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {allocation.installments.map((inst) => {
                                            // Calculate due date for this installment
                                            let dueDate = null;

                                            // Sort fee lines by due date (earliest first)
                                            const sortedFeeLines = allocation.fee_lines
                                                ? [...allocation.fee_lines]
                                                    .filter(fl => fl.due_date)
                                                    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                                                : [];

                                            if (sortedFeeLines.length > 0) {
                                                // Calculate cumulative amount covered by this installment
                                                let cumulativeInstallmentAmount = 0;
                                                for (let i = 1; i <= inst.installment_number; i++) {
                                                    const installment = allocation.installments.find(
                                                        ins => ins.installment_number === i
                                                    );
                                                    if (installment) {
                                                        cumulativeInstallmentAmount += installment.amount;
                                                    }
                                                }

                                                // Find which fee line this installment falls into
                                                let cumulativeFeeAmount = 0;
                                                let assignedDueDate = null;

                                                for (const feeLine of sortedFeeLines) {
                                                    cumulativeFeeAmount += feeLine.total_amount;

                                                    // If cumulative installment amount falls within this fee line's range
                                                    if (cumulativeInstallmentAmount <= cumulativeFeeAmount) {
                                                        assignedDueDate = new Date(feeLine.due_date);
                                                        break;
                                                    }
                                                }

                                                // If no match found, use the last fee line's due date
                                                if (!assignedDueDate && sortedFeeLines.length > 0) {
                                                    assignedDueDate = new Date(
                                                        sortedFeeLines[sortedFeeLines.length - 1].due_date
                                                    );
                                                }

                                                dueDate = assignedDueDate;
                                            } else if (inst.due_date) {
                                                // Fallback to installment's own due_date if available
                                                dueDate = new Date(inst.due_date);
                                            }

                                            // Get current date in IST for overdue comparison
                                            const currentISTDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
                                            const isOverdue = dueDate && currentISTDate > dueDate && inst.balance > 0;

                                            // Check if this allocation is reactivated
                                            const isReactivated = installmentActiveStatus[allocation.fee_allocation_id];

                                            const isSelected = selectedInstallments[allocation.fee_allocation_id]?.includes(inst.installment_id) || false;

                                            return (
                                                <div
                                                    key={inst.installment_id}
                                                    className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${inst.balance === 0
                                                        ? 'bg-green-50 border-green-200'
                                                        : isSelected
                                                            ? 'border-blue-500 bg-blue-50 shadow-md'
                                                            : isOverdue
                                                                ? 'border-red-300 bg-red-50 ring-1 ring-red-200 hover:shadow-md'
                                                                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                                                        }`}
                                                    onClick={() => {
                                                        // Allow selection if not overdue OR if reactivated
                                                        if (inst.balance > 0 && (!isOverdue || isReactivated)) {
                                                            setSelectedInstallments(prev => {
                                                                const current = prev[allocation.fee_allocation_id] || [];
                                                                const isCurrentlySelected = current.includes(inst.installment_id);
                                                                return {
                                                                    ...prev,
                                                                    [allocation.fee_allocation_id]: isCurrentlySelected
                                                                        ? current.filter(id => id !== inst.installment_id)
                                                                        : [...current, inst.installment_id]
                                                                };
                                                            });
                                                        }
                                                    }}
                                                >
                                                    {/* Checkbox or Locked Icon */}
                                                    {inst.balance > 0 && (!isOverdue || isReactivated) && (
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => { }}
                                                            className="absolute top-3 left-3 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 pointer-events-none"
                                                        />
                                                    )}
                                                    {inst.balance > 0 && isOverdue && !isReactivated && (
                                                        <div className="absolute top-3 left-3 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center" title="Overdue - Auto-selected">
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                                            </svg>
                                                        </div>
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

                                                            {/* Due Date Display */}
                                                            {dueDate && (
                                                                <div className={`mb-2 pb-2 border-b ${isOverdue ? 'border-red-200' : 'border-gray-200'}`}>
                                                                    <div className="flex items-center gap-1">
                                                                        <Calendar size={12} className={isOverdue ? 'text-red-600' : 'text-gray-500'} />
                                                                        <span className={`text-xs ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                                                                            Due: {dueDate.toLocaleDateString('en-IN', {
                                                                                day: '2-digit',
                                                                                month: 'short',
                                                                                year: 'numeric'
                                                                            })}
                                                                        </span>
                                                                    </div>
                                                                    {isOverdue && (
                                                                        <span className="text-xs font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                                                                            ⚠️ Overdue
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}

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
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {(selectedInstallments[allocation.fee_allocation_id]?.length || 0) > 0 && (() => {
                                        // Check if this allocation is reactivated
                                        const isReactivated = installmentActiveStatus[allocation.fee_allocation_id];

                                        // Check if there are any overdue installments
                                        const sortedFeeLines = allocation.fee_lines
                                            ? [...allocation.fee_lines]
                                                .filter(fl => fl.due_date)
                                                .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                                            : [];

                                        const hasOverdue = allocation.installments.some(inst => {
                                            if (inst.balance <= 0) return false;

                                            let dueDate = null;
                                            if (sortedFeeLines.length > 0) {
                                                let cumulativeInstallmentAmount = 0;
                                                for (let i = 1; i <= inst.installment_number; i++) {
                                                    const installment = allocation.installments.find(
                                                        ins => ins.installment_number === i
                                                    );
                                                    if (installment) {
                                                        cumulativeInstallmentAmount += installment.amount;
                                                    }
                                                }

                                                let cumulativeFeeAmount = 0;
                                                for (const feeLine of sortedFeeLines) {
                                                    cumulativeFeeAmount += feeLine.total_amount;
                                                    if (cumulativeInstallmentAmount <= cumulativeFeeAmount) {
                                                        dueDate = new Date(feeLine.due_date);
                                                        break;
                                                    }
                                                }
                                                if (!dueDate && sortedFeeLines.length > 0) {
                                                    dueDate = new Date(sortedFeeLines[sortedFeeLines.length - 1].due_date);
                                                }
                                            } else if (inst.due_date) {
                                                dueDate = new Date(inst.due_date);
                                            }

                                            if (!dueDate) return false;
                                            const currentISTDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
                                            return currentISTDate > dueDate;
                                        });

                                        // Show Pay Selected if: no overdue OR system is reactivated
                                        return (!hasOverdue || isReactivated) && (
                                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3">
                                                <div>
                                                    <p className="text-sm font-bold text-blue-900">{selectedInstallments[allocation.fee_allocation_id].length} Installment(s) Selected</p>
                                                    <p className="text-xs text-blue-700">Total: ₹{allocation.installments.filter(i => selectedInstallments[allocation.fee_allocation_id]?.includes(i.installment_id)).reduce((sum, i) => sum + i.balance, 0).toLocaleString('en-IN')}</p>
                                                </div>
                                                <button
                                                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-2.5 rounded-lg shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                                                    onClick={() => {
                                                        handlePayment(allocation, selectedInstallments[allocation.fee_allocation_id], false);
                                                    }}
                                                    disabled={processingPayment}
                                                >
                                                    <CreditCard size={16} />
                                                    Pay Selected
                                                </button>
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : (
                                /* Simple Fee Line Items for non-installment */
                                // <div className="space-y-3">
                                //     <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b pb-2">
                                //         <FileText className="w-4 h-4" />
                                //         Fee Components
                                //     </h3>
                                //     <div className="divide-y">
                                //         {allocation.fee_lines?.map((line) => (
                                //             <div key={line.fee_line_id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2 group">
                                //                 <div>
                                //                     <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors uppercase">{line.particular_name}</p>
                                //                     <p className="text-[10px] text-gray-400 font-medium mt-0.5">Due by: {line.due_date ? new Date(line.due_date).toLocaleDateString('en-IN') : 'N/A'}</p>
                                //                 </div>
                                //                 <div className="flex sm:flex-col justify-between items-center sm:items-end sm:text-right border-t sm:border-0 pt-2 sm:pt-0">
                                //                     <p className="text-sm font-black text-gray-800">₹{line.total_amount.toLocaleString('en-IN')}</p>
                                //                     {line.balance > 0 && (
                                //                         <p className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded">₹{line.balance.toLocaleString('en-IN')} PENDING</p>
                                //                     )}
                                //                 </div>
                                //             </div>
                                //         ))}
                                //     </div>
                                //     {allocation.pending_amount > 0 && (
                                //         <div className="pt-4 flex justify-end">
                                //             <button
                                //                 className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 sm:px-8 py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                //                 onClick={() => {
                                //                     setSuccessAlert({
                                //                         title: 'Payment Initiated',
                                //                         message: `Proceeding to payment gateway. Total Amount: ₹${allocation.pending_amount.toLocaleString('en-IN')}`
                                //                     });
                                //                 }}
                                //             >
                                //                 <CreditCard size={18} />
                                //                 <span className="text-sm sm:text-base">Pay Semester Balance (₹{allocation.pending_amount.toLocaleString('en-IN')})</span>
                                //             </button>
                                //         </div>
                                //     )}
                                // </div>
                                allocation.pending_amount > 0 && (
                                    <div className="pt-4 flex justify-end">
                                        <button
                                            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 sm:px-8 py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                            onClick={() => {
                                                handlePayment(allocation, null, false);
                                            }}
                                            disabled={processingPayment}
                                        >
                                            <CreditCard size={18} />
                                            <span className="text-sm sm:text-base">Pay  Balance (₹{allocation.pending_amount.toLocaleString('en-IN')})</span>
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default StudentFeesDetails;
