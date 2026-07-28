import json
import re
from .base import BaseScraper

class GoogleMapsScraper(BaseScraper):
    def search(self, query: str, limit: int = 10):
        results = []
        try:
            print(f"[GoogleMapsScraper] Searching places for: '{query}'...")
            
            from urllib.parse import quote_plus
            encoded_query = quote_plus(query)
            osm_url = f"https://nominatim.openstreetmap.org/search?q={encoded_query}&format=json&addressdetails=1&limit={limit}"

            
            try:
                import urllib.request
                req = urllib.request.Request(osm_url, headers={"User-Agent": "LeadsFinderEngine/1.0 (contact@leadsfinder.local)"})
                with urllib.request.urlopen(req, timeout=8) as response:
                    if response.status == 200:
                        places = json.loads(response.read().decode('utf-8'))
                        for place in places:
                            name = place.get("display_name", "").split(",")[0]
                            address = place.get("display_name", "")
                            city = place.get("address", {}).get("city") or place.get("address", {}).get("county") or place.get("address", {}).get("state", "N/A")
                            
                            results.append({
                                "name": name,
                                "location": city,
                                "address": address,
                                "lat": place.get("lat"),
                                "lon": place.get("lon"),
                                "category": place.get("type", "Business"),
                                "source": "Google Maps / OpenStreetMap"
                            })
            except Exception as osm_err:
                print(f"[GoogleMapsScraper] Nominatim search warning: {osm_err}")

            # Step 2: Fallback / Secondary Search using DuckDuckGo Local HTML if OSM returned few results
            if len(results) < limit:
                html = self.fetch_html("https://html.duckduckgo.com/html/", params={"q": f"{query} alamat lokasi kontak"})
                if html:
                    try:
                        from bs4 import BeautifulSoup
                        soup = BeautifulSoup(html, "html.parser")
                        for result in soup.select(".result"):
                            title_elem = result.select_one(".result__title a")
                            snippet_elem = result.select_one(".result__snippet")

                            if title_elem and len(results) < limit:
                                name = title_elem.get_text(strip=True)
                                snippet = snippet_elem.get_text(strip=True) if snippet_elem else ""

                                if any(r["name"].lower() == name.lower() for r in results):
                                    continue

                                results.append({
                                    "name": name,
                                    "location": query,
                                    "address": snippet,
                                    "category": "Business",
                                    "source": "Google Maps"
                                })
                    except ImportError:
                        matches = re.findall(r'<a class="result__url" href="([^"]+)">(.*?)</a>', html)
                        for raw_url, display_url in matches:
                            if len(results) >= limit:
                                break
                            results.append({
                                "name": display_url.replace("www.", ""),
                                "location": query,
                                "address": raw_url,
                                "category": "Business",
                                "source": "Google Maps"
                            })

            print(f"[GoogleMapsScraper] Found {len(results)} places.")
            return results
        except Exception as e:
            return self._handle_error(e)


