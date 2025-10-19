import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider;
  const searchParams = request.nextUrl.searchParams;
  const callbackUrl = searchParams.get('callbackUrl') || 'http://localhost:3001/dashboard';
  
  // Construir la URL de signin de NextAuth
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const signinUrl = `${baseUrl}/api/auth/signin/${provider}`;
  const csrfUrl = `${baseUrl}/api/auth/csrf`;
  
  // HTML mínimo que hace submit automático sin UI visible
  const html = `
    <!DOCTYPE html>
    <html>
      <head><title>Signing in...</title></head>
      <body>
        <form id="signin-form" method="POST" action="${signinUrl}">
          <input type="hidden" name="callbackUrl" value="${callbackUrl}" />
          <input type="hidden" name="csrfToken" id="csrf-token" value="" />
        </form>
        <script>
          fetch('${csrfUrl}')
            .then(res => res.json())
            .then(data => {
              document.getElementById('csrf-token').value = data.csrfToken;
              document.getElementById('signin-form').submit();
            })
            .catch(() => document.getElementById('signin-form').submit());
        </script>
      </body>
    </html>
  `;
  
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
