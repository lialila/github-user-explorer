import { ColorModeButton } from "@/components/ui/color-mode";
import { Input, Flex, Box, Button } from "@chakra-ui/react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { useState } from "react";

const Home = () => {
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const onSubmit = () => {
    fetch(`https://api.github.com/users/${search}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
      })
      .catch((err) => {
        console.error(err);
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
              htmlSize={36}
              width="auto"
              variant="flushed"
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={onSubmit}
            />
            <Button size="2xs" onClick={onSubmit}>
              SEARCH
            </Button>
          </Flex>
          {/* TODO: implement UserCard */}
          {/* {user && <UserCard user={user} />} */}
          {user && user.name}
        </Box>
      </Flex>
    </Box>
  );
};
export default Home;
