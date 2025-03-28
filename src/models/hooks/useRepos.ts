import useSWRInfinite, { SWRInfiniteKeyLoader } from "swr/infinite";
import { useCallback, useMemo } from "react";
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
  loadMore: () => void;
  count: number;
  setSize: (size: number) => Promise<SWRData<T[]>[] | undefined>;
}

const fetcher = (url: string) =>
  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch data");
      return res.json();
    })
    .catch((err) => {
      console.error("GitHub API fetch error:", err);
      return [];
    });

const useRepos = ({
  getKey,
  batchSize,
}: {
  getKey: SWRInfiniteKeyLoader;
  batchSize: number;
}): UseInfiniteDataHookProps<GitHubRepo[]> => {
  const { data, isLoading, setSize, size, mutate } = useSWRInfinite(
    getKey,
    fetcher,
    {
      revalidateFirstPage: false,
      revalidateAll: false,
    }
  );

  const count: number | undefined = useMemo(() => {
    return data?.reduce((acc, page) => acc + (page?.length || 0), 0) || 0;
  }, [data]);

  const isLoadingMore = useMemo(
    () => !!(size > 0 && data && typeof data[size - 1] === "undefined"),
    [size, data]
  );

  const loadMore = useCallback(() => setSize(size + 1), [setSize, size]);

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
    loadMore,
    count,
    setSize,
  };
};

export default useRepos;
