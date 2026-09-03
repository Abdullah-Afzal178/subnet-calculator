# Subnet Calculator — IPv4 & IPv6 CIDR Calculator

An open-source subnet and CIDR calculator: enter any IPv4 or IPv6 address or CIDR block and get the network and broadcast addresses, usable host range, subnet and wildcard masks, a bit-level layout, subnet splitting — and **who actually announces the range**, via the [ipgeolocation.io](https://ipgeolocation.io) API.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-000?logo=nextdotjs)](https://nextjs.org/)
[![Powered by ipgeolocation.io](https://img.shields.io/badge/Powered%20by-ipgeolocation.io-1a73e8)](https://ipgeolocation.io)

<!-- Add a screenshot of the tool running locally at ./public/tool.png and reference it here -->

---

## What It Does

Accepts CIDR notation, a dotted subnet mask, or a bare address:

- `192.168.1.0/24`
- `10.0.0.1 255.255.240.0`
- `2001:db8::/48`
- `8.8.8.8` (a `/24` is assumed and flagged)

And returns:

- **Network** and **broadcast** addresses, **first/last usable host**
- **Subnet mask** and **wildcard mask** (IPv4)
- **Total addresses** and **usable hosts** — exact, even for IPv6 `/48` (1.2 × 10²⁴)
- **Prefix length**, **address class**, **IP version**
- **Scope detection** — private (RFC 1918), loopback, link-local, CGNAT, documentation, multicast, reserved, unique-local, global unicast
- **Bit layout** — every bit of the address, coloured network vs host
- **Subnet splitting** — divide the block into equal smaller subnets with per-subnet host ranges
- **Range ownership** — for public blocks: the announced route, ASN, organization, RIR, country, and anycast/CDN flags

Correct handling of the tricky cases: `/31` point-to-point links (RFC 3021), `/32` single hosts, `/0`, IPv6 zero-run compression (RFC 5952), and IPv4-in-IPv6 addresses.

---

## Why ipgeolocation.io

Subnet maths is local arithmetic — but "who owns this block?" is not. That is where the API adds something a plain calculator cannot:

- **Announced route** — the real prefix the address is routed inside, which is often different from the block you typed.
- **ASN and organization** — who operates the range, plus RIR and registration domain.
- **Anycast and CDN flags** — tells you when a block is announced from many locations.
- **One call, free tier** — a single [IP Geolocation API](https://ipgeolocation.io/documentation/ip-location-api.html) request with `include=network` returns the network, ASN, and company data together.

Private and reserved blocks are detected locally and skip the lookup entirely — no wasted API credits.

> ipgeolocation.io also offers dedicated APIs for [ASN](https://ipgeolocation.io/documentation/asn-api.html), [Security](https://ipgeolocation.io/documentation/ip-security-api.html) (VPN, proxy, Tor detection), [Timezone](https://ipgeolocation.io/documentation/timezone-api.html), [Astronomy](https://ipgeolocation.io/documentation/astronomy-api.html), [User-Agent parsing](https://ipgeolocation.io/documentation/user-agent-api.html), and [Abuse Contact](https://ipgeolocation.io/documentation/ip-abuse-contact-api.html) lookups.

**[Get your free API key →](https://ipgeolocation.io/signup)**

---

## Features

- **IPv4 and IPv6** — full 128-bit maths using BigInt, no precision loss
- **Three input formats** — CIDR, dotted netmask, or a bare address
- **Bit-level visualisation** — see exactly which bits the prefix covers
- **Subnet splitting** — one click to divide a block into `/25` … `/30` and beyond
- **Range ownership** — real routing data for public blocks
- **No API call for private blocks** — detected locally
- **Server-side API calls only** — your API key is never exposed to the browser
- **Session-scoped caching** — refreshing doesn't burn another API call
- **Shareable URLs** — every result is a link (`/calculator?cidr=…&split=…`)
- **SEO-ready** — Open Graph tags, meta description, `robots.txt`, `sitemap.xml`, and favicon

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org/) (App Router) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Language | TypeScript |
| Icons | [lucide-react](https://lucide.dev/) |
| Ownership data | [ipgeolocation.io](https://ipgeolocation.io) |

The subnet maths in [`lib/subnet.ts`](lib/subnet.ts) has no dependencies and no API calls — it is pure BigInt arithmetic.

---

## Getting Started

### Prerequisites

- Node.js 18+
- An [ipgeolocation.io](https://ipgeolocation.io/signup) API key (free tier is enough). The calculator works without a key; only the ownership panel needs one.

### Run It Locally

1. Clone the repo:

```bash
git clone https://github.com/Abdullah-Afzal178/subnet-calculator.git
cd subnet-calculator
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root:

```env
IPGEOLOCATION_API_KEY=your_api_key_here
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `IPGEOLOCATION_API_KEY` | No | Your [ipgeolocation.io](https://ipgeolocation.io/signup) API key. Without it the calculator still works; the ownership panel shows a notice. |
| `NEXT_PUBLIC_SITE_URL` | No | Your production URL if you choose to deploy (used for sitemap and OG metadata) |

---

## How It Works

1. You submit an address or CIDR block.
2. The server parses it and computes everything locally with BigInt — network, broadcast, host range, masks, counts, scope, and the bit layout. No API call, no rounding.
3. If the block is **public**, the server makes one call to the [IP Geolocation API](https://ipgeolocation.io/documentation/ip-location-api.html) with `include=network` to fetch the announced route, ASN, organization, RIR, and anycast/CDN flags. The API key stays server-side.
4. If the block is **private or reserved**, the lookup is skipped entirely.
5. Ownership results are cached in-memory for the session.

---

## Project Structure

```
subnet-calculator/
├── app/                  # Next.js App Router pages and layouts
│   ├── calculator/       # Results page (?cidr=…&split=…)
│   ├── layout.tsx        # Root layout with metadata
│   ├── page.tsx          # Home — calculator with a worked example
│   ├── opengraph-image.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── components/           # Calculator bar, address table, bit ruler, split table, summary
├── lib/
│   ├── subnet.ts         # Pure BigInt subnet maths (no API, no deps)
│   ├── range-owner.ts    # Calls ipgeolocation.io (key stays server-side)
│   └── session-cache.ts
├── .env                  # API key (not committed)
└── README.md
```

---

## Want to Deploy It?

Works out of the box on any platform that supports Next.js:

- **Vercel** — import the repo, add `IPGEOLOCATION_API_KEY`, deploy.
- **Netlify**, **Cloudflare Pages**, **Railway** — similar process.
- **Self-hosted** — `npm run build && npm start`.

---

## License

MIT — see [LICENSE](LICENSE) for details.
