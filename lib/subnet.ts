export type IpVersion = 4 | 6;

export type SubnetResult = {
  version: IpVersion;
  /** The address the user supplied, normalized. */
  address: string;
  prefix: number;
  /** True when the user gave no prefix and a default was assumed. */
  prefixAssumed: boolean;
  cidr: string;
  networkAddress: string;
  /** IPv4 only — IPv6 has no broadcast address. */
  broadcastAddress: string | null;
  firstHost: string;
  lastHost: string;
  netmask: string | null;
  wildcardMask: string | null;
  /** Total addresses in the block, including network/broadcast. */
  totalAddresses: bigint;
  /** Assignable host addresses. */
  usableHosts: bigint;
  addressClass: string | null;
  scope: string;
  isPrivate: boolean;
  /** Per-octet/hextet bit layout for the visualisation. */
  bitGroups: BitGroup[];
};

export type BitGroup = {
  label: string;
  bits: Array<{ value: "0" | "1"; isNetwork: boolean }>;
};

export type SplitRow = {
  index: number;
  cidr: string;
  networkAddress: string;
  firstHost: string;
  lastHost: string;
  broadcastAddress: string | null;
  usableHosts: bigint;
};

export type ParseError = { ok: false; error: string };
export type ParseSuccess = { ok: true; result: SubnetResult };
export type ParseOutcome = ParseSuccess | ParseError;

const DEFAULT_PREFIX: Record<IpVersion, number> = { 4: 24, 6: 64 };
const BITS: Record<IpVersion, number> = { 4: 32, 6: 128 };

/**
 * Accepts "10.0.0.1/8", "10.0.0.1 255.0.0.0", "10.0.0.1" (prefix assumed),
 * and the IPv6 equivalents.
 */
export function calculateSubnet(input: string): ParseOutcome {
  const raw = input.trim();

  if (!raw) {
    return { ok: false, error: "Enter an IP address or CIDR block, for example 192.168.1.0/24." };
  }

  // Split on "/" or whitespace so "10.0.0.1 255.0.0.0" works too.
  const parts = raw.split(/[/\s]+/).filter(Boolean);

  if (parts.length > 2) {
    return { ok: false, error: "Enter a single address, optionally followed by a prefix or netmask." };
  }

  const [addressPart, prefixPart] = parts;
  const version = detectVersion(addressPart);

  if (!version) {
    return { ok: false, error: `"${addressPart}" is not a valid IPv4 or IPv6 address.` };
  }

  const addressValue =
    version === 4 ? parseIpv4(addressPart) : parseIpv6(addressPart);

  if (addressValue === null) {
    return { ok: false, error: `"${addressPart}" is not a valid IPv${version} address.` };
  }

  let prefix: number;
  let prefixAssumed = false;

  if (prefixPart === undefined) {
    prefix = DEFAULT_PREFIX[version];
    prefixAssumed = true;
  } else {
    const parsed = parsePrefix(prefixPart, version);

    if (parsed === null) {
      return {
        ok: false,
        error:
          version === 4
            ? `"${prefixPart}" is not a valid prefix (0-32) or netmask.`
            : `"${prefixPart}" is not a valid prefix (0-128).`,
      };
    }

    prefix = parsed;
  }

  return { ok: true, result: buildResult(version, addressValue, prefix, prefixAssumed) };
}

function buildResult(
  version: IpVersion,
  addressValue: bigint,
  prefix: number,
  prefixAssumed: boolean,
): SubnetResult {
  const bits = BITS[version];
  const hostBits = BigInt(bits - prefix);
  const total = 1n << hostBits;
  const mask = maskFor(version, prefix);
  const network = addressValue & mask;
  const last = network + total - 1n;
  const format = version === 4 ? formatIpv4 : formatIpv6;

  // IPv4 reserves network+broadcast, except /31 (RFC 3021) and /32.
  let firstHost = network;
  let lastHost = last;
  let usableHosts = total;

  if (version === 4) {
    if (prefix <= 30) {
      firstHost = network + 1n;
      lastHost = last - 1n;
      usableHosts = total - 2n;
    }
  } else if (prefix <= 126) {
    // IPv6 has no broadcast; the subnet-router anycast address is the first one.
    usableHosts = total;
  }

  return {
    version,
    address: format(addressValue),
    prefix,
    prefixAssumed,
    cidr: `${format(network)}/${prefix}`,
    networkAddress: format(network),
    broadcastAddress: version === 4 && prefix <= 30 ? format(last) : null,
    firstHost: format(firstHost),
    lastHost: format(lastHost),
    netmask: version === 4 ? formatIpv4(mask) : null,
    wildcardMask:
      version === 4 ? formatIpv4(mask ^ ((1n << 32n) - 1n)) : null,
    totalAddresses: total,
    usableHosts,
    addressClass: version === 4 ? ipv4Class(network) : null,
    scope: describeScope(version, network),
    isPrivate: isPrivateAddress(version, network),
    bitGroups: buildBitGroups(version, network, prefix),
  };
}

