import React, { useState, useEffect, useRef } from 'react';
import { useUserProfile } from '../../../../../../contexts/UserProfileContext'; 
import { AluminiService } from '../../Service/Alumini.service';
const { getAluminiDetails } = AluminiService;

const AluminiDashboard = () => {
    const { profile } = useUserProfile();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const hasFetched = useRef(false); 

    useEffect(() => {
        if (!profile?.student_id) {
            setError("Student profile not found.");
            setLoading(false);
            return;
        }

        if (hasFetched.current) return; 
        hasFetched.current = true;

        const fetchAlumniDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getAluminiDetails(profile.student_id);

                const lastEvent = response.alumni_events && response.alumni_events.length > 0
                    ? response.alumni_events[0]
                    : null;

                const mappedData = {
                    name: response.student_name || "N/A",
                    mobile: response.mobile || "N/A",
                    passingYear: response.graduation_year || "N/A",
                    batch: "N/A", 
                    city: response.city || "N/A",
                    country: response.country || "India",
                    employment: response.current_status || "N/A",
                    ctc: "N/A", 
                    lastEventName: lastEvent ? lastEvent.event_name : "N/A",
                    dob: response.date_of_birth
                        ? new Date(response.date_of_birth).toLocaleDateString('en-GB')
                        : "N/A",
                    email: response.email || "N/A",
                    program: "N/A", 
                    address: response.address || response.address_line1 || "N/A",
                    state: response.state || "N/A",
                    pinCode: response.pincode || "N/A",
                    employerName: response.company || "N/A",
                    lastEventDate: lastEvent && lastEvent.attended_date
                        ? new Date(lastEvent.attended_date).toLocaleDateString('en-GB')
                        : "N/A",
                    lastEventAttend: lastEvent && lastEvent.attended ? "Yes" : "No"
                };

                setData(mappedData);
            } catch (err) {
                console.error("Error fetching alumni details:", err);
                setError("Failed to load alumni details.");
            } finally {
                setLoading(false);
            }
        };

        fetchAlumniDetails();
    }, [profile?.student_id]);

    const InfoItem = ({ label, value, isPill, pillColor }) => (
        <div className="flex flex-col sm:flex-row items-start mb-4 text-sm gap-1 sm:gap-0">
            <span className="font-semibold text-slate-800 sm:min-w-[180px] lg:min-w-[220px]">{label} :</span>
            {isPill ? (
                <span className={`px-3 py-0.5 rounded-full text-[10px] md:text-xs font-semibold ${pillColor}`}>
                    {value || "N/A"}
                </span>
            ) : (
                <span className="text-slate-500 break-words">{value || "N/A"}</span>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading alumni details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-700">{error}</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                No alumni data available.
            </div>
        );
    }

    return (
        <div className="bg-white p-4 md:p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {/* Left Column */}
                <div>
                    <InfoItem label="Alumni Name" value={data.name} />
                    <InfoItem label="Mobile No." value={data.mobile} />
                    <InfoItem label="Passing Year" value={data.passingYear} />
                    <InfoItem label="Batch" value={data.batch} />
                    <InfoItem label="City" value={data.city} />
                    <InfoItem label="Country" value={data.country} />
                    <InfoItem
                        label="Current Employement"
                        value={data.employment}
                        isPill
                        pillColor="bg-amber-100 text-amber-600"
                    />
                    <InfoItem label="Current CTC" value={data.ctc} />
                    <div className="hidden lg:block">
                        <InfoItem label="Last Institute Alumni Event Name" value={data.lastEventName} />
                    </div>
                </div>

                {/* Right Column */}
                <div>
                    <InfoItem label="Date of birth" value={data.dob} />
                    <InfoItem label="Email ID" value={data.email} />
                    <InfoItem label="Program" value={data.program} />
                    <InfoItem label="Address" value={data.address} />
                    <InfoItem label="State" value={data.state} />
                    <InfoItem label="Pin code" value={data.pinCode} />
                    <InfoItem label="Employer Name" value={data.employerName} />
                    <InfoItem label="Last Institute Alumni Event Date" value={data.lastEventDate} />
                    <div className="lg:hidden">
                        <InfoItem label="Last Institute Alumni Event Name" value={data.lastEventName} />
                    </div>
                    <InfoItem
                        label="Last Institute Alumni Event Attend"
                        value={data.lastEventAttend}
                        isPill
                        pillColor={data.lastEventAttend === "Yes" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}
                    />
                </div>
            </div>
        </div>
    );
};

export default AluminiDashboard;
