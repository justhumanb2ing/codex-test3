import {
  fetchAchievementCatalog,
  fetchUserAchievements,
  getProfileAchievements,
} from "@/services/achievement-service";
import {
  triggerAchievementAction,
  subscribeToAchievementAwards,
} from "@/services/achievement-client";
import { createServerSupabaseClient } from "@/config/supabase";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

jest.mock("@/config/supabase", () => ({
  createServerSupabaseClient: jest.fn(),
}));

jest.mock("@/lib/supabase-browser", () => ({
  createBrowserSupabaseClient: jest.fn(),
}));

type SupabaseSelectChain = {
  select: jest.Mock;
  eq: jest.Mock;
  order: jest.Mock;
};

const mockedServerClient =
  createServerSupabaseClient as jest.MockedFunction<
    typeof createServerSupabaseClient
  >;
const mockedBrowserClient =
  createBrowserSupabaseClient as jest.MockedFunction<
    typeof createBrowserSupabaseClient
  >;

const buildSelectClient = (
  data: unknown,
  error: unknown = null
): { from: jest.Mock } => {
  const order = jest.fn().mockResolvedValue({ data, error });
  const eq = jest.fn(() => ({ order }));
  const select = jest.fn(() => ({ eq, order })) as SupabaseSelectChain;
  return {
    from: jest.fn(() => ({ select })),
  };
};

describe("achievement-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches achievement catalog and maps fields", async () => {
    const rows = [
      {
        id: "ach-1",
        code: "first-log",
        title: "첫 기록",
        description: "설명",
        rule: { event: "READING_ENTRY_CREATED", type: "count" },
        is_active: true,
        image_url: "https://example.com/first.png",
      },
    ];
    mockedServerClient.mockResolvedValueOnce(
      buildSelectClient(rows) as never
    );

    const result = await fetchAchievementCatalog();

    expect(result.success).toBe(true);
    expect(result.data?.[0]).toMatchObject({
      id: "ach-1",
      code: "first-log",
      isActive: true,
      rule: { event: "READING_ENTRY_CREATED", type: "count" },
    });
  });

  it("returns error when achievement catalog query fails", async () => {
    mockedServerClient.mockResolvedValueOnce(
      buildSelectClient(null, { message: "boom" }) as never
    );

    const result = await fetchAchievementCatalog();

    expect(result.success).toBe(false);
    expect(result.error).toBe("boom");
  });

  it("fetches user achievements", async () => {
    const rows = [
      {
        id: "ua-1",
        user_id: "user-1",
        achievement_id: "ach-1",
        awarded_at: "2024-01-01T00:00:00.000Z",
        source_event_id: null,
        context: null,
      },
    ];
    mockedServerClient.mockResolvedValueOnce(
      buildSelectClient(rows) as never
    );

    const result = await fetchUserAchievements("user-1");

    expect(result.success).toBe(true);
    expect(result.data?.[0]).toMatchObject({
      id: "ua-1",
      userId: "user-1",
    });
  });

  it("merges catalog with user achievements for profile view", async () => {
    const catalogRows = [
      {
        id: "ach-1",
        code: "first-log",
        title: "첫 기록",
        description: "설명",
        rule: null,
        is_active: true,
        image_url: "https://example.com/first.png",
      },
      {
        id: "ach-2",
        code: "weekly",
        title: "주간",
        description: "설명2",
        rule: null,
        is_active: true,
        image_url: null,
      },
    ];
    const userRows = [
      {
        id: "ua-1",
        user_id: "user-1",
        achievement_id: "ach-1",
        awarded_at: "2024-01-01T00:00:00.000Z",
        source_event_id: null,
        context: null,
      },
    ];

    mockedServerClient
      .mockResolvedValueOnce(buildSelectClient(catalogRows) as never)
      .mockResolvedValueOnce(buildSelectClient(userRows) as never);

    const result = await getProfileAchievements("user-1");

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: "ach-1",
      isUnlocked: true,
      imageUrl: "https://example.com/first.png",
    });
    expect(result[1]).toMatchObject({
      id: "ach-2",
      isUnlocked: false,
    });
  });

  it("triggers achievement action via RPC", async () => {
    const rpc = jest
      .fn()
      .mockResolvedValue({ data: [{ achievement_id: "ach-1", achievement_title: "첫 기록" }], error: null });
    mockedBrowserClient.mockReturnValue({
      rpc,
      channel: jest.fn(),
      removeChannel: jest.fn(),
    } as never);

    const result = await triggerAchievementAction({
      userId: "user-1",
      achievementId: "ach-1",
      event: "READING_ENTRY_CREATED",
      payload: { readingCount: 1 },
      getToken: () => Promise.resolve("token"),
    });

    expect(rpc).toHaveBeenCalledWith("grant_achievement_from_action", {
      p_achievement_id: "ach-1",
      p_event: "READING_ENTRY_CREATED",
      p_payload: { readingCount: 1 },
      p_user_id: "user-1",
    });
    expect(result.success).toBe(true);
    expect(result.awards?.[0]?.achievementId).toBe("ach-1");
  });

  it("returns error when RPC fails", async () => {
    const rpc = jest
      .fn()
      .mockResolvedValue({ data: null, error: { message: "denied" } });
    mockedBrowserClient.mockReturnValue({
      rpc,
      channel: jest.fn(),
      removeChannel: jest.fn(),
    } as never);

    const result = await triggerAchievementAction({
      userId: "user-1",
      achievementId: "ach-1",
      event: "READING_ENTRY_CREATED",
      getToken: () => Promise.resolve("token"),
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("denied");
  });

  it("subscribes to realtime channels and cleans up", () => {
    const handlers: Record<string, (payload: any) => void> = {};
    const channel = {
      on: jest.fn(
        (_event: string, config: { table: string; event: string }, cb: any) => {
          handlers[`${config.table}-${config.event}`] = cb;
          return channel;
        }
      ),
      subscribe: jest.fn(() => channel),
    };
    const removeChannel = jest.fn();

    mockedBrowserClient.mockReturnValue({
      channel: jest.fn(() => channel as never),
      removeChannel,
      rpc: jest.fn(),
    } as never);

    const onAwarded = jest.fn();
    const subscription = subscribeToAchievementAwards({
      userId: "user-1",
      getToken: () => Promise.resolve("token"),
      onAwarded,
    });

    handlers["user_achievements-INSERT"]({
      new: {
        id: "ua-1",
        user_id: "user-1",
        achievement_id: "ach-1",
        awarded_at: "2024-01-01T00:00:00.000Z",
        source_event_id: null,
        context: null,
      },
    });

    expect(onAwarded).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "achievement",
      })
    );

    subscription.unsubscribe();
    expect(removeChannel).toHaveBeenCalled();
  });
});
