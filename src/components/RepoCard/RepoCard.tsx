import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import Link from "next/link";
import GitHubRepo from "@/models/GitHubRepo";
import { Star } from "@phosphor-icons/react";
import cropText from "../../../utils/cropText";

interface ReposCardProps {
  repo: GitHubRepo;
}

enum LanguageColors {
  JavaScript = "#f1e05a",
  TypeScript = "#2b7489",
  Python = "#3572A5",
  Java = "#b07219",
  Ruby = "#cc0000",
  PHP = "#4F5D95",
  Go = "#00ADD8",
  Swift = "#ffac45",
  Kotlin = "#A97BFF",
  Rust = "#dea584",
  HTML = "#e34c26",
  CSS = "#563d7c",
  SCSS = "#bf5fff",
  Shell = "#89e051",
  C = "#555555",
  ObjectiveC = "#438eff",
  R = "#198ce7",
  Scala = "#c22d40",
  Dart = "#00B4AB",
  MDX = "#f69d50",
  CoffeeScript = "#D29F80",
}

export const RepoCard = ({ repo }: ReposCardProps) => {
  return (
    <Box p={{ base: "3", md: "4" }} h="full" borderBottom="1px solid black">
      <Flex flexDir="column" gap="2">
        <Flex justifyContent="space-between" alignItems="baseline">
          <Link href={repo.html_url}>
            <Box>
              <Text
                fontSize="sm"
                fontWeight="bold"
                wordBreak="break-word"
                fontFamily="MonoSpace"
              >
                {repo.name}
              </Text>
            </Box>
          </Link>
          <Flex gap="3px" alignItems="center">
            <Star
              size={10}
              color="orange"
              weight={repo.stargazers_count > 0 ? "fill" : "regular"}
            />
            <Text fontSize="x-small">{repo.stargazers_count}</Text>
          </Flex>
        </Flex>
        <Flex flexDir="row" gap="4" alignItems="center">
          {repo.language && (
            <Flex gap="1" alignItems="center">
              <Box
                background={LanguageColors[repo.language] || "gray.300"}
                borderRadius="full"
                width="8px"
                height="8px"
              />
              <Text fontSize="x-small">{repo.language}</Text>
            </Flex>
          )}
          <Text fontSize="x-small" lineHeight="12px" color="blue.400">
            Updated on{" "}
            {repo.updated_at &&
              new Date(repo.updated_at).toLocaleDateString("en-EN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
          </Text>
        </Flex>
        {repo.description && (
          <Text fontSize="x-small" lineHeight="14px">
            About: {cropText(repo.description, 200)}
          </Text>
        )}
      </Flex>
    </Box>
  );
};
