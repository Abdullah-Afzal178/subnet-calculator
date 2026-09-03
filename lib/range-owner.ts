import "server-only";

import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { getSessionCache, setSessionCache } from "@/lib/session-cache";

type JsonObject = Record<string, unknown>;

export type RangeOwner = {
  ip: string;
  announcedRoute: string;
  asNumber: string;
  organization: string;
  asnType: string;
  domain: string;
  rir: string;
  companyName: string;
  companyType: string;
  countryName: string;
  isAnycast: boolean;
  isCdn: boolean;
};

export type RangeOwnerResult =
  | { ok: true; cached: boolean; data: RangeOwner }
  | { ok: false; error: { title: string; message: string } };

const ENDPOINTS = [
  "https://api.ipgeolocation.io/v3/ipgeo",
  "https://api.ipgeolocation.io/v2/ipgeo",
];

const FIELDS = [
  "ip",
  "asn",
  "network",
  "company",
  "location.country_name",
].join(",");

/**
 * Looks up who announces the block a public address belongs to. The subnet
 * maths is entirely local; this only adds real-world ownership context.
 */
export async function getRangeOwner(ip: string): Promise<RangeOwnerResult> {
  const cookieStore = await cookies();
  const sessionId =
    cookieStore.get(SESSION_COOKIE_NAME)?.value ?? "anonymous-session";
  const cacheKey = `${sessionId}:owner:${ip}`;
  const cached = getSessionCache<RangeOwner>(cacheKey);

  if (cached) {
    return { ok: true, cached: true, data: cached };
  }

  const apiKey = process.env.IPGEOLOCATION_API_KEY;

  if (!apiKey) {
    return {
      ok: false,
      error: {
        title: "Missing API key",
        message: "Set IPGEOLOCATION_API_KEY in your .env file to show range ownership.",
      },
    };
  }

  let lastError: RangeOwnerResult | null = null;

  for (const endpoint of ENDPOINTS) {
    const params = new URLSearchParams({
      apiKey,
      ip,
      include: "network",
      fields: FIELDS,
    });

    try {
      const response = await fetch(`${endpoint}?${params.toString()}`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        lastError = {
          ok: false,
          error: {
            title: "Ownership lookup unavailable",
            message: `The ownership lookup failed with status ${response.status}.`,
          },
        };

        if (endpoint.endsWith("/v3/ipgeo") && [400, 404, 405].includes(response.status)) {
          continue;
        }

        return lastError;
      }

      const payload = (await safeReadJson(response)) as JsonObject | null;

      if (!payload) {
        lastError = {
          ok: false,
          error: {
            title: "Ownership lookup unavailable",
            message: "The API returned an empty or unreadable response.",
          },
        };
        continue;
      }

      const asn = asObject(payload.asn);
      const network = asObject(payload.network);
      const company = asObject(payload.company);
      const location = asObject(payload.location);

      const data: RangeOwner = {
        ip: readString(payload.ip) ?? ip,
        announcedRoute: readString(network?.route) ?? "",
        asNumber: readString(asn?.as_number) ?? "",
        organization: readString(asn?.organization) ?? "",
        asnType: readString(asn?.type) ?? "",
        domain: readString(asn?.domain) ?? "",
        rir: readString(asn?.rir) ?? "",
        companyName: readString(company?.name) ?? "",
        companyType: readString(company?.type) ?? "",
        countryName: readString(location?.country_name) ?? "",
        isAnycast: network?.is_anycast === true,
        isCdn: network?.is_cdn === true,
      };

      if (!data.asNumber && !data.announcedRoute && !data.organization) {
        lastError = {
          ok: false,
          error: {
            title: "No ownership data",
            message: "The API did not return ownership details for this address.",
          },
        };
        continue;
      }

      setSessionCache(cacheKey, data);

      return { ok: true, cached: false, data };
    } catch (error) {
      lastError = {
        ok: false,
        error: {
          title: "Network error",
          message:
            error instanceof Error
              ? error.message
              : "The ownership lookup could not be completed.",
        },
      };
    }
  }

  return (
    lastError ?? {
      ok: false,
      error: {
        title: "Ownership lookup unavailable",
        message: "The ownership lookup could not be completed.",
      },
    }
  );
}

function readString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function asObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

async function safeReadJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
