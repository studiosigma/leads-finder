import re
from typing import List, Dict

class TechDetector:
    """
    Website Technology & Marketing Signature Detector
    Scans HTML source code for CMS platforms, JS frameworks, and marketing tracking pixels.
    """

    SIGNATURES: Dict[str, List[str]] = {
        "Shopify": [r"cdn\.shopify\.com", r"Shopify\.theme"],
        "WooCommerce": [r"woocommerce-layout-css", r"wp-content/plugins/woocommerce"],
        "WordPress": [r"wp-content", r"wp-includes"],
        "Magento": [r"mage/cookies", r"Mage\.Cookies"],
        "Wix": [r"static\.wixstatic\.com", r"wix\.com"],
        "Squarespace": [r"squarespace\.com", r"Squarespace\.onInitialize"],
        "Next.js": [r"__NEXT_DATA__", r"_next/static"],
        "React": [r"react\.production\.min\.js", r"data-reactroot"],
        "Vue": [r"vue\.min\.js", r"data-v-"],
        "Meta Pixel": [r"connect\.facebook\.net/.*/fbevents\.js", r"fbq\s*\(\s*['\"]init['\"]"],
        "Google Analytics": [r"google-analytics\.com/analytics\.js", r"googletagmanager\.com/gtag/js"],
        "Google Tag Manager": [r"googletagmanager\.com/gtm\.js"],
        "TikTok Pixel": [r"analytics\.tiktok\.com/i18n/pixel"],
        "Hotjar": [r"static\.hotjar\.com"]
    }

    def detect(self, html: str) -> List[str]:
        if not html or not isinstance(html, str):
            return []

        detected = set()

        for tech_name, patterns in self.SIGNATURES.items():
            for pattern in patterns:
                if re.search(pattern, html, re.IGNORECASE):
                    detected.add(tech_name)
                    break

        return sorted(list(detected))
