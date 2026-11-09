"use client";

import { useState } from "react";
import Header from "@/components/Header";
import ReconForm from "@/components/ReconForm";
import Results from "@/components/Results";
import Footer from "@/components/Footer";

export default function Home() {
  const [results, setResults] = useState<Record<string, any>>({});

  return (
    <div className="app">
      <Header />

      <main className="main">
        <section className="hero glass">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              OSINT Tool
            </div>
            <h2 className="hero-title">
              Web Reconnaissance <br />
              <span className="title-line">Framework</span>
            </h2>
            <p className="hero-desc">
              Jalankan subdomain discovery, HTTP probing, directory enumeration,
              WAF detection, dan security check — sekaligus, dari satu interface.
            </p>
            <div className="hero-features">
              {[
                "Subdomain Enumeration (CRT.sh)",
                "HTTP Probe & Tech Fingerprint",
                "Directory Bruteforce",
                "WAF & Server Detect",
                "Security Header Analysis",
              ].map((f, i) => (
                <div key={i} className="hero-feature">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {f}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="recon-section">
          <ReconForm onResults={setResults} />
        </section>

        <section className="about-section" id="about">
          <div className="about-card glass">
            <div className="about-inner">
              <h3 className="about-title">Tentang Tools Ini</h3>
              <p className="about-text">
                CRI Recon adalah tools reconnaissance berbasis web yang dibangun
                untuk keperluan pembelajaran OSINT dan security assessment.
                Tools ini menggabungkan beberapa teknik recon dasar ke dalam
                satu interface yang sederhana.
              </p>
              <div className="about-grid">
                <div className="about-item">
                  <span className="about-item-label">Subdomain</span>
                  <span className="about-item-desc">Certificate Transparency logs via crt.sh API</span>
                </div>
                <div className="about-item">
                  <span className="about-item-label">HTTP Probe</span>
                  <span className="about-item-desc">HTTP request ke target, ambil status, headers, title</span>
                </div>
                <div className="about-item">
                  <span className="about-item-label">Dir Search</span>
                  <span className="about-item-desc">Wordlist-based path enumeration</span>
                </div>
                <div className="about-item">
                  <span className="about-item-label">WAF Detect</span>
                  <span className="about-item-desc">Analisis header dan response characteristic</span>
                </div>
                <div className="about-item">
                  <span className="about-item-label">Security Check</span>
                  <span className="about-item-desc">Security header audit & common misconfiguration check</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Results results={results} />

      <Footer />
    </div>
  );
}
