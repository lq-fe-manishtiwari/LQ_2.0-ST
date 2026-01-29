import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { regularFormService } from "../Service/RegularFormService";

const RegularForm = () => {
  const [open, setOpen] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [examForms, setExamForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feeData, setFeeData] = useState(null);
  const [loadingFees, setLoadingFees] = useState(false);
  const [studentHistory, setStudentHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Get student ID from localStorage or context
  const getStudentId = () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      return currentUser?.jti || null; // Adjust based on your user structure
    } catch (error) {
      console.error('Error getting student ID:', error);
      return null;
    }
  };

  // Load fee data and student history when payment modal opens
  const loadFeeData = async (form) => {
    const studentId = getStudentId();
    if (!studentId || !form) return;

    setLoadingHistory(true);
    setLoadingFees(true);
    try {
      // First call getStudentHistory to get proper IDs
      const historyResponse = await regularFormService.getStudentHistory(
        parseInt(studentId), 
        parseInt(form.academic_year_id), 
        parseInt(form.semester_id)
      );
      setStudentHistory(historyResponse);
      
      // Then use the IDs from history response for allocateExamFees
      const studentData = historyResponse?.[0];
      const payload = {
        academic_year_id: studentData?.academic_year_id || parseInt(form.academic_year_id),
        semester_id: studentData?.semester_id || parseInt(form.semester_id),
        fee_type_id: parseInt(form.fee_type_id),
        student_ids: [parseInt(studentId)]
      };
      
      console.log('Payment API payload:', payload);
      const feeResponse = await regularFormService.allocateExamFees(payload);
      setFeeData(feeResponse);
    } catch (error) {
      console.error('Failed to load data:', error);
      setFeeData(null);
      setStudentHistory(null);
    } finally {
      setLoadingFees(false);
      setLoadingHistory(false);
    }
  };

  const handlePayNowClick = (form) => {
    setSelectedForm(form);
    setPaymentModal(true);
    loadFeeData(form);
  };

  // Razorpay payment handler
  const handleRazorpayPayment = () => {
    const totalAmount = feeData?.reduce((total, allocation) => total + (allocation.pending_amount || 0), 0) || 1700;
    const studentData = studentHistory?.[0];
    
    const options = {
      key: "rzp_test_9WseLWo2O16lbc",
      amount: totalAmount * 100,
      currency: "INR",
      name: "Exam Fee Payment",
      description: `Payment for ${selectedForm?.exam_form_name}`,
      handler: function (response) {
        console.log('Payment successful:', response);
        setPaymentModal(false);
        alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
      },
      prefill: {
        name: studentData?.firstname + " " + studentData?.lastname || "Student",
        email: studentData?.email || "",
        contact: studentData?.mobile || ""
      },
      theme: {
        color: "#3B82F6"
      },
      modal: {
        ondismiss: function() {
          setProcessingPayment(false);
        }
      }
    };

    setProcessingPayment(true);
    const rzp = new window.Razorpay(options);
    rzp.open();
  };
  // Load student exam forms on component mount
  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    const loadExamForms = async () => {
      const studentId = getStudentId();
      if (!studentId) {
        setLoading(false);
        return;
      }

      try {
        const response = await regularFormService.getStudentExamForms(studentId);
        setExamForms(response || []);
      } catch (error) {
        console.error('Failed to load exam forms:', error);
        setExamForms([]);
      } finally {
        setLoading(false);
      }
    };

    loadExamForms();
  }, []);

  return (
    <>
      {/* MAIN PAGE */}
      <div className="bg-gray-50 p-6 rounded-xl">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search exam forms..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => setOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg flex items-center gap-2"
          >
            Fill Form
          </button>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          My Exam Forms
        </h2>

        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading exam forms...
          </div>
        ) : examForms.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No exam forms found.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl shadow bg-white">
            <table className="w-full text-sm">
              <thead className="table-header">
                <tr>
                  <th className="table-th">Sr. No</th>
                  <th className="table-th">Exam Form Name</th>
                  <th className="table-th">Program</th>
                  <th className="table-th">Batch</th>
                  <th className="table-th">Academic Year</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Payment Status</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {examForms.map((form, index) => (
                  <tr key={form.student_exam_form_id || index} className="border-b last:border-none hover:bg-gray-50">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3 font-medium">{form.exam_form_name || 'N/A'}</td>
                    <td className="px-4 py-3">{form.program_name || 'N/A'}</td>
                    <td className="px-4 py-3">{form.batch_name || 'N/A'}</td>
                    <td className="px-4 py-3">{form.academic_year_name || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        form.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        form.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        form.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {form.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        form.payment_details ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {form.payment_details ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center items-center gap-2">
                        {!form.payment_details && (
                          <button 
                            onClick={() => handlePayNowClick(form)}
                            className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-1 rounded"
                          >
                            Pay Now
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= EXAM REGISTRATION MODAL ================= */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-[95%] max-w-6xl rounded-xl shadow-lg overflow-hidden">
            <div className="bg-[#6b74a6] px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Exam Registration Form</h3>
              <button onClick={() => setOpen(false)}>
                <X className="text-white" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="font-semibold">Name</label>
                  <input value="Rajesh Patil" disabled className="w-full mt-2 p-3 bg-gray-100 border rounded-lg" />
                </div>
                <div>
                  <label className="font-semibold">Enrollment No.</label>
                  <input value="454" disabled className="w-full mt-2 p-3 bg-gray-100 border rounded-lg" />
                </div>
                <div>
                  <label className="font-semibold">Roll No.</label>
                  <input value="123" disabled className="w-full mt-2 p-3 bg-gray-100 border rounded-lg" />
                </div>
              </div>
              <h4 className="font-semibold mb-3">Select Course</h4>
              <div className="overflow-x-auto">
                <table className="w-full border">
                  <thead className="bg-blue-500 text-white">
                    <tr>
                      <th className="p-3">Sr No.</th>
                      <th className="p-3">Vertical</th>
                      <th className="p-3">Course Code</th>
                      <th className="p-3">Course Name</th>
                      <th className="p-3">Select</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-center bg-gray-50">
                      <td className="p-3">1</td>
                      <td className="p-3">Vertical 3 Open Elective Basket</td>
                      <td className="p-3">-</td>
                      <td className="p-3">Ninja</td>
                      <td className="p-3"><input type="checkbox" /></td>
                    </tr>
                    <tr className="text-center">
                      <td className="p-3">2</td>
                      <td className="p-3">Vertical 2 Minor Basket</td>
                      <td className="p-3">-</td>
                      <td className="p-3">BEM1</td>
                      <td className="p-3"><input type="checkbox" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex justify-center gap-4 mt-8">
                <button onClick={() => setOpen(false)} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Cancel</button>
                <button className="bg-blue-400 text-white px-6 py-2 rounded-lg">Pay & Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= PAYMENT MODAL ================= */}
      {paymentModal && selectedForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-lg overflow-hidden">
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Payment Details - {selectedForm.exam_form_name}</h3>
              <button onClick={() => setPaymentModal(false)}>
                <X className="text-white" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Student Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold mb-3 text-gray-800">Student Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium">{studentHistory?.[0]?.student_name || "Rajesh Patil"}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Roll Number:</span>
                    <p className="font-medium">{studentHistory?.[0]?.roll_number || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Program:</span>
                    <p className="font-medium">{studentHistory?.[0]?.academic_year?.program?.program_name || selectedForm.program_name}</p>
                  </div>
                </div>
              </div>

              {/* Fee Details */}
              <div className="mb-6">
                <h4 className="font-semibold mb-4 text-gray-800">Fee Breakdown</h4>
                {loadingFees ? (
                  <div className="p-6 text-center text-gray-500">
                    Loading fee details...
                  </div>
                ) : feeData && feeData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Fee Type</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-700">Total</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-700">Paid</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-700">Balance</th>
                          <th className="px-3 py-2 text-center font-medium text-gray-700">Due Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feeData.map((allocation, index) => 
                          allocation.fee_lines?.map((feeLine, lineIndex) => (
                            <tr key={`${index}-${lineIndex}`} className="border-t">
                              <td className="px-3 py-2">{feeLine.particular_name}</td>
                              <td className="px-3 py-2 text-right font-medium">₹{feeLine.total_amount || 0}</td>
                              <td className="px-3 py-2 text-right font-medium">₹{feeLine.paid_amount || 0}</td>
                              <td className="px-3 py-2 text-right font-medium">₹{feeLine.balance || 0}</td>
                              <td className="px-3 py-2 text-center">{feeLine.due_date || 'N/A'}</td>
                            </tr>
                          ))
                        )}
                        <tr className="border-t bg-blue-50">
                          <td className="px-3 py-2 font-semibold">Total</td>
                          <td className="px-3 py-2 text-right font-bold text-blue-600">
                            ₹{feeData.reduce((total, allocation) => total + (allocation.total_fees || 0), 0)}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-green-600">
                            ₹{feeData.reduce((total, allocation) => total + (allocation.paid_amount || 0), 0)}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-red-600">
                            ₹{feeData.reduce((total, allocation) => total + (allocation.pending_amount || 0), 0)}
                          </td>
                          <td className="px-3 py-2"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No fee data available
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-gray-800">Payment Method</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="radio" name="payment" value="online" className="mr-2" defaultChecked />
                    <span>Online Payment (UPI/Card/Net Banking)</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="payment" value="offline" className="mr-2" />
                    <span>Offline Payment (Bank Transfer)</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <button 
                  onClick={() => setPaymentModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRazorpayPayment}
                  disabled={processingPayment || !feeData}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {processingPayment ? 'Processing...' : `Proceed to Pay ₹${feeData?.reduce((total, allocation) => total + (allocation.pending_amount || 0), 0) || 1700}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RegularForm;