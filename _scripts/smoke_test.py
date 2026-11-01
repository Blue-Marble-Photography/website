# /// script
# requires-python = ">=3.12"
# dependencies = ["playwright==1.64.0"]
# ///
"""Smoke test for bluemarble.photography.

Checks pages, header images, the gallery lightbox, downloads, and right-click protection in real
browsers, plus the CloudFront edge behavior (AI crawler blocking, opt-out headers, robots.txt).

Usage:
    uv run _scripts/smoke_test.py                                  # local `jekyll serve`
    uv run _scripts/smoke_test.py --base https://bluemarble.photography
    uv run _scripts/smoke_test.py --browsers chromium              # faster; default is all three

First run only: uv run --with playwright==1.64.0 playwright install chromium firefox webkit
"""

import argparse
import json
import re
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass, field

from playwright.sync_api import Browser, Error, Page, sync_playwright

IMAGES_HOST = 'https://images.bluemarble.photography'
SAMPLE_IMAGE = '/JosephGruber_20261025_181746-750.jpg'
SAMPLE_ORIGINAL = '/originals/JosephGruber_20261025_181746.jpg'
PAGES = ['/', '/about/', '/blog/', '/gallery/geb/', '/gallery/colorado/', '/post/exploring-utah/']
COVER_PAGES = {'/': '#cover', '/post/exploring-utah/': '.featured-image'}
LIGHTBOX_PAGES = {
    '/gallery/geb/': True,
    '/gallery/geb/casey/': True,
    '/gallery/colorado/': False,
    '/post/2017-total-solar-eclipse/': False,
}
USER_AGENTS = {
    'Safari': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) '
    'Version/18.0 Safari/605.1.15',
    'Googlebot': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'facebookexternalhit': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'GPTBot': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)',
    'ClaudeBot': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0)',
}
# Third-party noise that isn't a site error (local cross-origin manifest, image CDN hiccups).
IGNORED_CONSOLE = re.compile(r'Access-Control-Allow-Origin|manifest\.json|net::|ERR_|license key', re.IGNORECASE)


@dataclass
class Results:
    """Collected check outcomes."""

    failures: list[str] = field(default_factory=list)
    passed: int = 0

    def check(self, name: str, ok: bool, detail: object = '') -> None:
        """Record one check and print its outcome.

        Args:
            name: What was checked.
            ok: Whether the check passed.
            detail: Extra context printed on failure.
        """
        if ok:
            self.passed += 1
            print(f'  PASS {name}')
        else:
            self.failures.append(f'{name}: {detail}')
            print(f'  FAIL {name}: {detail}')


@dataclass
class Response:
    """Status and headers of an HTTP response."""

    status: int
    headers: dict[str, str]
    body: str


def fetch(url: str, user_agent: str = USER_AGENTS['Safari']) -> Response:
    """Fetch a URL without following redirects.

    Args:
        url: Absolute URL.
        user_agent: User-Agent header to send.

    Returns:
        The response status, lower-cased headers, and body text (first 64 KB).
    """

    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *args: object, **kwargs: object) -> None:
            return None

    opener = urllib.request.build_opener(NoRedirect)
    request = urllib.request.Request(url, headers={'User-Agent': user_agent})
    try:
        with opener.open(request, timeout=30) as resp:
            body = resp.read(65536).decode('utf-8', errors='replace')
            return Response(resp.status, {k.lower(): v for k, v in resp.headers.items()}, body)
    except urllib.error.HTTPError as err:
        return Response(err.code, {k.lower(): v for k, v in err.headers.items()}, '')