/** Divides the block into equal subnets of `newPrefix`, capped at `limit` rows. */
export function splitSubnet(
  result: SubnetResult,
  newPrefix: number,
  limit = 16,
): { rows: SplitRow[]; total: bigint } {
  const bits = BITS[result.version];

  if (newPrefix <= result.prefix || newPrefix > bits) {
    return { rows: [], total: 0n };
  }

  const format = result.version === 4 ? formatIpv4 : formatIpv6;
  const network = result.version === 4
    ? parseIpv4(result.networkAddress)
    : parseIpv6(result.networkAddress);

  if (network === null) {
    return { rows: [], total: 0n };
  }

  const blockSize = 1n << BigInt(bits - newPrefix);
  const total = 1n << BigInt(newPrefix - result.prefix);
  const rowCount = total < BigInt(limit) ? Number(total) : limit;
  const rows: SplitRow[] = [];

  for (let index = 0; index < rowCount; index += 1) {
    const start = network + BigInt(index) * blockSize;
    const end = start + blockSize - 1n;
    const reservesEnds = result.version === 4 && newPrefix <= 30;

    rows.push({
      index: index + 1,
      cidr: `${format(start)}/${newPrefix}`,
      networkAddress: format(start),
      firstHost: format(reservesEnds ? start + 1n : start),
      lastHost: format(reservesEnds ? end - 1n : end),
      broadcastAddress: reservesEnds ? format(end) : null,
      usableHosts: reservesEnds ? blockSize - 2n : blockSize,
    });
  }

  return { rows, total };
}

function maskFor(version: IpVersion, prefix: number) {
  const bits = BigInt(BITS[version]);
  const all = (1n << bits) - 1n;

  if (prefix === 0) {
    return 0n;
  }

  return (all << BigInt(BITS[version] - prefix)) & all;
}

function detectVersion(value: string): IpVersion | null {
  if (value.includes(":")) {
    return 6;
  }

  if (/^\d+\.\d+\.\d+\.\d+$/.test(value)) {
    return 4;
  }

  return null;
}

function parsePrefix(value: string, version: IpVersion): number | null {
  if (/^\d+$/.test(value)) {
    const prefix = Number.parseInt(value, 10);
    return prefix >= 0 && prefix <= BITS[version] ? prefix : null;
  }

  // Dotted netmask form, IPv4 only — must be a contiguous run of 1 bits.
  if (version === 4) {
    const mask = parseIpv4(value);

    if (mask === null) {
      return null;
    }

    const binary = mask.toString(2).padStart(32, "0");

    if (!/^1*0*$/.test(binary)) {
      return null;
    }

    return binary.replace(/0+$/, "").length;
  }

  return null;
}

export function parseIpv4(value: string): bigint | null {
  const octets = value.split(".");

  if (octets.length !== 4) {
    return null;
  }

  let result = 0n;

  for (const octet of octets) {
    if (!/^\d{1,3}$/.test(octet)) {
      return null;
    }

    const numeric = Number.parseInt(octet, 10);

    if (numeric > 255) {
      return null;
    }

    result = (result << 8n) | BigInt(numeric);
  }

  return result;
}

export function parseIpv6(value: string): bigint | null {
  let text = value;

  // An embedded IPv4 tail (::ffff:1.2.3.4) becomes two hextets.
  const embedded = text.match(/(\d+\.\d+\.\d+\.\d+)$/);

  if (embedded) {
    const v4 = parseIpv4(embedded[1]);

    if (v4 === null) {
      return null;
    }

    const high = (v4 >> 16n) & 0xffffn;
    const low = v4 & 0xffffn;
    text = `${text.slice(0, embedded.index)}${high.toString(16)}:${low.toString(16)}`;
  }

  const doubleColonCount = (text.match(/::/g) ?? []).length;

  if (doubleColonCount > 1) {
    return null;
  }

  let head: string[];
  let tail: string[];

  if (doubleColonCount === 1) {
    const [left, right] = text.split("::");
    head = left ? left.split(":") : [];
    tail = right ? right.split(":") : [];
  } else {
    head = text.split(":");
    tail = [];
  }

  const groups = [...head, ...tail];

  if (groups.some((group) => !/^[0-9a-fA-F]{1,4}$/.test(group))) {
    return null;
  }

  if (doubleColonCount === 1) {
    if (groups.length > 7) {
      return null;
    }
  } else if (groups.length !== 8) {
    return null;
  }

  const fillCount = 8 - groups.length;
  const full = [
    ...head,
    ...Array.from({ length: fillCount }, () => "0"),
    ...tail,
  ];

  let result = 0n;

  for (const group of full) {
    result = (result << 16n) | BigInt(Number.parseInt(group, 16));
  }

  return result;
}

export function formatIpv4(value: bigint): string {
  return [24n, 16n, 8n, 0n].map((shift) => ((value >> shift) & 0xffn).toString()).join(".");
}

