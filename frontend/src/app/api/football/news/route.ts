import Parser from "rss-parser";
import { NextResponse } from "next/server";

import type { NewsArticle } from "@/types/news";

const parser = new Parser();

const NEWS_SOURCES = [
  {
    name: "BBC Sport",
    url: "https://feeds.bbci.co.uk/sport/football/rss.xml",
    allowedHosts: ["bbc.co.uk", "bbc.com"],
  },
  {
    name: "The Guardian",
    url: "https://www.theguardian.com/football/rss",
    allowedHosts: ["theguardian.com"],
  },
  {
    name: "Sky Sports",
    url: "https://www.skysports.com/rss/11095",
    allowedHosts: ["skysports.com"],
  },
];

function cleanText(value: string): string {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function isAllowedArticleUrl(
  value: string,
  allowedHosts: string[],
): boolean {
  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      allowedHosts.some(
        (host) =>
          url.hostname === host ||
          url.hostname.endsWith(`.${host}`),
      )
    );
  } catch {
    return false;
  }
}

async function fetchNewsSource(
  source: (typeof NEWS_SOURCES)[number],
): Promise<NewsArticle[]> {
  const response = await fetch(source.url, {
    headers: {
      Accept: "application/rss+xml, application/xml, text/xml",
      "User-Agent": "LiveScoreByCheke/1.0",
    },
    next: {
      revalidate: 900,
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(
      `${source.name} returned HTTP ${response.status}`,
    );
  }

  const xml = await response.text();
  const feed = await parser.parseString(xml);

  return feed.items
    .filter(
      (item) =>
        typeof item.title === "string" &&
        typeof item.link === "string" &&
        isAllowedArticleUrl(
          item.link,
          source.allowedHosts,
        ),
    )
    .map((item) => {
      const summary = cleanText(
        item.contentSnippet ||
          item.content ||
          item.summary ||
          "",
      );

      const imageUrl =
        item.enclosure?.type?.startsWith("image/")
          ? item.enclosure.url
          : undefined;

      return {
        id: item.guid || item.link!,
        title: cleanText(item.title || ""),
        link: item.link!,
        summary:
          summary.length > 260
            ? `${summary.slice(0, 257).trim()}...`
            : summary,
        publishedAt: item.isoDate || item.pubDate || "",
        source: source.name,
        imageUrl,
      };
    });
}

export async function GET() {
  const results = await Promise.allSettled(
    NEWS_SOURCES.map(fetchNewsSource),
  );

  const articles: NewsArticle[] = [];
  const failedSources: string[] = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      articles.push(...result.value);
    } else {
      failedSources.push(NEWS_SOURCES[index].name);
    }
  });

  if (articles.length === 0) {
    return NextResponse.json(
      {
        success: false,
        articles: [],
        error:
          "Football news is temporarily unavailable. Please try again later.",
        failedSources,
      },
      {
        status: 502,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const uniqueArticles = Array.from(
    new Map(
      articles.map((article) => [
        article.link,
        article,
      ]),
    ).values(),
  );

  uniqueArticles.sort((first, second) => {
    const firstDate = Date.parse(first.publishedAt);
    const secondDate = Date.parse(second.publishedAt);

    return (
      (Number.isNaN(secondDate) ? 0 : secondDate) -
      (Number.isNaN(firstDate) ? 0 : firstDate)
    );
  });

  return NextResponse.json(
    {
      success: true,
      articles: uniqueArticles.slice(0, 40),
      updatedAt: new Date().toISOString(),
      failedSources,
    },
    {
      headers: {
        "Cache-Control":
          "public, s-maxage=900, stale-while-revalidate=3600",
      },
    },
  );
}