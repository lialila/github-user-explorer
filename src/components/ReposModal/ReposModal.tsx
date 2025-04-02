import React from "react";
import {
  Dialog,
  Box,
  Flex,
  Text,
  Portal,
  CloseButton,
  Center,
  Spinner,
  IconButton,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import Select from "react-select";
import RepoCard from "../RepoCard";
import GitHubRepo from "@/models/GitHubRepo";
import { CaretLeft, CaretRight, ShootingStar } from "@phosphor-icons/react";
import GitHubUser from "@/models/GitHubUser";

const enum Sort {
  NEWEST_FIRST = "Last Updated",
  OLDEST_FIRST = "Oldest",
  MOST_STARS = "Stars",
  NAME = "Name",
}

const BATCH_SIZE = 4;

interface ReposModalProps {
  user: GitHubUser;
}

export const ReposModal = ({ user }: ReposModalProps) => {
  const [allRepos, setAllRepos] = useState<GitHubRepo[]>([] as GitHubRepo[]);
  const [allLanguageOptions, setAllLanguageOptions] = useState([]);
  const [languageFilter, setLanguageFilter] = useState([] as string[]);
  const [sort, setSort] = useState(Sort.NEWEST_FIRST as string);
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all repos
  const fetchAllRepos = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let page = 1;
      let allRepos: GitHubRepo[] = [];
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(
          `https://api.github.com/users/${user.login}/repos?page=${page}&per_page=100`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }
        const repos = await response.json();
        if (repos.length === 0) {
          hasMore = false;
        } else {
          allRepos = allRepos.concat(repos);
          page++;
        }
      }

      setAllRepos(allRepos);

      // Fetch all languages
      const languageSet = new Set<string>();
      allRepos.forEach((repo) => {
        if (repo.language) languageSet.add(repo.language);
      });
      setAllLanguageOptions(
        Array.from(languageSet).map((value) => ({ value, label: value }))
      );
    } catch (err) {
      console.error("Error fetching repos:", err);
      setError(err.message || "Failed to load repositories.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter, sort, and paginate repos
  const filteredRepos: GitHubRepo[] = allRepos
    .filter(
      (repo) =>
        languageFilter.length === 0 || languageFilter.includes(repo.language)
    )
    .sort((a, b) => {
      const aDate = new Date(a.updated_at);
      const bDate = new Date(b.updated_at);
      if (sort === Sort.NEWEST_FIRST) return bDate.getTime() - aDate.getTime();
      if (sort === Sort.OLDEST_FIRST) return aDate.getTime() - bDate.getTime();
      if (sort === Sort.MOST_STARS)
        return b.stargazers_count - a.stargazers_count;
      if (sort === Sort.NAME) return a.name.localeCompare(b.name);
      return 0;
    });

  // Paginate repos
  const paginatedRepos = filteredRepos.slice(
    (currentPage - 1) * BATCH_SIZE,
    currentPage * BATCH_SIZE
  );

  const canLoadMore = filteredRepos.length > currentPage * BATCH_SIZE;
  const totalPages = Math.ceil(filteredRepos.length / BATCH_SIZE);

  // Load repos and reset filters when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAllRepos();
      setLanguageFilter([]);
      setCurrentPage(1);
      setSort(Sort.NEWEST_FIRST);
    }
  }, [isOpen, user.login]);

  // Handle next and previous page buttons
  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    if (canLoadMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const sortOptions = [
    { value: Sort.NEWEST_FIRST, label: "Last Updated" },
    { value: Sort.OLDEST_FIRST, label: "Oldest" },
    { value: Sort.MOST_STARS, label: "Stars" },
    { value: Sort.NAME, label: "Name" },
  ];

  return (
    <>
      <Dialog.Root
        scrollBehavior="inside"
        placement="center"
        modal={true}
        size={{ base: "xs", md: "lg" }}
        open={isOpen}
        onOpenChange={(details) => setIsOpen(details.open)}
      >
        <Dialog.Trigger asChild>
          <Box style={{ cursor: "pointer" }}>
            <ShootingStar size={16} color="orange" weight="fill" />
          </Box>
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header paddingBottom="2">
                <Flex flexDir="column" width="full" m="4">
                  <Dialog.Title>
                    <Text fontFamily="MonoSpace">
                      Repos ({user.public_repos})
                    </Text>
                  </Dialog.Title>

                  <Flex
                    direction={{ base: "column", md: "row" }}
                    justifyContent="flex-start"
                    gap="4"
                    pt="4"
                  >
                    <Flex flexDir="row" gap="4px" alignItems="center">
                      <Text
                        fontSize="small"
                        width={{ base: "80px", md: "50px" }}
                      >
                        Sort by:
                      </Text>
                      <Box width={{ base: "100%", md: "150px" }}>
                        <Select
                          name="Sort"
                          className="basic-select"
                          classNamePrefix="select"
                          options={sortOptions}
                          isDisabled={isLoading || paginatedRepos.length === 0}
                          value={sortOptions.filter(
                            (option) => option.value === sort
                          )}
                          onChange={(selected: {
                            value: string;
                            label: string;
                          }) => {
                            setSort(selected.value);
                            setCurrentPage(1);
                          }}
                          styles={{
                            control: (provided) => ({
                              ...provided,
                              borderRadius: "2px",
                              fontSize: "small",
                              borderColor: "black",
                            }),
                            menu: (provided) => ({
                              ...provided,
                              borderColor: "black",
                              fontSize: "small",
                            }),
                          }}
                        />
                      </Box>
                    </Flex>
                    <Flex flexDir="row" gap="4px" alignItems="center">
                      <Text fontSize="small" width="80px">
                        Filter by:
                      </Text>
                      <Box width={{ base: "full", md: "none" }}>
                        <Select
                          isMulti
                          placeholder="Language"
                          styles={{
                            control: (provided) => ({
                              ...provided,
                              borderColor: "black",
                              borderRadius: "2px",
                              fontSize: "small",
                            }),
                            menu: (provided) => ({
                              ...provided,
                              borderColor: "black",
                              fontSize: "small",
                            }),
                            placeholder: (provided) => ({
                              ...provided,
                              color: "black",
                            }),
                          }}
                          name="Languages"
                          className="basic-multi-select"
                          classNamePrefix="select"
                          options={allLanguageOptions}
                          isDisabled={isLoading}
                          value={allLanguageOptions.filter((lang) =>
                            languageFilter.includes(lang.value)
                          )}
                          onChange={(
                            selectedOptions: { value: string; label: string }[]
                          ) => {
                            setLanguageFilter(
                              selectedOptions.map(
                                (option: { value: string }) => option.value
                              )
                            );
                            setCurrentPage(1);
                          }}
                        />
                      </Box>
                    </Flex>
                  </Flex>
                </Flex>
              </Dialog.Header>
              <Dialog.Body paddingBottom="2">
                <Flex width="full">
                  {!isLoading && paginatedRepos?.length > 0 ? (
                    <Flex flexDir="column" width="full">
                      {paginatedRepos.map((repo, index) => (
                        <Box
                          key={repo.id}
                          width="full"
                          borderTop={index === 0 ? "1px solid black" : "none"}
                        >
                          <RepoCard repo={repo} />
                        </Box>
                      ))}
                    </Flex>
                  ) : (
                    <Flex mx="auto">
                      {!isLoading && <Text>No repos found</Text>}
                    </Flex>
                  )}
                </Flex>
                <Center my="4">
                  {error && (
                    <Text
                      color="red.500"
                      fontSize="small"
                      fontFamily="MonoSpace"
                    >
                      {error}
                    </Text>
                  )}
                  {isLoading && (
                    <Flex gap="2" alignItems="center">
                      <Spinner size="sm" />
                      <p>Loading...</p>
                    </Flex>
                  )}
                </Center>
              </Dialog.Body>
              <Dialog.Footer paddingTop="1">
                <IconButton
                  onClick={handlePrevious}
                  disabled={!(currentPage > 1) || isLoading}
                  variant="ghost"
                >
                  <CaretLeft size={32} />
                </IconButton>
                {paginatedRepos.length > 0 && (
                  <Text fontFamily="MonoSpace" fontSize="small">
                    {currentPage} / {totalPages}
                  </Text>
                )}
                <IconButton
                  disabled={!canLoadMore || isLoading}
                  onClick={handleNext}
                  variant="ghost"
                >
                  <CaretRight size={32} />
                </IconButton>
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
