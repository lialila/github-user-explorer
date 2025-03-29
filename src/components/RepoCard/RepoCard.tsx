import { Box, Flex, Text } from "@chakra-ui/react";
import Link from "next/link";
import GitHubRepo from "@/models/GitHubRepo";
import { Star } from "@phosphor-icons/react";
import cropText from "../../../utils/cropText";

interface ReposCardProps {
  repo: GitHubRepo;
}

export const RepoCard = ({ repo }: ReposCardProps) => {
  return (
    <Box p="4" background="blue.100" borderRadius="md" h="100%" w="100%">
      <Flex flexDir="column" gap="2">
        <Flex justifyContent="space-between" alignItems="baseline">
          <Link href={repo.html_url}>
            <Box maxWidth="120px">
              <Text fontSize="small" fontWeight="bold" wordBreak="break-word">
                {cropText(repo.name, 25)}
              </Text>
            </Box>
          </Link>
          <Flex gap="2px" alignItems="center">
            <Star
              size={10}
              weight={repo.stargazers_count > 0 ? "fill" : "regular"}
            />
            <Text fontSize="x-small">{repo.stargazers_count}</Text>
          </Flex>
        </Flex>
        <Flex flexDir="column">
          <Text fontSize="x-small">{repo.language}</Text>
          <Text fontSize="x-small" lineHeight="12px">
            Updated on{" "}
            {repo.updated_at &&
              new Date(repo.updated_at).toLocaleDateString("de-DE", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
          </Text>
        </Flex>
        {repo.description && (
          <Text fontSize="x-small" lineHeight="12px">
            {cropText(repo.description, 80)}
          </Text>
        )}
      </Flex>
    </Box>
  );
};
