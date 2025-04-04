import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { LinkSimple, MapPin } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import formatDate from "../../../utils/formatDate";
import GitHubUser from "@/models/GitHubUser";
import ReposModal from "../ReposModal";

interface UserCardProps {
  user: GitHubUser;
}

export const UserCard = ({ user }: UserCardProps) => (
  <Box background="white" borderRadius="md" boxShadow="sm" p="6" maxWidth="90">
    {/* Avatar, Name, Username, Joined Date */}
    <Flex alignItems="flex-start" gap="4">
      <Box mx="3">
        <Image
          src={user.avatar_url}
          alt={user.login}
          width={40}
          height={40}
          style={{
            borderRadius: "50%",
          }}
        />
      </Box>
      <Flex flexDir="column">
        <Link href={user.html_url}>
          <Text fontFamily="MonoSpace" fontWeight="bold">
            {user.name}
          </Text>
        </Link>
        <Text color="blue.400" fontSize="small">
          {user.login}
        </Text>
        <Text fontFamily="MonoSpace" color="gray.500" fontSize="small">
          Joined {formatDate(user.created_at)}
        </Text>
      </Flex>
    </Flex>

    {/* Repos, Followers and Following */}
    <Flex
      justifyContent="center"
      gap={{ base: "2", md: "8" }}
      mt="6"
      background="blue.100"
      px="8"
      borderRadius="xl"
    >
      <Flex flexDir="column" m="2" gap="2">
        <Flex alignItems="baseline" gap="1px">
          <Flex flexDir="column" gap="1" mt="1">
            <Text fontFamily="MonoSpace" color="gray.500" fontSize="small">
              Repos
            </Text>
            <Text mx="auto" fontFamily="MonoSpace" fontWeight="bold">
              {user.public_repos}
            </Text>
          </Flex>
          {user.public_repos > 0 && <ReposModal user={user} />}
        </Flex>
      </Flex>
      <Flex flexDir="column" gap="1" mt="3">
        <Text fontFamily="MonoSpace" color="gray.500" fontSize="small">
          Followers
        </Text>
        <Text mx="auto" fontFamily="MonoSpace" fontWeight="bold">
          {user.followers}
        </Text>
      </Flex>
      <Flex flexDir="column" gap="1" m="2" mt="3">
        <Text fontFamily="MonoSpace" color="gray.500" fontSize="small">
          Following
        </Text>
        <Text mx="auto" fontFamily="MonoSpace" fontWeight="bold">
          {user.following}
        </Text>
      </Flex>
    </Flex>

    {/* Location and Personal Website URL */}
    <Flex flexDir="column" marginLeft="4" gap="2">
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
          <Flex alignItems="center" gap="2">
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
