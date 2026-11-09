import { NextRequest, NextResponse } from "next/server";

// Wordlist untuk directory bruteforce
const DIR_WORDLIST = [
  "admin", "login", "signin", "signup", "register", "register.php",
  "wp-admin", "wp-login.php", "administrator", "admin.php",
  "dashboard", "panel", "cpanel", "controlpanel",
  "api", "api/v1", "api/v2", "graphql", "rest",
  "config", "configuration", "env", ".env", ".git",
  "backup", "backups", "database", "db",
  "docs", "documentation", "wiki", "help",
  "assets", "static", "public", "resources",
  "uploads", "files", "media", "images",
  "css", "js", "javascript", "styles",
  "robots.txt", "sitemap.xml", "security.txt",
  "crossdomain.xml", "clientaccesspolicy.xml",
  "phpinfo.php", "info.php", "test.php",
  "cron", "crons", "scheduler",
  "status", "health", "ping",
  "monitor", "metrics", "prometheus",
  "debug", "debugger", "profiler",
  "internal", "private", "secret",
  "logs", "log", "archive",
  "download", "export", "import",
  "user", "users", "profile", "account",
  "settings", "config", "preferences",
  "mail", "email", "smtp",
  "dev", "development", "staging",
  "test", "qa", "acceptance",
  "old", "legacy", "v1", "v2",
  "mobile", "app", "ios", "android",
  "blog", "news", "press", "media",
  "shop", "store", "cart", "checkout",
  "search", "query", "results",
  "feed", "rss", "atom",
  "webmail", "mail", "email",
  "support", "contact", "about",
  "terms", "privacy", "legal",
  "api.php", "rest.php", "json",
  "administrator", "manage", "management",
  "console", "control", "panel",
  "portal", "portal.php",
  "auth", "authentication", "oauth",
  "webhook", "webhooks",
  "status", "statuspage",
  "favicon.ico", "icon.png", "logo.png",
  "humans.txt", "security.txt",
  "manifest.json", "browserconfig.xml",
  "apple-touch-icon", "mstile",
];

// Common subdomain prefixes
const SUB_PIX = [
  "www", "mail", "webmail", "smtp", "pop", "pop3", "imap",
  "blog", "news", "forum", "forums", "community", "support",
  "dev", "development", "staging", "test", "sandbox", "beta",
  "api", "rest", "graphql", "static", "cdn", "assets",
  "admin", "panel", "portal", "dashboard", "cpanel", "webadmin",
  "vpn", "remote", "proxy", "mailserver", "ns", "ns1", "ns2",
  "dns", "dns1", "dns2", "mx", "mx1", "mx2",
  "secure", "ssl", "https", "ftp", "ftps", "sftp",
  "git", "github", "gitlab", "bitbucket",
  "jenkins", "ci", "cd", "build", "deploy",
  "monitor", "metrics", "status", "uptime",
  "wiki", "docs", "documentation", "help", "kb",
  "shop", "store", "cart", "checkout", "payment",
  "app", "mobile", "ios", "android",
  "newsletter", "subscribe", "mailing",
  "office", "corp", "corporate", "company",
  "intranet", "internal", "private",
  "partner", "partners", "affiliate",
  "reseller", "agency", "client",
  "staging", "preprod", "uat",
];

