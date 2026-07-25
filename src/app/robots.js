export default function robots() {
  const baseUrl = 'https://spplabs.es';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/politica-de-privacidad',
          '/politica-de-cookies',
          '/terminos-y-condiciones',
        ],
        disallow: [
          '/dashboard',
          '/dashboard/',
          '/login',
          '/signup',
          '/bookings',
          '/contacts',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
