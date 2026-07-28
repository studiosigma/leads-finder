import pytest
from app.services.scrapers.google_maps import GoogleMapsScraper
from app.services.scrapers.google_search import GoogleSearchScraper
from app.services.scrapers.website_crawler import WebsiteCrawler

def test_google_maps_scraper():
    scraper = GoogleMapsScraper()
    results = scraper.search("Manufacturing Bekasi", limit=2)
    assert isinstance(results, list)
    if len(results) > 0:
        assert "name" in results[0]

def test_google_search_scraper():
    scraper = GoogleSearchScraper()
    results = scraper.search("pabrik plastik bekasi", limit=2)
    assert isinstance(results, list)
    if len(results) > 0:
        assert "website" in results[0]
        assert "name" in results[0]

def test_website_crawler():
    crawler = WebsiteCrawler()
    # Test crawler output format
    data = crawler.crawl_website("https://example.com")
    assert isinstance(data, dict)
    assert "email" in data
    assert "phone" in data

