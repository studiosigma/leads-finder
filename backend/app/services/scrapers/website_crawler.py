import re
from urllib.parse import urljoin, urlparse
from .base import BaseScraper

EMAIL_REGEX = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
PHONE_REGEX = re.compile(r'(?:\+?62|0)[2-9][0-9\s-]{7,14}')
WHATSAPP_REGEX = re.compile(r'(?:https?://)?(?:wa\.me|api\.whatsapp\.com/send\?phone=)(\+?\d+)', re.IGNORECASE)
IGNORED_EMAIL_EXTENSIONS = ('.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.css', '.js', '.wixpress.com')

class WebsiteCrawler(BaseScraper):
    def crawl_website(self, website_url: str):
        data = {
            "email": None,
            "phone": None,
            "whatsapp_url": None,
            "linkedin_url": None,
            "instagram_url": None,
            "facebook_url": None,
            "social_links": []
        }

        if not website_url or not website_url.startswith(("http://", "https://")):
            if website_url:
                website_url = f"https://{website_url}"
            else:
                return data

        pages_to_visit = [website_url]
        visited_urls = set()

        # Step 1: Fetch homepage
        html = self.fetch_html(website_url, timeout=7)
        if not html:
            if website_url.startswith("https://"):
                fallback_url = website_url.replace("https://", "http://")
                html = self.fetch_html(fallback_url, timeout=7)
                if html:
                    website_url = fallback_url

        if not html:
            return data

        visited_urls.add(website_url)

        # Step 2: Find contact / about page links
        hrefs = re.findall(r'href=["\']([^"\']+)["\']', html, re.IGNORECASE)
        for href in hrefs:
            href_lower = href.lower()
            if any(k in href_lower for k in ["contact", "about", "kontak", "hubungi", "tentang"]):
                full_url = urljoin(website_url, href)
                if full_url not in visited_urls and urlparse(full_url).netloc == urlparse(website_url).netloc:
                    pages_to_visit.append(full_url)
                    visited_urls.add(full_url)
                    if len(pages_to_visit) >= 3:
                        break

        # Step 3: Scan content across target pages
        found_emails = set()
        found_phones = set()
        social_links = set()

        for page_url in pages_to_visit:
            page_html = html if page_url == website_url else self.fetch_html(page_url, timeout=7)
            if not page_html:
                continue

            text_content = re.sub(r'<[^>]+>', ' ', page_html)

            # Extract Emails
            for email in EMAIL_REGEX.findall(text_content):
                email_clean = email.lower().strip()
                if not any(email_clean.endswith(ext) for ext in IGNORED_EMAIL_EXTENSIONS):
                    found_emails.add(email_clean)

            # Extract mailto: links
            for mailto in re.findall(r'mailto:([^\s"\'\?]+)', page_html, re.IGNORECASE):
                mail_str = mailto.strip().lower()
                if mail_str and not any(mail_str.endswith(ext) for ext in IGNORED_EMAIL_EXTENSIONS):
                    found_emails.add(mail_str)

            # Extract Phone Numbers
            for phone in PHONE_REGEX.findall(text_content):
                clean_phone = re.sub(r'[\s-]', '', phone)
                if len(clean_phone) >= 9 and len(clean_phone) <= 15:
                    found_phones.add(clean_phone)

            # Extract Direct WhatsApp Links
            for wa_match in WHATSAPP_REGEX.findall(page_html):
                clean_wa_num = re.sub(r'[^\d]', '', wa_match)
                if clean_wa_num.startswith('0'):
                    clean_wa_num = '62' + clean_wa_num[1:]
                if len(clean_wa_num) >= 10:
                    data["whatsapp_url"] = f"https://wa.me/{clean_wa_num}"

            # Extract Social Media Links
            for href in re.findall(r'href=["\']([^"\']+)["\']', page_html, re.IGNORECASE):
                href_lower = href.lower()
                if "linkedin.com" in href_lower and not data["linkedin_url"]:
                    data["linkedin_url"] = href
                elif "instagram.com" in href_lower and not data["instagram_url"]:
                    data["instagram_url"] = href
                elif "facebook.com" in href_lower and not data["facebook_url"]:
                    data["facebook_url"] = href
                elif "wa.me/" in href_lower or "whatsapp.com" in href_lower:
                    social_links.add(href)

        data["email"] = next(iter(found_emails), None)
        data["phone"] = next(iter(found_phones), None)
        data["social_links"] = list(social_links)

        return data

    def search(self, query: str, limit: int = 10):
        return []


