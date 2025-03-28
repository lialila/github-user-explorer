import {
  Dialog,
  Button,
  Box,
  Flex,
  Text,
  Portal,
  CloseButton,
  Separator,
} from "@chakra-ui/react";
import formatDate from "../../../utils/formatDate";
import { useCallback, useEffect, useRef, useState } from "react";
import { SWRInfiniteKeyLoader } from "swr/infinite";
import useRepos from "@/models/hooks/useRepos";

const enum Sort {
  NEWEST_FIRST = "Newest First",
  OLDEST_FIRST = "Oldest First",
  MOST_STARS = "Stars",
}
import Select from "react-select";

const BATCH_SIZE = 6;
// TODO: sort by stars, last updated, etc.
// TODO: nice to have: the modal should be scrollable
// TODO: modal should open in the center of the screen

export const ReposModal = ({ user }) => {
  const [allLanguageOptions, setAllLanguageOptions] = useState([]);
  const [languageFilter, setLanguageFilter] = useState([] as string[]);
  const [sort, setSort] = useState([Sort.NEWEST_FIRST] as string[]);
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const getKey: SWRInfiniteKeyLoader = (index) => {
    const url = new URL(`https://api.github.com/users/${user.login}/repos`);

    if (languageFilter.length > 0) {
      url.searchParams.append("per_page", "100");
      url.searchParams.append("page", "1");
    } else {
      url.searchParams.append("per_page", BATCH_SIZE.toString());
      url.searchParams.append("page", (index + 1).toString());
    }

    if (sort[0] === Sort.OLDEST_FIRST) {
      url.searchParams.append("sort", "updated");
      url.searchParams.append("direction", "asc");
    } else if (sort[0] === Sort.MOST_STARS) {
      url.searchParams.append("sort", "stars");
      url.searchParams.append("direction", "desc");
    } else {
      url.searchParams.append("sort", "updated");
      url.searchParams.append("direction", "desc");
    }

    return url.toString();
  };

  const {
    data: reposData = [],
    isLoading,
    loadMore,
    canLoadMore,
    refetch: mutate,
    setSize,
  } = useRepos({ getKey, batchSize: BATCH_SIZE });

  const repos: Array<{ name?: string; [key: string]: any }> = reposData
    ? reposData.flat()
    : [];

  // Reset pagination to only fetch first page
  useEffect(() => {
    if (isOpen) {
      setSize(1);
    }
  }, [isOpen, setSize]);

  // Extract all languages
  const fetchAllLanguages = useCallback(async () => {
    try {
      const response = await fetch(
        `https://api.github.com/users/${user.login}/repos`
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();

      const allLanguages = new Set<string>();
      data.forEach((repo: any) => {
        if (repo?.language !== null) {
          allLanguages.add(repo.language);
        }
      });

      setAllLanguageOptions(
        Array.from(allLanguages).map((value) => ({ value, label: value }))
      );
    } catch (err) {
      console.error("GitHub API fetch error:", err);
    }
  }, [repos]);

  // Fetch all languages when component mounts
  useEffect(() => {
    fetchAllLanguages();
  }, [isOpen]);

  const sortOptions = [
    { value: Sort.NEWEST_FIRST, label: "Newest" },
    { value: Sort.OLDEST_FIRST, label: "Oldest" },
    { value: Sort.MOST_STARS, label: "Most Stars" },
  ];

  const filteredRepos = repos.filter((repo) => {
    if (languageFilter.length) {
      return languageFilter.includes(repo.language);
    }
    return repos;
  });

  useEffect(() => {
    isOpen && setLanguageFilter([]);
  }, [isOpen]);

  return (
    <>
      <Dialog.Root
        modal={true}
        size="md"
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
            <Dialog.Content ref={contentRef}>
              <Dialog.Header>
                <Dialog.Title>Repos ({user.public_repos})</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Separator />

                <Flex flexDir="column" gap="1" py="6">
                  <Text fontSize="small" fontWeight="bold">
                    Filter by language
                  </Text>
                  <Box width="250px">
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
                <Flex>
                  {repos?.length > 0 ? (
                    <Flex gap="4" flexWrap="wrap">
                      {filteredRepos.map((repo) => (
                        <Box p="4" background="blue.100" borderRadius="md">
                          <Flex flexDir="column" gap="2">
                            <Text fontSize="small" fontWeight="bold">
                              {repo.name}
                            </Text>
                            <Flex gap="4">
                              <Text fontSize="x-small">
                                Updated on {formatDate(repo.updated_at)}
                              </Text>
                              <Text fontSize="x-small">{repo.language}</Text>
                            </Flex>
                          </Flex>
                        </Box>
                      ))}
                    </Flex>
                  ) : (
                    <></>
                  )}
                  {isLoading && <p>Loading...</p>}
                </Flex>
              </Dialog.Body>
              <Dialog.Footer>
                {canLoadMore && (
                  <Button onClick={() => loadMore()}>Show more</Button>
                )}
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
