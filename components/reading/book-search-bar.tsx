"use client";

import { BookOpen } from "lucide-react";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { SearchBar } from "@/components/search/search-bar";
import { useReadingSearch } from "@/hooks/use-reading-search";

export const BookSearchBar = () => {
  const { query, setQuery, isSearching, results, error } =
    useReadingSearch();

  return (
    <SearchBar
      query={query}
      onQueryChange={setQuery}
      isSearching={isSearching}
      results={results}
      error={error}
      placeholder="읽은 책이나 감상을 검색하세요"
      renderResults={(items) => (
        <ItemGroup className="space-y-1">
          {items.map((result) => (
            <Item
              key={result.id}
              className="gap-4 rounded-2xl bg-background/80 p-4"
            >
              <ItemMedia variant={result.thumbnail ? "image" : "icon"}>
                {result.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={result.thumbnail}
                    alt={`${result.title} 표지`}
                    className="size-full object-cover"
                  />
                ) : (
                  <BookOpen className="size-4 text-muted-foreground" />
                )}
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="text-base text-foreground">
                  {result.title}
                </ItemTitle>
                <ItemDescription>
                  {result.authors.join(", ") || "저자 정보 없음"}
                  {result.publisher ? ` · ${result.publisher}` : ""}
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      )}
    />
  );
};
