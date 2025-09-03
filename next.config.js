/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    // Apply a set of security headers to all routes. These headers mirror
    // the recommendations provided in the deployment instructions. Feel free
    // to update or extend them to meet your own security requirements.
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), camera=(), microphone=()'
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Content-Security-Policy',
            // The CSP here is intentionally strict. It allows only same-origin
            // resources and inline styles. If you add external resources,
            // update this accordingly.
            value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'"
          },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