def check_edge(base: str, results: Results) -> None:
    """Check CloudFront behavior: crawler blocking, opt-out headers, downloads, robots.txt.

    Site-host checks only run against production; the images host is always production.

    Args:
        base: Site base URL.
        results: Collector for outcomes.
    """
    print('edge')
    targets = [IMAGES_HOST + SAMPLE_IMAGE, IMAGES_HOST + SAMPLE_ORIGINAL]
    if base.startswith('https://'):
        targets.insert(0, base + '/gallery/colorado/')

    for url in targets:
        short = url.split('://', 1)[1]
        for bot in ('GPTBot', 'ClaudeBot'):
            results.check(f'{bot} blocked: {short}', fetch(url, USER_AGENTS[bot]).status == 403)
        for agent in ('Safari', 'Googlebot', 'facebookexternalhit'):
            results.check(f'{agent} allowed: {short}', fetch(url, USER_AGENTS[agent]).status == 200)
        headers = fetch(url).headers
        results.check(
            f'opt-out headers: {short}',
            headers.get('x-robots-tag') == 'noai, noimageai' and headers.get('tdm-reservation') == '1',
            headers.get('x-robots-tag'),
        )
        results.check(f'HSTS: {short}', 'max-age=31536000' in headers.get('strict-transport-security', ''))

    disposition = fetch(IMAGES_HOST + SAMPLE_ORIGINAL).headers.get('content-disposition', '')
    results.check('original served as attachment', disposition.startswith('attachment'), disposition)

    hosts = [IMAGES_HOST] + ([base] if base.startswith('https://') else [])
    for host in hosts:
        robots = fetch(host + '/robots.txt', USER_AGENTS['GPTBot'])
        results.check(
            f'robots.txt readable by GPTBot and lists it: {host}',
            robots.status == 200 and 'User-agent: GPTBot' in robots.body,
            robots.status,
        )


def check_pages(page: Page, base: str, results: Results) -> None:
    """Check that key pages load and header images render.

    Args:
        page: Browser page.
        base: Site base URL.
        results: Collector for outcomes.
    """
    for path in PAGES:
        response = page.goto(base + path, wait_until='load')
        results.check(f'page {path}', response is not None and response.status == 200, response and response.status)

    for path, selector in COVER_PAGES.items():
        page.goto(base + path, wait_until='load')
        loaded = page.evaluate(
            """async (selector) => {
                const el = document.querySelector(selector);
                if (!el) return 'missing element';
                const url = (getComputedStyle(el).backgroundImage.match(/url\\("([^"]+)"\\)/) || [])[1];
                if (!url) return 'no background image';
                return await new Promise((ok) => { const i = new Image(); i.onload = () => ok(i.naturalWidth); i.onerror = () => ok(0); i.src = url; });
            }""",
            selector,
        )
        results.check(f'header image {path}', isinstance(loaded, int) and loaded > 0, loaded)


LIGHTBOX_STATE = """() => {
    const outer = document.querySelector('.lg-outer');
    const dl = outer && outer.querySelector('.lg-download');
    const strip = outer && outer.querySelector('.lg-thumb-outer');
    const visible = (el) => !!el && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().width > 0;
    return {
        open: !!outer && outer.classList.contains('lg-visible'),
        counter: outer ? (outer.querySelector('.lg-counter-current') || {}).textContent : null,
        caption: outer ? ((outer.querySelector('.lg-sub-html') || {}).textContent || '').trim() : '',
        download: visible(dl) ? dl.getAttribute('href') : null,
        downloadTarget: dl ? dl.getAttribute('target') : null,
        strip: visible(strip),
        hash: location.hash,
    };
}"""

RIGHT_CLICK = """(selector) => {
    const el = document.querySelector(selector);
    if (!el) return { prevented: 'missing' };
    const ev = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 60, clientY: 60, button: 2 });
    el.dispatchEvent(ev);
    const menu = document.querySelector('#context-menu');
    return { prevented: ev.defaultPrevented, menu: menu ? menu.querySelector('a').getAttribute('href') : null };
}"""


