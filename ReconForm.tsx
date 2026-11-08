"use client";

import React, { useState, useCallback } from "react";

interface FormData {
  target: string;
  subdomain: boolean;
  httpprobe: boolean;
  dirsearch: boolean;
  wafdetect: boolean;
  vulncheck: boolean;
  threads: number;
}

interface StageResult {
  stage: string;
  status: "running" | "done" | "error";
  data: Record<string, any>;
  message?: string;
}

interface ReconFormProps {
  onResults: (results: Record<string, any>) => void;
}

const ReconForm: React.FC<ReconFormProps> = ({ onResults }) => {
  const [form, setForm] = useState<FormData>({
    target: "",
    subdomain: true,
    httpprobe: true,
    dirsearch: true,
    wafdetect: true,
    vulncheck: true,
    threads: 5,
  });

  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const update = useCallback((key: keyof FormData, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const addLog = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString("id-ID");
    setLog(prev => [...prev, `[${timestamp}] ${msg}`]);
  }, []);

  const runRecon = useCallback(async () => {
    const target = form.target.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!target) {
      alert("Masukin target dulu bro");
      return;
    }

    setRunning(true);
    onResults({});
    setLog([]);
    addLog(`Memulai recon terhadap ${target}`);

    try {
      const stages: { key: string; label: string; enabled: boolean }[] = [
        { key: "subdomain", label: "Subdomain Enumeration", enabled: form.subdomain },
        { key: "httpprobe", label: "HTTP Probe", enabled: form.httpprobe },
        { key: "dirsearch", label: "Directory Bruteforce", enabled: form.dirsearch },
        { key: "wafdetect", label: "WAF & Tech Detect", enabled: form.wafdetect },
        { key: "vulncheck", label: "Security Check", enabled: form.vulncheck },
      ];

      const allResults: Record<string, any> = {};

      for (const stage of stages) {
        if (!stage.enabled) {
          addLog(`⏭  Lewat: ${stage.label}`);
          continue;
        }

        addLog(`▶  Tahap: ${stage.label}`);

        try {
          const res = await fetch("/api/recon", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              target,
              stage: stage.key,
              threads: form.threads,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Request gagal");
          }

          allResults[stage.key] = {
            stage: stage.label,
            status: "done" as const,
            data: data,
            message: data.message,
          };

          addLog(`✅  Selesai: ${stage.label} — ${data.summary || "dapat data"}`);
        } catch (err: any) {
          allResults[stage.key] = {
            stage: stage.label,
            status: "error" as const,
            data: {},
            message: err.message || "error",
          };
          addLog(`❌  Gagal: ${stage.label} — ${err.message}`);
        }

        await new Promise(r => setTimeout(r, 250));
      }

      onResults(allResults);
      addLog(`🏁  Recon selesai. Total tahap: ${stages.filter(s => s.enabled).length}`);
    } catch (err) {
      addLog(`💥  Error fatal: ${err}`);
    } finally {
      setRunning(false);
    }
  }, [form, onResults, addLog]);

  return (
    <div className="recon-form-wrap glass">
      <div className="recon-form">
        <div className="form-section">
          <label className="form-label">
            <span className="label-text">Target</span>
            <span className="label-hint">domain atau URL (contoh: example.com)</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="example.com atau https://example.com/path"
            value={form.target}
            onChange={(e) => update("target", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !running && runRecon()}
            disabled={running}
            autoComplete="off"
          />
        </div>

        <div className="form-section">
          <label className="form-label">
            <span className="label-text">Opsi Recon</span>
          </label>
          <div className="options-grid">
            {[
              { key: "subdomain" as const, label: "Subdomain Enum", desc: "CRT.sh + cert transparency" },
              { key: "httpprobe" as const, label: "HTTP Probe", desc: "Status, headers, tech detect" },
              { key: "dirsearch" as const, label: "Dir Bruteforce", desc: "Wordlist path scan" },
              { key: "wafdetect" as const, label: "WAF Detect", desc: "WAF & server fingerprint" },
              { key: "vulncheck" as const, label: "Security Check", desc: "Headers & vuln indicators" },
            ].map(opt => (
              <label key={opt.key} className={`option-chip ${form[opt.key] ? "active" : ""}`}>
                <input
                  type="checkbox"
                  checked={form[opt.key]}
                  onChange={(e) => update(opt.key, e.target.checked)}
                  disabled={running}
                />
                <span className="chip-inner">
                  <span className="chip-label">{opt.label}</span>
                  <span className="chip-desc">{opt.desc}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <label className="form-label">
            <span className="label-text">Threads</span>
            <span className="label-hint">jumlah request paralel (1–10)</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={form.threads}
            onChange={(e) => update("threads", parseInt(e.target.value))}
            disabled={running}
            className="form-range"
          />
          <div className="range-value">{form.threads} request</div>
        </div>

        <button
          className="btn-primary"
          onClick={runRecon}
          disabled={running || !form.target.trim()}
        >
          {running ? (
            <span className="btn-loading">
              <span className="spinner"></span>
              Sedang berjalan...
            </span>
          ) : (
            "Jalankan Recon"
          )}
        </button>
      </div>

      {log.length > 0 && (
        <div className="log-panel glass">
          <div className="log-header">
            <span className="log-title">Log Activity</span>
            <button className="log-clear" onClick={() => setLog([])}>bersihkan</button>
          </div>
          <div className="log-body">
            {log.map((line, i) => (
              <div key={i} className="log-line">{line}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReconForm;