// Security findings templates
const SECURITY_CHECKS = [
  {
    check: "x-frame-options",
    title: "X-Frame-Options Missing",
    description: "Halaman tidak memiliki X-Frame-Options header. Membuka peluang clickjacking attack di browser lama.",
    recommendation: "Tambahkan header X-Frame-Options: DENY atau SAMEORIGIN.",
    level: "medium" as const,
  },
  {
    check: "content-security-policy",
    title: "Content-Security-Policy Missing",
    description: "Tidak ada CSP header. Aplikasi lebih rentan terhadap XSS dan data injection.",
    recommendation: "Implement CSP header dengan policy yang tepat untuk aplikasi.",
    level: "medium" as const,
  },
  {
    check: "x-xss-protection",
    title: "X-XSS-Protection Missing",
    description: "X-XSS-Protection header tidak ditemukan. Browser lama tanpa perlindungan XSS built-in.",
    recommendation: "Tambahkan X-XSS-Protection: 1; mode=block untuk kompatibilitas browser lama.",
    level: "low" as const,
  },
  {
    check: "x-content-type-options",
    title: "X-Content-Type-Options Missing",
    description: "Tanpa X-Content-Type-Options: nosniff, browser bisa misinterpret MIME type.",
    recommendation: "Tambahkan X-Content-Type-Options: nosniff.",
    level: "low" as const,
  },
  {
    check: "strict-transport-security",
    title: "HSTS Missing",
    description: "Strict-Transport-Security header tidak ditemukan. HTTP-to-HTTPS redirect belum di-enforce.",
    recommendation: "Tambahkan Strict-Transport-Security: max-age=31536000; includeSubDomains.",
    level: "medium" as const,
  },
  {
    check: "server-disclosure",
    title: "Server Header Disclosure",
    description: "Header Server mengandung informasi versi yang spesifik.",
    recommendation: "Pertimbangkan untuk menyembunyikan atau menyederhanakan header Server.",
    level: "low" as const,
  },
  {
    check: "powered-by-disclosure",
    title: "X-Powered-By Disclosure",
    description: "X-Powered-By header mengungkapkan teknologi backend yang digunakan.",
    recommendation: "X-Powered-By sebaiknya dihilangkan atau disamarkan.",
    level: "low" as const,
  },
  {
    check: "cors-misconfig",
    title: "CORS Header Present",
    description: "Access-Control-Allow-Origin terdeteksi. Cek apakah origin terlalu permissive.",
    recommendation: "Pastikan CORS hanya mengizinkan origin yang diperlukan.",
    level: "low" as const,
  },
  {
    check: "cache-control",
    title: "Cache-Control Missing",
    description: "Tidak ada Cache-Control header yang jelas. Konten mungkin di-cache oleh proxy.",
    recommendation: "Tambahkan Cache-Control: no-store untuk halaman sensitif.",
    level: "low" as const,
  },
];

function normalizeTarget(target: string): string {
  return target.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "").trim().toLowerCase();
}