def check_lightbox(page: Page, base: str, path: str, downloads: bool, results: Results) -> None:
    """Exercise the lightbox on one gallery page.

    Args:
        page: Browser page.
        base: Site base URL.
        path: Gallery page path.
        downloads: Whether the page allows downloads.
        results: Collector for outcomes.
    """
    page.goto(base + path, wait_until='load')
    expected = page.evaluate(
        """() => [0, 1, 2].map((i) => ({
            dl: (document.querySelector(`#image-${i}-actions > a.icon-download`) || { getAttribute: () => null }).getAttribute('href'),
            src: (document.querySelector(`#image-${i}`) || { dataset: {} }).dataset.src || null,
        }))"""
    )

    thumb = page.evaluate(RIGHT_CLICK, '#image-0 img')
    results.check(f'{path} right-click blocked on thumbnail', thumb['prevented'] is True, thumb)
    if downloads:
        results.check(f'{path} download menu on thumbnail', thumb['menu'] == expected[0]['src'], thumb['menu'])
    page.evaluate("() => { const m = document.querySelector('#context-menu'); if (m) m.style.display = 'none'; }")

    page.locator('#image-2-actions [data-lg-open]').dispatch_event('click')
    page.wait_for_timeout(900)
    state = page.evaluate(LIGHTBOX_STATE)
    results.check(f'{path} title link opens slide 3', state['open'] and state['counter'] == '3', state)
    results.check(f'{path} caption shown', bool(state['caption']), state['caption'])
    results.check(f'{path} thumbnail strip hidden on open', state['strip'] is False, state['strip'])
    results.check(f'{path} hash follows slide', state['hash'] == '#gallery-3', state['hash'])
    if downloads:
        results.check(f'{path} download follows slide', state['download'] == expected[2]['dl'], state['download'])
        results.check(f'{path} download stays in page', state['downloadTarget'] is None, state['downloadTarget'])
        lb = page.evaluate(RIGHT_CLICK, '.lg-current .lg-image')
        results.check(f'{path} download menu in lightbox', lb['menu'] == expected[2]['src'], lb)
    else:
        results.check(f'{path} download hidden', state['download'] is None, state['download'])
        lb = page.evaluate(RIGHT_CLICK, '.lg-current .lg-image')
        results.check(f'{path} right-click blocked in lightbox', lb['prevented'] is True, lb)

    page.keyboard.press('Escape')
    page.wait_for_timeout(900)
    state = page.evaluate(LIGHTBOX_STATE)
    results.check(f'{path} Escape closes, hash cleared', not state['open'] and state['hash'] == '', state)

    # Leave the page first; a hash-only change is an in-page jump and wouldn't reload the gallery.
    page.goto('about:blank')
    page.goto(base + path + '#gallery-3', wait_until='load')
    page.wait_for_timeout(1200)
    state = page.evaluate(LIGHTBOX_STATE)
    results.check(f'{path} #gallery-3 deep link', state['open'] and state['counter'] == '3', state)


def run_browser(browser: Browser, base: str, results: Results) -> None:
    """Run all browser checks in one engine.

    Args:
        browser: Launched browser.
        base: Site base URL.
        results: Collector for outcomes.
    """
    # Own page without error listeners: the 404 page's response would count as a console error.
    probe = browser.new_page()
    response = probe.goto(base + '/does-not-exist/', wait_until='load')
    results.check(
        'missing page returns 404', response is not None and response.status == 404, response and response.status
    )
    probe.close()

    page = browser.new_page(viewport={'width': 1280, 'height': 900})
    errors: list[str] = []
    page.on('pageerror', lambda err: errors.append(f'{page.url}: {err}'))
    page.on(
        'console',
        lambda msg: (
            errors.append(f'{page.url}: {msg.text}')
            if msg.type == 'error' and not IGNORED_CONSOLE.search(msg.text)
            else None
        ),
    )
    check_pages(page, base, results)
    for path, downloads in LIGHTBOX_PAGES.items():
        check_lightbox(page, base, path, downloads, results)
    results.check('no JavaScript errors', not errors, json.dumps(errors[:5]))
    page.close()


def main() -> int:
    """Run the smoke test.

    Returns:
        Process exit code: 0 when every check passes.
    """
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--base', default='http://127.0.0.1:4000', help='site base URL')
    parser.add_argument('--browsers', default='chromium,firefox,webkit', help='comma-separated engines')
    args = parser.parse_args()
    base = args.base.rstrip('/')
    results = Results()

    check_edge(base, results)
    with sync_playwright() as playwright:
        for name in args.browsers.split(','):
            print(name)
            try:
                browser = getattr(playwright, name).launch()
            except Error as err:
                results.check(f'{name} launch', False, f'{err.message.splitlines()[0]} (see install note in --help)')
                continue
            run_browser(browser, base, results)
            browser.close()

    print(f'\n{results.passed} passed, {len(results.failures)} failed')
    for failure in results.failures:
        print(f'  FAIL {failure}')
    return 1 if results.failures else 0


if __name__ == '__main__':
    sys.exit(main())
