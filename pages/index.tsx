import React from "react";
import UserCard from "@/components/UserCard";
import useLocaLStorage from "../hooks/useLocalStorage";
import {
  Input,
  Flex,
  Box,
  Button,
  Text,
  Tag,
  IconButton,
  useToken,
} from "@chakra-ui/react";
import { CaretUp, MagnifyingGlass, Trash } from "@phosphor-icons/react";
import { useState } from "react";
import { debounce } from "lodash";
import GitHubUser from "@/models/GitHubUser";

const Home = () => {
  const [search, setSearch] = useState<string>("");
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [apiError, setApiError] = useState<boolean>(false);
  const [userNotFound, setUserNotFound] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [gray600] = useToken("colors", ["gray.600"]);

  // Allows user close the search history
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const debouncedSearch = debounce((value: string) => {
    setSearch(value);
    onSubmit(value);
  }, 300);

  const {
    values: valuesFromStorage,
    setItem,
    removeItem,
    clearStorage,
  } = useLocaLStorage();

  // Fetch user data from Github API on submit
  const onSubmit = (searchValue = search) => {
    if (!searchValue.trim()) return;

    setIsLoading(true);

    fetch(`https://api.github.com/users/${searchValue}`, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    })
      .then(async (res) => {
        if (res.status === 403) {
          setApiError(true);
          setUser(null);
          setItem(searchValue);
          return Promise.reject("API limit reached");
        }
        if (res.status === 404) {
          setUserNotFound(true);
          setUser(null);
          setItem(searchValue);
          return Promise.reject("User not found");
        }
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setItem(search);
      })
      .catch((err) => {
        console.error("Error fetching user: ", err);
      })
      .finally(() => {
        setSearch("");
        setIsLoading(false);
      });
  };

  return (
    <Box height="vh" background="gray.100">
      <Flex flexDir="column" alignItems="center" height="100%">
        <Box
          my="auto"
          width={{ base: "full", md: "420px" }}
          px={{ base: "6", md: "0" }}
        >
          <h1 style={{ fontFamily: "MonoSpace" }}>devfinder</h1>
          <Flex
            alignItems="center"
            gap="3"
            background="white"
            px="4"
            py="2"
            mt="4"
            mb="2"
            borderRadius="md"
            boxShadow="sm"
          >
            <MagnifyingGlass size={14} />
            <Input
              placeholder="Search Github username"
              size="sm"
              htmlSize={26}
              variant="flushed"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  debouncedSearch(search);
                }
              }}
            />
            <Button size="2xs" onClick={() => onSubmit()} disabled={isLoading}>
              SEARCH
            </Button>
          </Flex>
          {!user && (
            <>
              {apiError && (
                <Text color="red.500" fontSize="small" fontFamily="MonoSpace">
                  API limit reached, please try again later
                </Text>
              )}
              {userNotFound && (
                <Text color="red.500" fontSize="small" fontFamily="MonoSpace">
                  User not found
                </Text>
              )}
            </>
          )}

          {/* The history of last searches  */}
          <Flex width="90" my="4" gap="1" flexWrap="wrap">
            {valuesFromStorage.length > 0 &&
              valuesFromStorage
                .slice(
                  valuesFromStorage.length > 8 && !isExpanded
                    ? valuesFromStorage.length - 6
                    : 0,
                  valuesFromStorage.length
                )
                .reverse()
                .map((value, index) => (
                  <Flex key={index} alignItems="center">
                    <Tag.Root
                      key={index}
                      py="4px"
                      px="6px"
                      colorPalette="gray"
                      color="gray.500"
                      style={{ cursor: "pointer" }}
                      fontFamily={"MonoSpace"}
                      _hover={{ bg: "blue.100", color: "blue.900" }}
                    >
                      <Tag.Label>
                        <span
                          style={{ cursor: "pointer" }}
                          onClick={() => setSearch(value)}
                        >
                          {value}
                        </span>
                      </Tag.Label>
                      <Tag.EndElement>
                        <Tag.CloseTrigger onClick={() => removeItem(index)} />
                      </Tag.EndElement>
                    </Tag.Root>
                  </Flex>
                ))}

            {/* If the history is not expanded, show button to collapse it */}
            {valuesFromStorage.length > 8 && (
              <Tag.Root
                py="4px"
                px="6px"
                colorPalette="gray"
                color="gray.400"
                style={{ cursor: "pointer" }}
                fontFamily={"MonoSpace"}
                _hover={{ bg: "green.100" }}
              >
                <Tag.Label>
                  <span style={{ cursor: "pointer" }} onClick={toggleExpand}>
                    {isExpanded ? (
                      <CaretUp size={12} color="#a1a1aa" weight="fill" />
                    ) : (
                      "..."
                    )}
                  </span>
                </Tag.Label>
              </Tag.Root>
            )}
            {valuesFromStorage.length > 0 && (
              <IconButton
                size="2xs"
                variant="ghost"
                aria-label="Clear search history"
                onClick={() => clearStorage()}
                _hover={{ bg: "red.200" }}
              >
                <Trash size={5} color={gray600} />
              </IconButton>
            )}
          </Flex>
          {/* Display user card if there are no API errors */}
          {user && <UserCard user={user} />}
        </Box>
      </Flex>
    </Box>
  );
};
export default Home;
