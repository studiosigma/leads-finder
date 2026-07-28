import pytest
from app.services.pipeline.cleaner import DataCleaner

def test_data_cleaner():
    cleaner = DataCleaner()
    raw_data = [
        {"name": "PT ABC", "source": "Google Maps"},
        {"name": "PT ABC", "source": "Google Search"}
    ]
    cleaned = cleaner.clean(raw_data)
    assert len(cleaned) == 1
    assert "Google Maps" in cleaned[0]["sources"]
    assert "Google Search" in cleaned[0]["sources"]

