import concurrent.futures, json, re, urllib.request
from pathlib import Path
from collections import Counter
root = Path(__file__).resolve().parent.parent
records = json.loads((root / 'data.json').read_text(encoding='utf-8'))['records']
def check(r):
    result = {'title': r['title'], 'version': r['version'], 'url': r['url']}
    try:
        req = urllib.request.Request(r['url'], headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=25) as response:
            body = response.read(2500000).decode('utf-8', errors='replace')
            result.update(status=response.status, final_url=response.url, title_tag=re.findall(r'<title>(.*?)</title>', body, re.S)[:1])
            blocked = 'accounts.google.com' in response.url or any(s in body for s in ['You need access', 'You need permission', 'Request access', '액세스 권한이 필요'])
            result['result'] = 'blocked' if blocked else 'opened'
    except Exception as error:
        result.update(result='unverified', error=str(error))
    return result
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    results = list(pool.map(check, records))
(root / 'verification' / 'public-link-checks.json').write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
print(dict(Counter(r['result'] for r in results)))
print(json.dumps([{'title':r['title'],'version':r['version'],'error':r.get('error'), 'result':r['result']} for r in results if r['result']!='opened'], ensure_ascii=False))
