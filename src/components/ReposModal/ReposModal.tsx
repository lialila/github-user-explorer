import {
  Dialog,
  Button,
  Box,
  Flex,
  Text,
  Portal,
  CloseButton,
  Center,
  Spinner,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SWRInfiniteKeyLoader } from "swr/infinite";
import useRepos from "@/models/hooks/useRepos";

const enum Sort {
  NEWEST_FIRST = "Newest First",
  OLDEST_FIRST = "Oldest First",
  MOST_STARS = "Stars",
  NAME = "Name",
}
import Select from "react-select";
import RepoCard from "../RepoCard";
import GitHubRepo from "@/models/GitHubRepo";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

const BATCH_SIZE = 6;

export const ReposModal = ({ user }) => {
  const [allLanguageOptions, setAllLanguageOptions] = useState([]);
  const [languageFilter, setLanguageFilter] = useState([] as string[]);
  const [sort, setSort] = useState(Sort.NEWEST_FIRST as string);
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  const getKey: SWRInfiniteKeyLoader = (index) => {
    let url;

    // Always use the search API if language filter is applied
    if (languageFilter.length > 0 || sort === Sort.MOST_STARS) {
      url = new URL("https://api.github.com/search/repositories");

      let query = `user:${user.login}`;

      if (languageFilter.length > 0) {
        // Apply language filters
        languageFilter.forEach((lang) => {
          query += ` language:${lang}`;
        });
      }
      url.searchParams.append("q", query);

      // Apply sorting
      if (sort === Sort.MOST_STARS) {
        url.searchParams.append("sort", "stars");
        url.searchParams.append("order", "desc");
      } else if (sort === Sort.NEWEST_FIRST) {
        url.searchParams.append("sort", "updated");
        url.searchParams.append("order", "desc");
      } else if (sort === Sort.OLDEST_FIRST) {
        url.searchParams.append("sort", "updated");
        url.searchParams.append("order", "asc");
      } else if (sort === Sort.NAME) {
        url.searchParams.append("sort", "name");
        url.searchParams.append("order", "asc");
      }

      url.searchParams.append("per_page", BATCH_SIZE.toString());
      url.searchParams.append("page", (index + 1).toString());

      return url.toString();
    }

    url = new URL(`https://api.github.com/users/${user.login}/repos`);
    url.searchParams.append("per_page", BATCH_SIZE.toString());
    url.searchParams.append("page", (index + 1).toString());

    if (sort === Sort.OLDEST_FIRST) {
      url.searchParams.append("sort", "updated");
      url.searchParams.append("direction", "asc");
    } else if (sort === Sort.NEWEST_FIRST) {
      url.searchParams.append("sort", "updated");
      url.searchParams.append("direction", "desc");
    } else {
      url.searchParams.append("sort", "name");
      url.searchParams.append("direction", "asc");
    }

    return url.toString();
  };

  const {
    data: reposData = [],
    isLoading,
    canLoadMore,
    refetch: mutate,
    setSize,
    isLoadingMore,
  } = useRepos({ getKey, batchSize: BATCH_SIZE });

  const repos: Partial<GitHubRepo[]> = reposData
    ? reposData
        .slice(currentPage - 1, currentPage)
        .flatMap((page) => page as unknown as GitHubRepo[])
    : [];

  // Reset pagination to only fetch first page
  useEffect(() => {
    if (isOpen) {
      setSize(1);
    }
  }, [isOpen, setSize]);

  // Extract all languages TODO: fix
  const fetchAllLanguages = useCallback(async () => {
    try {
      const response = await fetch(
        `https://api.github.com/users/${user.login}/repos?per_page=100`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();

      const languageSet = new Set<string>();

      // Fetch languages for each repo using the "languages_url"
      await Promise.all(
        data.map(async (repo: any) => {
          if (repo.languages_url) {
            const langResponse = await fetch(repo.languages_url, {
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN}`,
                Accept: "application/vnd.github.v3+json",
              },
            });

            if (langResponse.ok) {
              const langData = await langResponse.json();
              Object.keys(langData).forEach((lang) => languageSet.add(lang));
            }
          }
        })
      );

      setAllLanguageOptions(
        Array.from(languageSet).map((value) => ({ value, label: value }))
      );
    } catch (err) {
      console.error("GitHub API fetch error:", err);
    }
  }, [user.login]);

  // Fetch all languages when component mounts
  useEffect(() => {
    fetchAllLanguages();
  }, [isOpen]);

  const sortOptions = [
    { value: Sort.NEWEST_FIRST, label: "Newest" },
    { value: Sort.OLDEST_FIRST, label: "Oldest" },
    { value: Sort.MOST_STARS, label: "Stars" },
    { value: Sort.NAME, label: "Name" },
  ];

  useEffect(() => {
    if (isOpen) {
      setLanguageFilter([]);
      setCurrentPage(1);
      setSort(Sort.NEWEST_FIRST);
    }
  }, [isOpen]);

  const handlePrevious = () => {
    setCurrentPage((prevPage) => {
      const newPage = Math.max(prevPage - 1, 1);
      setSize(newPage);
      return newPage;
    });
  };

  const handleNext = () => {
    setCurrentPage((prevPage) => {
      const newPage = prevPage + 1;
      setSize(newPage);
      return newPage;
    });
  };

  // Reset to page 1 when filter or sorting changes and refetch the data
  useEffect(() => {
    setCurrentPage(1);
    setSize(1);
    mutate();
  }, [languageFilter, sort, mutate, setSize]);

  return (
    <>
      <Dialog.Root
        placement="center"
        modal={true}
        size="lg"
        onOpenChange={(details) => setIsOpen(details.open)}
      >
        <Dialog.Trigger asChild>
          <Button
            variant="ghost"
            size="xs"
            color="gray.500"
            fontFamily="MonoSpace"
          >
            <Flex flexDir="column" gap="1" m="2" mt="2">
              <Text fontFamily="MonoSpace" color="gray.500" fontSize="small">
                Repos
              </Text>
              <Text
                mx="auto"
                fontFamily="MonoSpace"
                fontWeight="bold"
                color="black"
              >
                {user.public_repos}
              </Text>
            </Flex>
          </Button>
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header paddingBottom="2">
                <Flex flexDir="column" width="100%">
                  <Dialog.Title>Repos ({user.public_repos})</Dialog.Title>

                  <Flex
                    direction={{ base: "column", md: "row" }}
                    justifyContent="space-between"
                    gap="4"
                    pt="4"
                  >
                    <Flex flexDir="column" gap="2">
                      <Box width={{ base: "100%", md: "200px" }}>
                        <Select
                          isMulti
                          name="Languages"
                          className="basic-multi-select"
                          classNamePrefix="select"
                          options={allLanguageOptions}
                          value={allLanguageOptions.filter((opt) =>
                            languageFilter.includes(opt.value)
                          )}
                          onChange={(
                            selectedOptions: { value: string; label: string }[]
                          ) => {
                            setLanguageFilter(
                              selectedOptions.map(
                                (option: { value: string }) => option.value
                              )
                            );
                          }}
                        />
                      </Box>
                    </Flex>
                    <Flex flexDir="row" gap="2" alignItems="center">
                      <Text fontSize="small" fontWeight="bold" width="60px">
                        Sort by
                      </Text>
                      <Box width={{ base: "100%", md: "130px" }}>
                        <Select
                          name="Sort"
                          className="basic-select"
                          classNamePrefix="select"
                          options={sortOptions}
                          value={sortOptions.filter(
                            (option) => option.value === sort
                          )}
                          onChange={(selected: {
                            value: string;
                            label: string;
                          }) => {
                            setSort(selected.value);
                          }}
                        />
                      </Box>
                    </Flex>
                  </Flex>
                </Flex>
              </Dialog.Header>
              <Dialog.Body>
                <Center my="4">
                  {isLoading && (
                    <Flex gap="2" alignItems="center">
                      <Spinner size="sm" />
                      <p>Loading...</p>
                    </Flex>
                  )}
                </Center>
                <Flex width="100%">
                  {repos?.length > 0 ? (
                    <Flex gap="4" flexWrap="wrap">
                      {repos.map((repo) => (
                        <Box
                          key={repo.id}
                          width={{ base: "100%", md: "195px" }}
                          height="180px"
                        >
                          <RepoCard repo={repo} />
                        </Box>
                      ))}
                    </Flex>
                  ) : (
                    <Flex m="auto">
                      {!isLoading && !canLoadMore && !isLoadingMore && (
                        <Text>No repos found</Text>
                      )}
                    </Flex>
                  )}
                </Flex>
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  onClick={handlePrevious}
                  disabled={!(currentPage > 1)}
                  variant="ghost"
                >
                  <CaretLeft size={32} />
                </Button>
                {repos.length > 0 && <Text>{currentPage}</Text>}
                <Button
                  disabled={!canLoadMore}
                  onClick={handleNext}
                  variant="ghost"
                >
                  <CaretRight size={32} />
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};