/** RFC 5952 style: lowercase, longest zero run collapsed to "::". */
export function formatIpv6(value: bigint): string {
  const hextets: string[] = [];

  for (let index = 7n; index >= 0n; index -= 1n) {
    hextets.push((((value >> (index * 16n)) & 0xffffn)).toString(16));
  }

  let bestStart = -1;
  let bestLength = 0;
  let currentStart = -1;
  let currentLength = 0;

  hextets.forEach((hextet, index) => {
    if (hextet === "0") {
      if (currentStart === -1) {
        currentStart = index;
        currentLength = 0;
      }
      currentLength += 1;

      if (currentLength > bestLength) {
        bestStart = currentStart;
        bestLength = currentLength;
      }
    } else {
      currentStart = -1;
      currentLength = 0;
    }
  });

  if (bestLength < 2) {
    return hextets.join(":");
  }

  const head = hextets.slice(0, bestStart).join(":");
  const tail = hextets.slice(bestStart + bestLength).join(":");

  return `${head}::${tail}`;
}

function buildBitGroups(version: IpVersion, network: bigint, prefix: number): BitGroup[] {
  const bits = BITS[version];
  const binary = network.toString(2).padStart(bits, "0");
  const groupSize = version === 4 ? 8 : 16;
  const groups: BitGroup[] = [];

  for (let start = 0; start < bits; start += groupSize) {
    const slice = binary.slice(start, start + groupSize);
    const value = Number.parseInt(slice, 2);

    groups.push({
      label:
        version === 4 ? value.toString() : value.toString(16).padStart(4, "0"),
      bits: slice.split("").map((bit, offset) => ({
        value: bit === "1" ? "1" : "0",
        isNetwork: start + offset < prefix,
      })),
    });
  }

  return groups;
}

function ipv4Class(network: bigint): string {
  const firstOctet = Number((network >> 24n) & 0xffn);

  if (firstOctet < 128) return "A";
  if (firstOctet < 192) return "B";
  if (firstOctet < 224) return "C";
  if (firstOctet < 240) return "D (multicast)";
  return "E (reserved)";
}

function inRange(value: bigint, cidr: string, version: IpVersion) {
  const [base, prefixText] = cidr.split("/");
  const baseValue = version === 4 ? parseIpv4(base) : parseIpv6(base);

  if (baseValue === null) {
    return false;
  }

  const mask = maskFor(version, Number.parseInt(prefixText, 10));
  return (value & mask) === (baseValue & mask);
}

const IPV4_SCOPES: Array<{ cidr: string; label: string; isPrivate: boolean }> = [
  { cidr: "10.0.0.0/8", label: "Private (RFC 1918)", isPrivate: true },
  { cidr: "172.16.0.0/12", label: "Private (RFC 1918)", isPrivate: true },
  { cidr: "192.168.0.0/16", label: "Private (RFC 1918)", isPrivate: true },
  { cidr: "127.0.0.0/8", label: "Loopback", isPrivate: true },
  { cidr: "169.254.0.0/16", label: "Link-local", isPrivate: true },
  { cidr: "100.64.0.0/10", label: "Carrier-grade NAT", isPrivate: true },
  { cidr: "192.0.2.0/24", label: "Documentation (TEST-NET-1)", isPrivate: true },
  { cidr: "198.51.100.0/24", label: "Documentation (TEST-NET-2)", isPrivate: true },
  { cidr: "203.0.113.0/24", label: "Documentation (TEST-NET-3)", isPrivate: true },
  { cidr: "224.0.0.0/4", label: "Multicast", isPrivate: false },
  { cidr: "240.0.0.0/4", label: "Reserved", isPrivate: false },
  { cidr: "0.0.0.0/8", label: "This network", isPrivate: true },
];

const IPV6_SCOPES: Array<{ cidr: string; label: string; isPrivate: boolean }> = [
  { cidr: "::1/128", label: "Loopback", isPrivate: true },
  { cidr: "::/128", label: "Unspecified", isPrivate: true },
  { cidr: "fc00::/7", label: "Unique local (private)", isPrivate: true },
  { cidr: "fe80::/10", label: "Link-local", isPrivate: true },
  { cidr: "ff00::/8", label: "Multicast", isPrivate: false },
  { cidr: "2001:db8::/32", label: "Documentation", isPrivate: true },
  { cidr: "64:ff9b::/96", label: "IPv4-IPv6 translation", isPrivate: false },
];

function describeScope(version: IpVersion, network: bigint): string {
  const scopes = version === 4 ? IPV4_SCOPES : IPV6_SCOPES;

  for (const scope of scopes) {
    if (inRange(network, scope.cidr, version)) {
      return scope.label;
    }
  }

  return version === 4 ? "Public" : "Global unicast";
}

function isPrivateAddress(version: IpVersion, network: bigint): boolean {
  const scopes = version === 4 ? IPV4_SCOPES : IPV6_SCOPES;

  for (const scope of scopes) {
    if (inRange(network, scope.cidr, version)) {
      return scope.isPrivate;
    }
  }

  return false;
}

/** Suggested split prefixes offered in the UI for a given block. */
export function splitOptions(result: SubnetResult): number[] {
  const bits = BITS[result.version];
  const options: number[] = [];

  for (let prefix = result.prefix + 1; prefix <= Math.min(result.prefix + 6, bits); prefix += 1) {
    options.push(prefix);
  }

  return options;
}

export function formatBig(value: bigint): string {
  return value.toLocaleString("en-US");
}
