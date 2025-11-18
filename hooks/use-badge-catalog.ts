import { useCallback, useEffect, useState } from "react";

import type { AchievementDefinition } from "@/services/achievement-types";
import { fetchAllBadges } from "@/services/achievement-client";

type BadgeCatalogMap = Record<string, AchievementDefinition>;

interface UseBadgeCatalogResult {
  resolveBadge: (identifier?: string | null) => AchievementDefinition | null;
  badges: AchievementDefinition[];
  isReady: boolean;
}

export const useBadgeCatalog = (
  getToken: () => Promise<string | null>
): UseBadgeCatalogResult => {
  const [catalogMap, setCatalogMap] = useState<BadgeCatalogMap>({});
  const [badges, setBadges] = useState<AchievementDefinition[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchAllBadges(getToken)
      .then((fetchedBadges) => {
        if (cancelled) return;
        const mapped = fetchedBadges.reduce<BadgeCatalogMap>((acc, badge) => {
          acc[badge.id.toLowerCase()] = badge;
          acc[badge.code.toLowerCase()] = badge;
          return acc;
        }, {});
        setCatalogMap(mapped);
        setBadges(fetchedBadges);
      })
      .catch(() => {
        if (!cancelled) {
          setCatalogMap({});
          setBadges([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [getToken]);

  const resolveBadge = useCallback(
    (identifier?: string | null) => {
      if (!identifier) return null;
      return catalogMap[identifier.toLowerCase()] ?? null;
    },
    [catalogMap]
  );

  return { resolveBadge, badges, isReady };
};
