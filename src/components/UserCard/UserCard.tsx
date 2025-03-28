import { Box, Button, Flex, Tabs, Text } from "@chakra-ui/react";

import { LinkSimple, MapPin } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import formatDate from "../../../utils/formatDate";
import GitHubUser from "@/models/GitHubUser";

// TODO Add pagination and load more button to repos
// TODO: repos should be closed when user changes, fix repos open
// TODO: Filter repos by language.
// TODO: Sort repos by stars, last updated, etc.
// TODO: Dark mode toggle.
// TODO: Debounced input.
// TODO: Cache previous searches in localStorage or memory.
// TODO: use SWR infinite loading and pagination for repos.

const BATCH_SIZE = 4;

interface UserCardProps {
  user: GitHubUser;
}
export const UserCard = ({ user }: UserCardProps) => {
  const [reposOpen, setReposOpen] = useState(false);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Allow load more repos
  const buildReposUrl = (username: string, page: number) => {
    const url = new URL(`/users/${username}/repos`, "https://api.github.com");
    url.searchParams.append("page", page.toString());
    url.searchParams.append("per_page", BATCH_SIZE.toString());
    return url.toString();
  };

  // Fetch repos from Github API
  useEffect(() => {
    if (!user) return;

    // setLoading(true);
    // const url = buildReposUrl(user.login, page);

    fetch(
      `https://api.github.com/users/${user.login}/repos?offset=0&limit=${BATCH_SIZE}`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("repos: ", data);
        setRepos(data);
      })
      .catch((err) => {
        console.error("Error fetching repos: ", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, page]);

  return (
    <Box
      background="gray.100"
      borderRadius="md"
      boxShadow="sm"
      p="4"
      maxWidth="90"
    >
      {/* Avatar, Name, Username, Joined Date */}
      <Flex alignItems="flex-start" gap="4">
        <Box mx="2">
          <Image
            src={user.avatar_url}
            alt={user.name}
            width={40}
            height={40}
            style={{
              borderRadius: "50%",
            }}
          />
        </Box>
        <Flex flexDir="column">
          <Text fontFamily="MonoSpace" fontWeight="bold">
            {user.name}
          </Text>
          <Text color="blue.400" fontSize="small">
            {user.login}
          </Text>
          <Text fontFamily="MonoSpace" color="gray.500" fontSize="small">
            Joined {formatDate(user.created_at)}
          </Text>
        </Flex>
      </Flex>

      {/* Location and Personal Website URL */}
      <Flex flexDir="column" marginLeft="20">
        {user.location !== null && (
          <Flex mt="4" alignItems="center" gap="2">
            <MapPin size={12} weight="fill" color="#71717a" />
            <Text fontFamily="MonoSpace" fontSize="small" color="gray.500">
              {user.location}
            </Text>
          </Flex>
        )}
        {user.blog !== null && user.blog !== "" && user.blog !== undefined && (
          <Link href={user.blog}>
            <Flex mt="4" alignItems="center" gap="2">
              <LinkSimple size={12} color="#71717a" />
              <Text fontFamily="MonoSpace" fontSize="small" color="gray.500">
                {user.blog}
              </Text>
            </Flex>
          </Link>
        )}
      </Flex>
    </Box>
  );
};
