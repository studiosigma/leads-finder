import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, limit = 10 } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // 1. Try forwarding to Python FastAPI backend if BACKEND_URL is configured
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL;
    if (BACKEND_URL && !BACKEND_URL.includes('localhost')) {
      try {
        const backendRes = await fetch(`${BACKEND_URL}/api/v1/search/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, limit }),
        });
        if (backendRes.ok) {
          const data = await backendRes.json();
          return NextResponse.json(data);
        }
      } catch (e) {
        console.warn('[Next.js API Search Route] External backend unreachable, switching to serverless engine:', e);
      }
    }

    // 2. Next.js Native Serverless Scraper Engine (OpenStreetMap + Public Directory)
    const encoded = encodeURIComponent(query);
    const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&addressdetails=1&extratags=1&namedetails=1&limit=${limit}`;

    const osmRes = await fetch(osmUrl, {
      headers: {
        'User-Agent': 'LeadsFinderEngine/2.4 (https://leadsfinder.local; contact@leadsfinder.local)',
        'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
      },
      next: { revalidate: 3600 },
    });

    let results: any[] = [];

    if (osmRes.ok) {
      const places = await osmRes.json();
      if (Array.isArray(places) && places.length > 0) {
        results = places.map((place: any, i: number) => {
          const rawParts = (place.display_name || query).split(',').map((p: string) => p.trim());
          
          let primaryName = place.namedetails?.official_name || place.namedetails?.brand || place.namedetails?.name || rawParts[0] || query;

          const genericWords = ['pabrik', 'works', 'factory', 'building', 'industrial', 'toko', 'bengkel', 'sekolah', 'gudang', 'office', 'company', 'pt', 'cv'];
          if (genericWords.includes(primaryName.toLowerCase()) || primaryName.length <= 5) {
            const subLoc = rawParts[1] || place.address?.road || place.address?.suburb || '';
            const cityLoc = place.address?.city || place.address?.county || place.address?.state || '';
            if (subLoc) {
              primaryName = `${primaryName} - ${subLoc}${cityLoc && subLoc !== cityLoc ? `, ${cityLoc}` : ''}`;
            }
          }

          const city = place.address?.city || place.address?.county || place.address?.town || place.address?.city_district || place.address?.state || 'Indonesia';
          const state = place.address?.state || '';
          const locationStr = state ? `${city}, ${state}` : `${city}, Indonesia`;

          const rawCat = place.type || place.category || 'Business';
          const category = rawCat.charAt(0).toUpperCase() + rawCat.slice(1);

          const extra = place.extratags || {};
          const website = extra.website || extra['contact:website'] || extra.url || 'N/A';
          const email = extra.email || extra['contact:email'] || 'N/A';
          const phone = extra.phone || extra['contact:phone'] || extra['contact:mobile'] || extra['contact:whatsapp'] || 'N/A';
          const waUrl = phone !== 'N/A' ? `https://wa.me/${phone.replace(/[^0-9]/g, '')}` : undefined;

          return {
            id: `osm-${place.place_id || Date.now()}-${i}`,
            name: primaryName,
            category: category === 'Industrial' || category === 'Works' ? 'Manufaktur & Industry' : category,
            location: locationStr,
            address: place.display_name,
            website: website,
            email: email,
            email_status: email !== 'N/A' ? 'VALID' : 'UNVERIFIED',
            phone: phone,
            whatsapp_url: waUrl,
            linkedin_url: '-',
            gmaps_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(primaryName + ' ' + locationStr)}`,
            status: 'READY',
            sources: ['Google Maps / OpenStreetMap'],
          };
        });
      }
    }

    return NextResponse.json({
      status: 'completed',
      query,
      results,
      count: results.length,
    });
  } catch (err: any) {
    console.error('[Next.js API Search Route Error]:', err);
    return NextResponse.json({ error: 'Search execution failed', message: err?.message }, { status: 500 });
  }
}
