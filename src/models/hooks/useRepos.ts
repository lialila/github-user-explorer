import useSWRInfinite, { SWRInfiniteKeyLoader } from "swr/infinite";
import { useMemo } from "react";
import GitHubRepo from "../GitHubRepo";

interface SWRData<Data = any> {
  body?: Data;
  headers: Headers;
}

interface UseInfiniteDataHookProps<T> {
  data: SWRData<T[]>[] | undefined;
  isLoading: boolean;
  isLoadingMore: boolean;
  canLoadMore: boolean;
  refetch: () => void;
  setSize: (size: number) => Promise<SWRData<T[]>[] | undefined>;
}

const useRepos = ({
  getKey,
  batchSize,
}: {
  getKey: SWRInfiniteKeyLoader;
  batchSize: number;
}): UseInfiniteDataHookProps<GitHubRepo[]> => {
  const fetcher = async (url: string) => {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch data");

      const data = await res.json();

      // Extract items if using Search API for /search/repositories endpoint
      return data.items || data;
    } catch (err) {
      console.error("GitHub API fetch error:", err);
      return [];
    }
  };
  const { data, isLoading, setSize, size, mutate } = useSWRInfinite(
    getKey,
    fetcher,
    {
      revalidateFirstPage: false,
      revalidateAll: false,
      isPaused: () => !getKey,
    }
  );

  const count: number | undefined = useMemo(() => {
    return data?.reduce((acc, page) => acc + (page?.length || 0), 0) || 0;
  }, [data]);

  const isLoadingMore = useMemo(
    () => !!(size > 0 && data && typeof data[size - 1] === "undefined"),
    [size, data]
  );

  const canLoadMore = useMemo(
    () => count !== undefined && size * batchSize === count,
    [count, size, batchSize]
  );

  return {
    data: data || [],
    isLoading,
    isLoadingMore,
    canLoadMore,
    refetch: mutate,
    setSize,
  };
};

export default useRepos;
