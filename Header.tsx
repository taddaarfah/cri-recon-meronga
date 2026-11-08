import React from "react";

const Header: React.FC = () => {
  return (
    <header className="header glass">
      <div className="header-inner">
        <div className="header-brand">
          <div className="brand-icon">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="28" height="28" rx="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M10 20 L16 10 L22 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="16" cy="16" r="2.5" fill="currentColor" />
            </svg>
          </div>
          <div className="brand-text">
            <h1 className="brand-name">CRI Recon</h1>
            <span className="brand-sub">meronga.web.id</span>
          </div>
        </div>
        <nav className="header-nav">
          <a href="#about" className="nav-link">Tentang</a>
          <a href="https://meronga.web.id" target="_blank" rel="noopener noreferrer" className="nav-link nav-external">
            Website
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 13L16 19M16 19H7M16 19V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </nav>
      </div>
      <div className="header-tagline">
        OSINT Reconnaissance Framework
      </div>
    </header>
  );
};

export default Header;
