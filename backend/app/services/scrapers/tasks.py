from app.services.queue.celery_app import celery_app
from .google_maps import GoogleMapsScraper
from .google_search import GoogleSearchScraper
from .website_crawler import WebsiteCrawler
from app.services.pipeline.cleaner import DataCleaner
from app.core.db import save_lead
from app.core.cache import get_cached_search, set_cached_search


@celery_app.task(name="app.services.scrapers.tasks.run_search")
def run_search(query: str, limit: int = 10):
    print(f"[Tasks] Starting Google Maps First pipeline for: '{query}' (limit={limit})")

    # 0. Check Redis / Memory Cache First (Fast Instant Response)
    cached_results = get_cached_search(query, limit)
    if cached_results:
        print(f"[Tasks] Returning {len(cached_results)} instant cached leads for query '{query}'.")
        return {"status": "completed", "results": cached_results, "cached": True}

    maps_scraper = GoogleMapsScraper()
    search_scraper = GoogleSearchScraper()
    crawler = WebsiteCrawler()

    # 1. Primary Priority Source: Extract core business profiles from Google Maps first
    print("[Tasks] Phase 1: Extracting business profiles & ratings from Google Maps...")
    maps_data = maps_scraper.search(query, limit=limit)

    for item in maps_data:
        item["sources"] = ["Google Maps"]

    # 2. Secondary Priority: Fallback to Google Search if maps results < limit
    search_data = []
    if len(maps_data) < limit:
        remaining = limit - len(maps_data)
        print(f"[Tasks] Phase 1b: Fetching {remaining} additional results from Google Search...")
        search_data = search_scraper.search(query, limit=remaining)
        for item in search_data:
            item["sources"] = ["Google Search"]

    raw_results = maps_data + search_data

    # 3. Phase 2 Deep Crawl: Crawl official company websites found on Google Maps
    print("[Tasks] Phase 2: Deep crawling company websites for emails & secondary phone contacts...")
    for item in raw_results:
        website_url = item.get("website")
        if website_url and website_url != "N/A" and website_url != "-":
            crawl_data = crawler.crawl_website(website_url)
            if crawl_data.get("email"):
                item["email"] = crawl_data["email"]
                if "Website" not in item.get("sources", []):
                    item["sources"].append("Website")
            if crawl_data.get("phone") and item.get("phone") and crawl_data["phone"] not in item["phone"]:
                item["phone"] = f"{item['phone']}\n{crawl_data['phone']} (Website)"
                if "Website" not in item.get("sources", []):
                    item["sources"].append("Website")

    # 4. Clean & Deduplicate results
    cleaner = DataCleaner()
    final_results = cleaner.clean(raw_results)

    # 5. Save to database & Cache results in Redis
    print(f"[Tasks] Phase 3: Saving {len(final_results)} cleaned leads to database & Caching...")
    for lead in final_results:
        save_lead(lead)

    set_cached_search(query, limit, final_results, ttl_seconds=86400)

    # 6. Emit real-time webhook event to configured n8n / Zapier URL
    try:
        from app.api.webhook_routes import emit_webhook_event
        emit_webhook_event("scraping.completed", {
            "query": query,
            "count": len(final_results),
            "leads": final_results
        })
    except Exception as e:
        print("[Tasks Webhook Warning]:", e)

    return {"status": "completed", "results": final_results, "cached": False}
