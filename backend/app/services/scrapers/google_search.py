import re
from urllib.parse import urlparse, unquote
from .base import BaseScraper

EXCLUDED_DOMAINS = {
    "google.com", "google.co.id", "duckduckgo.com", "youtube.com",
    "wikipedia.org", "facebook.com", "instagram.com", "twitter.com",
    "linkedin.com", "tokopedia.com", "shopee.co.id", "bukalapak.com", "maps.google.com"
}

class GoogleSearchScraper(BaseScraper):
    def search(self, query: str, limit: int = 10):
        results = []
        try:
            print(f"[GoogleSearchScraper] Searching for: '{query}'...")
            
            # Primary: Google Search HTML
            html = self.fetch_html("https://www.google.com/search", params={"q": query, "num": limit + 5})
            
            if html:
                try:
                    from bs4 import BeautifulSoup
                    soup = BeautifulSoup(html, "html.parser")
                    for a_tag in soup.select("a[href]"):
                        href = a_tag["href"]
                        raw_url = None
                        
                        if href.startswith("/url?q="):
                            raw_url = unquote(href.split("/url?q=")[1].split("&")[0])
                        elif href.startswith("http") and not "google.com" in href:
                            raw_url = href

                        if not raw_url:
                            continue

                        parsed_domain = urlparse(raw_url).netloc.lower()
                        clean_domain = parsed_domain.replace("www.", "")

                        if not clean_domain or any(ex in clean_domain for ex in EXCLUDED_DOMAINS):
                            continue

                        title = a_tag.get_text(strip=True)
                        if not title or len(title) < 3 or title.startswith("http"):
                            title = clean_domain.capitalize()

                        # Avoid duplicate domains
                        if any(r["domain"] == clean_domain for r in results):
                            continue

                        results.append({
                            "name": title,
                            "website": raw_url,
                            "domain": clean_domain,
                            "description": f"Business listing for {clean_domain}",
                            "source": "Google Search"
                        })

                        if len(results) >= limit:
                            break
                except ImportError:
                    # Regex fallback if bs4 is missing
                    matches = re.findall(r'/url\?q=(https?://[^&"]+)', html)
                    for raw_url in matches:
                        raw_url = unquote(raw_url)
                        parsed_domain = urlparse(raw_url).netloc.lower()
                        clean_domain = parsed_domain.replace("www.", "")

                        if not clean_domain or any(ex in clean_domain for ex in EXCLUDED_DOMAINS):
                            continue

                        if any(r["domain"] == clean_domain for r in results):
                            continue

                        results.append({
                            "name": clean_domain.capitalize(),
                            "website": raw_url,
                            "domain": clean_domain,
                            "description": f"Listing for {clean_domain}",
                            "source": "Google Search"
                        })

                        if len(results) >= limit:
                            break

            print(f"[GoogleSearchScraper] Found {len(results)} search results.")
            return results
        except Exception as e:
            return self._handle_error(e)



