import { NextResponse } from 'next/server';

// Protect all routes in the app with simple Basic authentication.
// When deploying to Vercel, define BASIC_USER and BASIC_PASS environment
// variables via the Vercel dashboard. Reps will be prompted for these
// credentials once per session. Without them, the server responds with
// HTTP 401 and an appropriate WWW‑Authenticate header.

export const config = {
  // Exclude Next.js internals and static assets from authentication.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
};

export default function middleware(req) {
  const auth = req.headers.get('authorization') || '';
  const [scheme = '', encoded = ''] = auth.split(' ');
  let user = '';
  let pass = '';
  if (scheme === 'Basic') {
    try {
      const decoded = atob(encoded);
      [user = '', pass = ''] = decoded.split(':');
    } catch (err) {
      // noop
    }
  }
  const expectedUser = process.env.BASIC_USER || 'rep';
  const expectedPass = process.env.BASIC_PASS || 'password';
  if (scheme === 'Basic' && user === expectedUser && pass === expectedPass) {
    return NextResponse.next();
  }
  return new NextResponse('Auth required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Restricted"' }
  });
}
