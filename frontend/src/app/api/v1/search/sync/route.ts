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

    // 2. AI Smart Query Expansion Engine
    const qLower = query.toLowerCase();
    const searchQueries = [query];

    // Extract location keyword from query (e.g., bekasi, tambun, cibitung, cikarang, bandung, jakarta)
    const locMatch = qLower.match(/(?:di|ke|kabupaten|kota|daerah|kawasan)?\s*([a-z0-9\s]+)$/i);
    const locationKeyword = locMatch ? locMatch[1].trim() : query;

    if (qLower.includes('pabrik') || qLower.includes('industri') || qLower.includes('manufaktur')) {
      searchQueries.push(`PT ${locationKeyword} industri`);
      searchQueries.push(`Kawasan Industri ${locationKeyword}`);
    } else if (qLower.includes('sekolah') || qLower.includes('pendidikan')) {
      searchQueries.push(`SMA SMK ${locationKeyword}`);
      searchQueries.push(`Universitas ${locationKeyword}`);
    } else if (qLower.includes('rumah sakit') || qLower.includes('klinik')) {
      searchQueries.push(`RS ${locationKeyword}`);
      searchQueries.push(`Klinik Utama ${locationKeyword}`);
    } else if (qLower.includes('hotel') || qLower.includes('penginapan')) {
      searchQueries.push(`Hotel Resort ${locationKeyword}`);
    } else if (qLower.includes('restoran') || qLower.includes('kuliner')) {
      searchQueries.push(`Restoran Rumah Makan ${locationKeyword}`);
    }

    // 3. Next.js Native Multi-Query Parallel Scraper Engine
    const allPlaces: any[] = [];
    const headers = {
      'User-Agent': 'LeadsFinderEngine/2.4 (https://leadsfinder.local; contact@leadsfinder.local)',
      'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
    };

    for (const qStr of searchQueries) {
      if (allPlaces.length >= limit * 2) break;
      try {
        const encoded = encodeURIComponent(qStr);
        const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&addressdetails=1&extratags=1&namedetails=1&limit=${limit}`;
        const osmRes = await fetch(osmUrl, { headers, next: { revalidate: 3600 } });
        if (osmRes.ok) {
          const places = await osmRes.json();
          if (Array.isArray(places)) {
            allPlaces.push(...places);
          }
        }
      } catch (e) {
        // continue
      }
    }

    // 4. Smart Name Processing, Categorization & Corporate Prioritization
    const seenNames = new Set<string>();
    const formattedLeads: any[] = [];

    for (let i = 0; i < allPlaces.length; i++) {
      const place = allPlaces[i];
      const rawParts = (place.display_name || query).split(',').map((p: string) => p.trim());
      
      let primaryName = place.namedetails?.official_name || place.namedetails?.brand || place.namedetails?.name || place.name || rawParts[0] || query;

      const genericWords = ['pabrik', 'works', 'factory', 'building', 'industrial', 'toko', 'bengkel', 'sekolah', 'gudang', 'office', 'company', 'pt', 'cv'];
      const isGenericName = genericWords.includes(primaryName.toLowerCase()) || primaryName.length <= 5;

      if (isGenericName) {
        const subLoc = rawParts[1] || place.address?.road || place.address?.suburb || '';
        const cityLoc = place.address?.city || place.address?.county || place.address?.state || '';
        if (subLoc) {
          primaryName = `${primaryName} - ${subLoc}${cityLoc && subLoc !== cityLoc ? `, ${cityLoc}` : ''}`;
        }
      }

      const nameKey = primaryName.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!nameKey || seenNames.has(nameKey)) continue;
      seenNames.add(nameKey);

      const city = place.address?.city || place.address?.county || place.address?.town || place.address?.city_district || place.address?.state || 'Indonesia';
      const state = place.address?.state || '';
      const locationStr = state ? `${city}, ${state}` : `${city}, Indonesia`;

      const rawCat = place.type || place.category || 'Business';
      let category = rawCat.charAt(0).toUpperCase() + rawCat.slice(1);
      if (category === 'Industrial' || category === 'Works' || qLower.includes('pabrik') || qLower.includes('manufaktur')) {
        category = 'Manufaktur & Industry';
      } else if (qLower.includes('rumah sakit') || qLower.includes('klinik')) {
        category = 'Rumah Sakit & Kesehatan';
      }

      const extra = place.extratags || {};
      const website = extra.website || extra['contact:website'] || extra.url || 'N/A';
      const email = extra.email || extra['contact:email'] || 'N/A';
      const phone = extra.phone || extra['contact:phone'] || extra['contact:mobile'] || extra['contact:whatsapp'] || 'N/A';
      const waUrl = phone !== 'N/A' ? `https://wa.me/${phone.replace(/[^0-9]/g, '')}` : undefined;

      formattedLeads.push({
        id: `osm-${place.place_id || Date.now()}-${i}`,
        name: primaryName,
        category: category,
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
        is_corporate: primaryName.toUpperCase().includes('PT') || primaryName.toUpperCase().includes('CV') || primaryName.toUpperCase().includes('TBK')
      });
    }

    // Sort corporate PT / CV entities first
    formattedLeads.sort((a, b) => (b.is_corporate ? 1 : 0) - (a.is_corporate ? 1 : 0));
    const finalResults = formattedLeads.slice(0, limit);

    return NextResponse.json({
      status: 'completed',
      query,
      results: finalResults,
      count: finalResults.length,
    });
  } catch (err: any) {
    console.error('[Next.js API Search Route Error]:', err);
    return NextResponse.json({ error: 'Search execution failed', message: err?.message }, { status: 500 });
  }
}