function isDomainValid(domain: string): boolean {
  const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
  return domainRegex.test(domain) && domain.length > 3 && domain.length < 254;
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { target, stage, threads } = body;

    if (!target || !stage) {
      return NextResponse.json(
        { error: "target dan stage wajib diisi" },
        { status: 400 }
      );
    }

    const domain = normalizeTarget(target);
    if (!isDomainValid(domain)) {
      return NextResponse.json(
        { error: "Target tidak valid. Masukkan domain yang benar." },
        { status: 400 }
      );
    }

    const ttl = 30;
    let result: any = {};

    switch (stage) {
      case "subdomain": {
        const baseUrl = `https://crt.sh/?q=%25.${domain}&output=json&limit=200`;
        let subdomains: string[] = [];

        try {
          const crResponse = await fetchWithTimeout(baseUrl, {
            headers: {
              "User-Agent": "CRI-Recon/1.0 (OSINT learning tool; meronga.web.id)",
            },
          }, ttl * 1000);

          if (crResponse.ok) {
            const data = await crResponse.json();
            const seen = new Set<string>();

            for (const entry of data) {
              const nameValue = entry?.name_value || "";
              if (typeof nameValue === "string") {
                const parts = nameValue.split(",").map(s => s.trim());
                for (const part of parts) {
                  const sub = part.toLowerCase();
                  if (sub.endsWith(`.${domain}`) && !seen.has(sub)) {
                    seen.add(sub);
                    subdomains.push(sub);
                  }
                }
              }
            }

            for (const pix of SUB_PIX) {
              const candidate = `${pix}.${domain}`;
              if (!seen.has(candidate)) {
                seen.add(candidate);
                subdomains.push(candidate);
              }
            }

            subdomains.sort();
          }
        } catch (err: any) {
          console.error("crt.sh error:", err.message);
        }

        result = {
          subdomains: subdomains.slice(0, 200),
          certificate_transparency: true,
          total: subdomains.length,
          summary: `Ditemukan ${subdomains.length} subdomain`,
          message: subdomains.length > 0
            ? `Berhasil mengambil ${subdomains.length} entri dari Certificate Transparency`
            : "Tidak ditemukan entri di Certificate Transparency",
        };
        break;
      }

      case "httpprobe": {
        const targets = [domain, `www.${domain}`];
        const endpoints: any[] = [];
        const seenUrls = new Set<string>();

        for (const t of targets) {
          const urls = [
            `http://${t}`,
            `https://${t}`,
            `http://${t}/`,
            `https://${t}/`,
          ];

          for (const url of urls) {
            if (seenUrls.has(url)) continue;
            seenUrls.add(url);

            try {
              const response = await fetchWithTimeout(url, {
                method: "GET",
                headers: {
                  "User-Agent": "CRI-Recon/1.0 (OSINT learning tool; meronga.web.id)",
                  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                },
                redirect: "follow",
              }, ttl * 1000);

              const status = response.status;
              const headers = Object.fromEntries(response.headers.entries());
              const server = headers["server"] || "";
              const contentType = headers["content-type"] || "";

              let title = "";
              try {
                const text = await response.text();
                const titleMatch = text.match(/<title[^>]*>([^<]*)<\/title>/i);
                title = titleMatch ? titleMatch[1].trim().substring(0, 80) : "";
              } catch {
                // body read error
              }

              endpoints.push({
                url: url,
                status: status,
                title: title,
                server: server,
                content_type: contentType,
              });

              if (url.startsWith("http://") && status < 500) {
                const httpsUrl = url.replace("http://", "https://");
                if (!seenUrls.has(httpsUrl)) {
                  seenUrls.add(httpsUrl);
                  try {
                    const httpsResponse = await fetchWithTimeout(httpsUrl, {
                      headers: {
                        "User-Agent": "CRI-Recon/1.0 (OSINT learning tool; meronga.web.id)",
                      },
                      redirect: "follow",
                    }, ttl * 1000);
                    const hs = httpsResponse.status;
                    const hHeaders = Object.fromEntries(httpsResponse.headers.entries());
                    let hTitle = "";
                    try {
                      const hText = await httpsResponse.text();
                      const hMatch = hText.match(/<title[^>]*>([^<]*)<\/title>/i);
                      hTitle = hMatch ? hMatch[1].trim().substring(0, 80) : "";
                    } catch {}
                    endpoints.push({
                      url: httpsUrl,
                      status: hs,
                      title: hTitle,
                      server: hHeaders["server"] || "",
                      content_type: hHeaders["content-type"] || "",
                    });
                  } catch {}
                }
              }
            } catch (err: any) {
              endpoints.push({
                url: url,
                status: 0,
                title: "",
                server: "",
                error: err.name === "AbortError" ? "timeout" : err.message,
              });
            }
          }
        }

        result = {
          endpoints: endpoints.slice(0, 50),
          total: endpoints.length,
          summary: `Ditemukan ${endpoints.filter((e: any) => e.status > 0).length} endpoint responsif`,
          message: endpoints.length > 0
            ? "HTTP probing selesai"
            : "Tidak ada endpoint yang merespons",
        };
        break;
      }

      case "dirsearch": {
        const targets = [`http://${domain}/`, `https://${domain}/`];
        const foundDirs: string[] = [];
        const checked = new Set<string>();

        for (const baseUrl of targets) {
          for (const path of DIR_WORDLIST) {
            if (foundDirs.length >= 100) break;
            const url = `${baseUrl}${path}`;
            if (checked.has(url)) continue;
            checked.add(url);

            try {
              const response = await fetchWithTimeout(url, {
                headers: {
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                },
                redirect: "follow",
              }, 5000);

              if (response.status === 200 || response.status === 301 || response.status === 302) {
                foundDirs.push(path);
              }
            } catch {
              // skip error
            }
          }
        }

        result = {
          directories: foundDirs,
          wordlist_size: DIR_WORDLIST.length,
          checked: checked.size,
          total: foundDirs.length,
          summary: `Ditemukan ${foundDirs.length} path dari ${DIR_WORDLIST.length} kandidat`,
          message: foundDirs.length > 0
            ? `Berhasil menemukan ${foundDirs.length} direktori`
            : "Tidak ditemukan path yang merespons",
        };
        break;
      }

      case "wafdetect": {
        const urls = [`http://${domain}`, `https://${domain}`];
        let wafInfo: any = {
          name: null,
          server: null,
          webserver: null,
          technologies: [],
          headers: {},
        };

        for (const url of urls) {
          try {
            const response = await fetchWithTimeout(url, {
              headers: {
                "User-Agent": "CRI-Recon/1.0 (OSINT learning tool; meronga.web.id)",
              },
              redirect: "follow",
            }, ttl * 1000);

            const headers = Object.fromEntries(response.headers.entries());
            wafInfo.headers = headers;

            // WAF signatures
            const wafSignals: { header: string; pattern: RegExp; name: string; provider: string }[] = [
              { header: "x-amz-cf-id", pattern: /.*/, name: "Cloudflare", provider: "Cloudflare" },
              { header: "cf-cache-status", pattern: /.*/, name: "Cloudflare", provider: "Cloudflare" },
              { header: "cf-ray", pattern: /.*/, name: "Cloudflare", provider: "Cloudflare" },
              { header: "x-sucuri-id", pattern: /.*/, name: "Sucuri", provider: "Sucuri" },
              { header: "x-sucuri-warning", pattern: /.*/, name: "Sucuri", provider: "Sucuri" },
              { header: "server", pattern: /cloudflare/i, name: "Cloudflare", provider: "Cloudflare" },
              { header: "server", pattern: /incapsula/i, name: "Incapsula", provider: "Imperva" },
              { header: "server", pattern: /sucuri/i, name: "Sucuri", provider: "Sucuri" },
              { header: "server", pattern: /barracuda/i, name: "Barracuda WAF", provider: "Barracuda" },
              { header: "server", pattern: /big-?ip/i, name: "F5 BIG-IP", provider: "F5" },
              { header: "server", pattern: /nginx/i, name: "Nginx", provider: "Nginx" },
              { header: "server", pattern: /apache/i, name: "Apache", provider: "Apache" },
              { header: "server", pattern: /microsoft-iis/i, name: "IIS", provider: "Microsoft" },
              { header: "server", pattern: /lighttpd/i, name: "Lighttpd", provider: "Lighttpd" },
              { header: "server", pattern: /gunicorn/i, name: "Gunicorn", provider: "Python" },
              { header: "server", pattern: /express/i, name: "Express", provider: "Node.js" },
              { header: "x-powered-by", pattern: /php/i, name: "PHP", provider: "PHP" },
              { header: "x-powered-by", pattern: /asp\.net/i, name: "ASP.NET", provider: "Microsoft" },
              { header: "x-powered-by", pattern: /express/i, name: "Express", provider: "Node.js" },
              { header: "x-powered-by", pattern: /gunicorn/i, name: "Gunicorn", provider: "Python" },
              { header: "x-powered-by", pattern: /uwsgi/i, name: "uWSGI", provider: "Python" },
              { header: "x-powered-by", pattern: /j2ee/i, name: "Java EE", provider: "Java" },
              { header: "x-powered-by", pattern: /spring/i, name: "Spring", provider: "Java" },
              { header: "x-powered-by", pattern: /laravel/i, name: "Laravel", provider: "PHP" },
              { header: "x-powered-by", pattern: /codeigniter/i, name: "CodeIgniter", provider: "PHP" },
              { header: "x-powered-by", pattern: /symfony/i, name: "Symfony", provider: "PHP" },
              { header: "x-powered-by", pattern: /next\.js/i, name: "Next.js", provider: "Node.js" },
              { header: "x-powered-by", pattern: /nuxt/i, name: "Nuxt", provider: "Node.js" },
              { header: "x-powered-by", pattern: /vue/i, name: "Vue.js", provider: "JavaScript" },
              { header: "x-powered-by", pattern: /angular/i, name: "Angular", provider: "JavaScript" },
              { header: "x-powered-by", pattern: /koa/i, name: "Koa", provider: "Node.js" },
              { header: "set-cookie", pattern: /^__cf/i, name: "Cloudflare", provider: "Cloudflare" },
              { header: "set-cookie", pattern: /^cf_clearance/i, name: "Cloudflare", provider: "Cloudflare" },
            ];

            for (const sig of wafSignals) {
              const headerVal = headers[sig.header.toLowerCase()] || "";
              if (sig.pattern.test(headerVal)) {
                if (!wafInfo.name) {
                  wafInfo.name = sig.name;
                  wafInfo.provider = sig.provider;
                }
              }
            }

            if (headers["server"]) {
              wafInfo.server = headers["server"];
              wafInfo.webserver = headers["server"];
            }

            if (headers["x-powered-by"]) {
              if (!wafInfo.technologies.includes(headers["x-powered-by"])) {
                wafInfo.technologies.push(headers["x-powered-by"]);
              }
            }

            if (headers["content-type"]?.includes("application/json")) {
              if (!wafInfo.technologies.includes("JSON API")) {
                wafInfo.technologies.push("JSON API");
              }
            }

            if (wafInfo.name) break;
          } catch {
            // skip
          }
        }

        // Fallback: check response body for WAF signatures
        if (!wafInfo.name) {
          try {
            const response = await fetchWithTimeout(`https://${domain}`, {
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              },
              redirect: "follow",
            }, ttl * 1000);

            const text = await response.text();
            const bodyLower = text.toLowerCase();

            if (bodyLower.includes("cloudflare")) {
              wafInfo.name = "Cloudflare";
              wafInfo.provider = "Cloudflare";
            } else if (bodyLower.includes("sucuri")) {
              wafInfo.name = "Sucuri";
              wafInfo.provider = "Sucuri";
            } else if (bodyLower.includes("incapsula")) {
              wafInfo.name = "Incapsula";
              wafInfo.provider = "Imperva";
            } else if (bodyLower.includes("access denied") || bodyLower.includes("captcha")) {
              wafInfo.name = "Possible WAF/Challenge";
              wafInfo.provider = "Unknown";
            }
          } catch {
            // skip
          }
        }

        result = {
          waf: wafInfo,
          summary: wafInfo.name
            ? `WAF terdeteksi: ${wafInfo.name} (${wafInfo.provider})`
            : "Tidak terdeteksi WAF khusus",
          message: wafInfo.name
            ? `WAF: ${wafInfo.name}, Server: ${wafInfo.server || "—"}`
            : "Belum dapat deteksi WAF",
        };
        break;
      }

      case "vulncheck": {
        const urls = [`http://${domain}`, `https://${domain}`];
        const findings: any[] = [];

        for (const url of urls) {
          try {
            const response = await fetchWithTimeout(url, {
              headers: {
                "User-Agent": "CRI-Recon/1.0 (OSINT learning tool; meronga.web.id)",
              },
              redirect: "follow",
            }, ttl * 1000);

            const headers = Object.fromEntries(response.headers.entries());

            for (const check of SECURITY_CHECKS) {
              if (check.check === "server-disclosure") {
                if (headers["server"] && headers["server"].length > 0) {
                  findings.push({
                    ...check,
                    detail: `Server header: ${headers["server"]}`,
                  });
                }
              } else if (check.check === "powered-by-disclosure") {
                if (headers["x-powered-by"] && headers["x-powered-by"].length > 0) {
                  findings.push({
                    ...check,
                    detail: `X-Powered-By: ${headers["x-powered-by"]}`,
                  });
                }
              } else if (check.check === "cors-misconfig") {
                if (headers["access-control-allow-origin"]) {
                  findings.push({
                    ...check,
                    detail: `Access-Control-Allow-Origin: ${headers["access-control-allow-origin"]}`,
                  });
                }
              } else if (check.check === "cache-control") {
                if (!headers["cache-control"]) {
                  findings.push({
                    ...check,
                    detail: "Tidak ada Cache-Control header",
                  });
                }
              } else {
                const headerMap: Record<string, string> = {
                  "x-frame-options": "x-frame-options",
                  "content-security-policy": "content-security-policy",
                  "x-xss-protection": "x-xss-protection",
                  "x-content-type-options": "x-content-type-options",
                  "strict-transport-security": "strict-transport-security",
                };
                const actualHeader = headerMap[check.check];
                if (actualHeader && !headers[actualHeader]) {
                  findings.push({ ...check });
                }
              }
            }

            break;
          } catch {
            // skip
          }
        }

        result = {
          findings: findings,
          total: findings.length,
          summary: `${findings.filter((f: any) => f.level === "high" || f.level === "medium").length} finding membutuhkan perhatian`,
          message: findings.length > 0
            ? `${findings.length} temuan keamanan ditemukan`
            : "Tidak ditemukan temuan kritis",
        };
        break;
      }

      default:
        return NextResponse.json(
          { error: `Stage '${stage}' tidak dikenal` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "POST ke /api/recon dengan body { target, stage, threads }" },
    { status: 200 }
  );
}
