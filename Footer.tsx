import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="footer glass">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="28" height="28" rx="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M10 20 L16 10 L22 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="16" cy="16" r="2.5" fill="currentColor" />
            </svg>
          </div>
          <div className="footer-text">
            <span className="footer-name">CRI Recon</span>
            <span className="footer-domain">meronga.web.id</span>
          </div>
        </div>
        <div className="footer-meta">
          <span className="footer-built">Built for OSINT learning</span>
          <span className="footer-sep">·</span>
          <a href="https://meronga.web.id" className="footer-link" target="_blank" rel="noopener noreferrer">meronga.web.id</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span className="footer-credit">Recon results are ephemeral — data not stored.</span>
      </div>
    </footer>
  );
};

export default Footer;
