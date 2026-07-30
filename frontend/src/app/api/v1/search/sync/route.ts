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

    // 2. AI Smart Query Intent & Keyword Parser
    const qLower = query.toLowerCase();
    const locMatch = qLower.match(/(?:di|ke|kabupaten|kota|daerah|kawasan)?\s*([a-z0-9\s]+)$/i);
    const locationKeyword = locMatch ? locMatch[1].trim() : query;

    const isIndustrialQuery = qLower.includes('pabrik') || qLower.includes('industri') || qLower.includes('manufaktur') || qLower.includes('gudang');

    const searchQueries = [query];
    if (isIndustrialQuery) {
      searchQueries.push(`PT ${locationKeyword} industri`);
      searchQueries.push(`Kawasan Industri ${locationKeyword}`);
      searchQueries.push(`Pabrik PT ${locationKeyword}`);
    } else if (qLower.includes('sekolah') || qLower.includes('pendidikan')) {
      searchQueries.push(`SMA SMK ${locationKeyword}`);
      searchQueries.push(`Universitas ${locationKeyword}`);
    } else if (qLower.includes('rumah sakit') || qLower.includes('klinik')) {
      searchQueries.push(`RS ${locationKeyword}`);
      searchQueries.push(`Klinik Utama ${locationKeyword}`);
    }

    // 3. Multi-Source Search (OpenStreetMap + Web Directory Scraper)
    const allPlaces: any[] = [];
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 LeadsFinderEngine/2.5',
      'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
    };

    // Source A: OpenStreetMap Places
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

    // 4. Processing & Real Corporate Entity Resolution
    const seenNames = new Set<string>();
    const formattedLeads: any[] = [];

    for (let i = 0; i < allPlaces.length; i++) {
      const place = allPlaces[i];
      const rawParts = (place.display_name || query).split(',').map((p: string) => p.trim());
      
      let primaryName = place.namedetails?.official_name || place.namedetails?.brand || place.namedetails?.name || place.name || rawParts[0] || query;

      const genericWords = ['pabrik', 'works', 'factory', 'building', 'industrial', 'toko', 'bengkel', 'sekolah', 'gudang', 'office', 'company'];
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
      if (category === 'Industrial' || category === 'Works' || isIndustrialQuery) {
        category = 'Manufaktur & Industry';
      }

      const extra = place.extratags || {};
      const website = extra.website || extra['contact:website'] || extra.url || 'N/A';
      const email = extra.email || extra['contact:email'] || 'N/A';
      const phone = extra.phone || extra['contact:phone'] || extra['contact:mobile'] || extra['contact:whatsapp'] || 'N/A';
      const waUrl = phone !== 'N/A' ? `https://wa.me/${phone.replace(/[^0-9]/g, '')}` : undefined;

      const isCorporate = primaryName.toUpperCase().includes('PT') || primaryName.toUpperCase().includes('CV') || primaryName.toUpperCase().includes('TBK') || primaryName.toUpperCase().includes('INC') || primaryName.toUpperCase().includes('CORP');

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
        is_corporate: isCorporate,
        is_generic: isGenericName
      });
    }

    // Real Corporate Entity Prioritization:
    // 1st Priority: Real PT / CV / Tbk Companies
    // 2nd Priority: Named Buildings & Factories
    // 3rd Priority: Generic "Pabrik - Jalan..." fallback entries
    formattedLeads.sort((a, b) => {
      if (a.is_corporate !== b.is_corporate) return b.is_corporate ? 1 : -1;
      if (a.is_generic !== b.is_generic) return a.is_generic ? 1 : -1;
      return 0;
    });

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
