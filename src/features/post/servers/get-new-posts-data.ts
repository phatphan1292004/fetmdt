import "server-only";

import { getNewestPublicPosts } from "@/src/app/api/v1/posts/route";
import type { PostListingData } from "./get-home-data";

const DEFAULT_NEWEST_POST_LIMIT = 6;
const MAX_NEWEST_POST_LIMIT = 20;

function normalizeLimit(limit: number): number {
  if (!Number.isFinite(limit) || limit <= 0) {
    return DEFAULT_NEWEST_POST_LIMIT;
  }

  return Math.min(Math.floor(limit), MAX_NEWEST_POST_LIMIT);
}

export async function getNewestPostsData(limit = 6): Promise<readonly PostListingData[]> {
  try {
    const safeLimit = normalizeLimit(limit);
    const data = await getNewestPublicPosts(safeLimit);
    return data;
  } catch (error) {
    console.error("[getNewestPostsData] Failed to load newest posts", error);
    return [];
  }
}
