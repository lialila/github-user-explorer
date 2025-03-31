import UserCard from "@/components/UserCard";
import useLocaLStorage from "@/models/hooks/useLocalStorage";
import {
  Input,
  Flex,
  Box,
  Button,
  Text,
  Tag,
  IconButton,
} from "@chakra-ui/react";
import { MagnifyingGlass, Trash } from "@phosphor-icons/react";
import { useState } from "react";
import { debounce } from "lodash";

// TODO: define global font families
// TODO: add loading states - partly done, check again
// TODO: ? REPO CARD: convert into grid
// TODO:  REPO CARD: add colors for the languages
// TODO: add readme
// TODO: add component for modal in RepoModal
// TODO: add tests
// TODO: user card repos-fololowers and following convert to grid

const Home = () => {
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [apiError, setApiError] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = debounce((value) => {
    setSearch(value);
    onSubmit();
  }, 300);

  const {
    values: valuesFromStorage,
    setItem,
    removeItem,
    clearStorage,
  } = useLocaLStorage();

  // Fetch user data from Github API on submit
  const onSubmit = () => {
    if (!search.trim()) return;

    setIsLoading(true);

    fetch(`https://api.github.com/users/${search}`, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    })
      .then(async (res) => {
        if (res.status === 403) {
          setApiError(true);
          setUser(null);
          setItem(search);
          return Promise.reject("API limit reached");
        }
        if (res.status === 404) {
          setUserNotFound(true);
          setUser(null);
          setItem(search);
          return Promise.reject("User not found");
        }
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setItem(search);
      })
      .catch(async (err) => {
        console.error("Error fetching user: ", err);
      })
      .finally(() => {
        setSearch("");
        setIsLoading(false);
      });
  };

  return (
    <Box height="vh" background="gray.200">
      <Flex flexDir="column" alignItems="center" height="80%">
        <Box my="auto" width="420px">
          <h1 style={{ fontFamily: "MonoSpace" }}>devfinder</h1>

          {/* Input field */}
          <Flex
            alignItems="center"
            gap="3"
            background="gray.100"
            px="4"
            py="2"
            my="4"
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
                  debouncedSearch();
                }
              }}
            />
            <Button size="2xs" onClick={onSubmit} disabled={isLoading}>
              SEARCH
            </Button>
          </Flex>
          <Flex width="90" mb="4" gap="1" flexWrap="wrap">
            {valuesFromStorage.length > 0 &&
              valuesFromStorage.map((value, index) => (
                <Flex key={index} alignItems="center">
                  <Tag.Root
                    key={index}
                    py="4px"
                    px="6px"
                    colorPalette="gray"
                    color="gray.400"
                    style={{ cursor: "pointer" }}
                    fontFamily={"MonoSpace"}
                    fontSize="2x-small"
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
                      <Tag.CloseTrigger onClick={() => removeItem(value)} />
                    </Tag.EndElement>
                  </Tag.Root>
                </Flex>
              ))}
            {valuesFromStorage.length > 0 && (
              <IconButton
                size="xs"
                variant="ghost"
                aria-label="Clear search history"
                onClick={() => clearStorage()}
                _hover={{ bg: "red.200" }}
              >
                <Trash size={5} color="var(--chakra-colors-gray-600)" />
              </IconButton>
            )}
          </Flex>
          {/* Display user card if there are no API errors */}
          {user ? (
            <UserCard user={user} />
          ) : (
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
        </Box>
      </Flex>
    </Box>
  );
};
export default Home;
