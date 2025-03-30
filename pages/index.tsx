import { ColorModeButton } from "@/components/ui/color-mode";
import UserCard from "@/components/UserCard";
import GitHubUser from "@/models/GitHubUser";
import useRepos from "@/models/hooks/useRepos";
import { Input, Flex, Box, Button, Text, Center } from "@chakra-ui/react";
import { MagnifyingGlass, User } from "@phosphor-icons/react";
import { useState } from "react";

// TODO: define global font families
// TODO: add loading states - partly done, check again
// TODO: fix dark theme mode
// TODO: REPO CARD: convert into grid
// TODO:  REPO CARD: add colors for the languages
// TODO: Dark mode toggle.
// TODO: Debounced input.
// TODO: Cache previous searches in localStorage or memory.

const Home = () => {
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [apiError, setApiError] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);

  // Fetch user data from Github API on submit
  const onSubmit = () => {
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
          return Promise.reject("API limit reached");
        }
        if (res.status === 404) {
          setUserNotFound(true);
          setUser(null);
          return Promise.reject("User not found");
        }
        return res.json();
      })
      .then((data) => {
        setUser(data);
      })
      .catch(async (err) => {
        console.error("Error fetching user: ", err);
      });
  };

  return (
    <Box height="vh" background="gray.200">
      <Box p="6">
        <ColorModeButton />
      </Box>

      <Flex flexDir="column" alignItems="center" height="60%">
        <Box my="auto" maxWidth="90">
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
              //  width="auto"
              variant="flushed"
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            />
            <Button size="2xs" onClick={onSubmit}>
              SEARCH
            </Button>
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

{
  /*for testing purposes*/
}
{
  /* <Box mt="8">
            <UserCard user={userTest} />
          </Box>  */
}
