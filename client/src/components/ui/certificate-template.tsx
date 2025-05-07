import { User, Course } from "@shared/schema";

interface CertificateTemplateProps {
  user: Partial<User>;
  course: Partial<Course>;
  certificateNumber: string;
  issueDate: Date;
  printable?: boolean;
}

const CertificateTemplate = ({
  user,
  course,
  certificateNumber,
  issueDate,
  printable = false
}: CertificateTemplateProps) => {
  const dateFormatted = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(issueDate);

  // QR code content for verification
  const verificationUrl = `${window.location.origin}/certificates/verify/${certificateNumber}`;

  return (
    <div className={`certificate-container ${printable ? 'print:p-0 print:border-0' : ''}`}>
      {/* Certificate header */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-2 mb-4">
          <svg
            className="h-12 w-12 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          <h1 className="text-3xl font-bold text-primary">Taalim</h1>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Certificate of Completion</h2>
        <p className="text-gray-500">This is to certify that</p>
      </div>

      {/* Recipient name */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 border-b border-gray-300 pb-2 inline-block px-8">
          {user.fullName || "Student Name"}
        </h2>
      </div>

      {/* Certificate body */}
      <div className="text-center mb-8">
        <p className="text-lg text-gray-700 mb-4">
          has successfully completed the course
        </p>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {course.title || "Course Title"}
        </h3>
        <p className="text-gray-700">
          with a total of {course.durationHours?.toFixed(1) || "--"} hours of learning material
        </p>
      </div>

      {/* Certificate footer */}
      <div className="flex justify-between items-end mt-12">
        <div>
          <p className="text-sm text-gray-600 mb-1">Issue Date</p>
          <p className="font-bold">{dateFormatted}</p>
          <p className="text-sm text-gray-600 mt-4 mb-1">Certificate ID</p>
          <p className="font-mono text-xs">{certificateNumber}</p>
        </div>

        <div className="text-center">
          <div className="w-40 h-px bg-gray-400 mb-2 mx-auto"></div>
          <p className="font-bold">Instructor Signature</p>
        </div>
        
        <div>
          {/* QR Code placeholder */}
          <div className="border-2 border-gray-300 w-24 h-24 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <rect x="7" y="7" width="3" height="3" />
              <rect x="14" y="7" width="3" height="3" />
              <rect x="7" y="14" width="3" height="3" />
              <rect x="14" y="14" width="3" height="3" />
            </svg>
          </div>
          <p className="text-xs text-gray-500 mt-1">Verify certificate</p>
        </div>
      </div>

      {/* Verification text */}
      <div className="text-center mt-8">
        <p className="text-xs text-gray-500">
          Verify this certificate at: <span className="font-mono">{verificationUrl}</span>
        </p>
      </div>
    </div>
  );
};

export default CertificateTemplate;
