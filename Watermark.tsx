import React from "react";

const Watermark: React.FC = () => {
  return (
    <div className="watermark" aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="28" height="28" rx="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M10 20 L16 10 L22 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="16" cy="16" r="2.5" fill="currentColor" />
      </svg>
      meronga.web.id
    </div>
  );
};

export default Watermark;
