from app.services.queue.celery_app import celery_app
from .google_maps import GoogleMapsScraper
from .google_search import GoogleSearchScraper
from .website_crawler import WebsiteCrawler
from app.services.pipeline.cleaner import DataCleaner
from app.core.db import save_lead


@celery_app.task(name="app.services.scrapers.tasks.run_search")
def run_search(query: str, limit: int = 10):
    print(f"[Tasks] Starting search pipeline for: '{query}' (limit={limit})")

    maps_scraper = GoogleMapsScraper()
    search_scraper = GoogleSearchScraper()
    crawler = WebsiteCrawler()

    # 1. Run Search & Maps Scrapers
    maps_data = maps_scraper.search(query, limit=limit)
    search_data = search_scraper.search(query, limit=limit)

    raw_results = maps_data + search_data

    # 2. Enrich results with WebsiteCrawler if website URL exists
    print("[Tasks] Crawling target websites for emails and phones...")
    for item in raw_results:
        website_url = item.get("website")
        if website_url and website_url != "N/A":
            crawl_data = crawler.crawl_website(website_url)
            if crawl_data.get("email"):
                item["email"] = crawl_data["email"]
            if crawl_data.get("phone"):
                item["phone"] = crawl_data["phone"]

    # 3. Clean & Deduplicate results
    cleaner = DataCleaner()
    final_results = cleaner.clean(raw_results)

    # 4. Save to database / memory
    print(f"[Tasks] Saving {len(final_results)} cleaned leads...")
    for lead in final_results:
        save_lead(lead)

    return {"status": "completed", "results": final_results}

