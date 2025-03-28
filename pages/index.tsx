import { ColorModeButton } from "@/components/ui/color-mode";
import UserCard from "@/components/UserCard";
import GitHubUser from "@/models/GitHubUser";
import { Input, Flex, Box, Button, Text, Center } from "@chakra-ui/react";
import { MagnifyingGlass, User } from "@phosphor-icons/react";
import { useState } from "react";

// TODO: define global font families
// TODO: add loading states
// TODO: fix dark theme mode

const userTest: GitHubUser = {
  login: "katjakay",
  id: 118436971,
  node_id: "U_kgDOBw80aw",
  avatar_url: "https://avatars.githubusercontent.com/u/118436971?v=4",
  gravatar_id: "",
  url: "https://api.github.com/users/katjakay",
  html_url: "https://github.com/katjakay",
  followers_url: "https://api.github.com/users/katjakay/followers",
  following_url: "https://api.github.com/users/katjakay/following{/other_user}",
  gists_url: "https://api.github.com/users/katjakay/gists{/gist_id}",
  starred_url: "https://api.github.com/users/katjakay/starred{/owner}{/repo}",
  subscriptions_url: "https://api.github.com/users/katjakay/subscriptions",
  organizations_url: "https://api.github.com/users/katjakay/orgs",
  repos_url: "https://api.github.com/users/katjakay/repos",
  events_url: "https://api.github.com/users/katjakay/events{/privacy}",
  received_events_url: "https://api.github.com/users/katjakay/received_events",
  type: "User",
  user_view_type: "public",
  site_admin: false,
  name: "Katja Kay",
  company: null,
  blog: "",
  location: "Vienna, Austria ",
  email: null,
  hireable: null,
  bio: "👩🏻‍💻 Full-Stack Developer with Graphic Design background 👁",
  twitter_username: "Katjakay",
  public_repos: 29,
  public_gists: 0,
  followers: 2,
  following: 13,
  created_at: new Date("2022-11-17T09:46:01Z"),
  updated_at: new Date("2025-03-19T12:54:33Z"),
};

const Home = () => {
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [apiError, setApiError] = useState(false);

  // Fetch user data from Github API on submit
  const onSubmit = () => {
    fetch(`https://api.github.com/users/${search}`)
      .then(async (res) => {
        if (res.status === 403) {
          setApiError(true);
          return Promise.reject("API limit reached");
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

          {/* API error message */}
          {apiError && (
            <Text color="red.500" fontSize="small" fontFamily="MonoSpace">
              API limit reached, please try again later
            </Text>
          )}

          {/* User Card */}
          {user && !apiError && <UserCard user={user} />}
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
