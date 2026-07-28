from abc import ABC, abstractmethod
import os
import random
import time
from urllib.parse import urlparse

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.2; rv:122.0) Gecko/20100101 Firefox/122.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0"
]

DOMAIN_LAST_REQUEST = {}

class BaseScraper(ABC):
    def __init__(self):
        self.proxy_url = os.getenv("PROXY_URL")

    def get_headers(self):
        return {
            "User-Agent": random.choice(USER_AGENTS),
            "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Sec-Ch-Ua": '"Not A(Brand";v="99", "Google Chrome";v="122"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"Linux"',
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "cross-site",
            "Upgrade-Insecure-Requests": "1"
        }

    @property
    def proxies(self):
        if self.proxy_url and self.proxy_url != "http://your_proxy_url_here":
            return {"http": self.proxy_url, "https": self.proxy_url}
        return None

    def rate_limit_delay(self, url: str, min_delay: float = 0.3, max_delay: float = 0.8):
        """Polite domain rate limit delay to avoid 429 Too Many Requests"""
        try:
            domain = urlparse(url).netloc
            if domain in DOMAIN_LAST_REQUEST:
                elapsed = time.time() - DOMAIN_LAST_REQUEST[domain]
                desired_delay = random.uniform(min_delay, max_delay)
                if elapsed < desired_delay:
                    time.sleep(desired_delay - elapsed)
            DOMAIN_LAST_REQUEST[domain] = time.time()
        except Exception:
            pass

    def fetch_html(self, url: str, params: dict = None, timeout: int = 10):
        if params:
            from urllib.parse import urlencode
            url = f"{url}?{urlencode(params)}"

        self.rate_limit_delay(url)

        # 1. Try requests library with retries
        try:
            import requests
            import urllib3
            urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
            
            for attempt in range(2):
                response = requests.get(
                    url,
                    headers=self.get_headers(),
                    proxies=self.proxies,
                    timeout=timeout,
                    verify=False
                )
                if response.status_code == 200:
                    return response.text
                elif response.status_code in [429, 503]:
                    time.sleep(1.5 * (attempt + 1))
        except Exception:
            pass

        # 2. Try httpx library (supports HTTP/2)
        try:
            import httpx
            with httpx.Client(verify=False, timeout=timeout, follow_redirects=True) as client:
                resp = client.get(url, headers=self.get_headers())
                if resp.status_code == 200:
                    return resp.text
        except Exception:
            pass

        # 3. Fallback to urllib.request
        try:
            import urllib.request
            import ssl
            req = urllib.request.Request(
                url,
                headers=self.get_headers()
            )
            ctx = ssl._create_unverified_context()
            with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
                return resp.read().decode('utf-8', errors='ignore')
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None

    @abstractmethod
    def search(self, query: str, limit: int):
        pass

    def _handle_error(self, e):
        print(f"Scraping error: {e}")
        return []


