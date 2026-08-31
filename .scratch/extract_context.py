import re, sys

html = open(sys.argv[1], encoding='utf-8', errors='ignore').read()

# Unescape Next.js flight payload quotes
h = html.replace('\\"', '"').replace('\\\\', '\\')

keywords = ['prize', 'Prize', 'track', 'Track', 'venue', 'Dallas', 'ACM',
            'eligib', 'judg', 'submission', 'reward', '$', 'description',
            'startDate', 'endDate', 'format', 'theme', 'sponsor', 'register']

seen = set()
for kw in keywords:
    print(f"=== {kw} ===")
    count = 0
    for m in re.finditer(re.escape(kw), h):
        s = max(0, m.start() - 150)
        e = min(len(h), m.end() + 200)
        snippet = h[s:e].replace('\n', ' ')
        key = snippet[:80]
        if key in seen:
            continue
        seen.add(key)
        print(snippet)
        print('---')
        count += 1
        if count >= 6:
            break
