import React from 'react';

const AluminiDashboard = () => {
    const data = {
        name: "Tejas Chuadhari",
        mobile: "1234567890",
        passingYear: "25-08-2025",
        batch: "2021-2025",
        city: "Gadchiroli",
        country: "India",
        employment: "Self-employed",
        ctc: "2.5 LPA",
        lastEventName: "Yearly Alumni get together",
        dob: "01-01-1999",
        email: "Example.mail@gmail.com",
        program: "Engineering - Mechanical Engineer",
        address: "camp area, potegaon bypass road, gadchiroli",
        state: "Maharashtra",
        pinCode: "442605",
        employerName: "LearnQoch Pvt. Ltd.",
        lastEventDate: "25-October-2025",
        lastEventAttend: "Yes"
    };

    const InfoItem = ({ label, value, isPill, pillColor }) => (
        <div className="flex flex-col sm:flex-row items-start mb-4 text-sm gap-1 sm:gap-0">
            <span className="font-semibold text-slate-800 sm:min-w-[180px] lg:min-w-[220px]">{label} :</span>
            {isPill ? (
                <span className={`px-3 py-0.5 rounded-full text-[10px] md:text-xs font-semibold ${pillColor}`}>
                    {value}
                </span>
            ) : (
                <span className="text-slate-500 break-words">{value}</span>
            )}
        </div>
    );

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
                        pillColor="bg-green-100 text-green-600"
                    />
                </div>
            </div>
        </div>
    );
};

export default AluminiDashboard;
