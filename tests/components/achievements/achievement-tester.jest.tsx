import { act, fireEvent, render, screen } from "@testing-library/react";

import { AchievementTester } from "@/components/achievements/achievement-tester";
import {
  subscribeToAchievementAwards,
  triggerAchievementAction,
} from "@/services/achievement-client";
import { useAuth } from "@clerk/nextjs";

jest.mock("@/components/ui/toast", () => ({
  toastManager: {
    add: jest.fn(),
  },
}));

jest.mock("@/services/achievement-client", () => ({
  subscribeToAchievementAwards: jest.fn(() => ({
    unsubscribe: jest.fn(),
  })),
  triggerAchievementAction: jest.fn(async () => ({ success: true, awards: [] })),
  fetchAllBadges: jest.fn(async () => [
    {
      id: "1e0f7c52-1ed4-4bae-8a5c-9836cc72e001",
      code: "first-log",
      title: "첫 기록",
      description: "테스트",
      imageUrl: null,
      rule: {
        event: "READING_ENTRY_CREATED",
        type: "count",
        metric: "reading_entry_count",
        operator: ">=",
        value: 1,
      },
      isActive: true,
    },
  ]),
}));

jest.mock("@clerk/nextjs", () => ({
  useAuth: jest.fn(),
}));

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedSubscribe = subscribeToAchievementAwards as jest.MockedFunction<
  typeof subscribeToAchievementAwards
>;
const mockedTrigger = triggerAchievementAction as jest.MockedFunction<
  typeof triggerAchievementAction
>;

describe("AchievementTester", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pushMock.mockReset();
  });

  it("shows offline message when user is not authenticated", async () => {
    mockedUseAuth.mockReturnValue({
      userId: null,
      isLoaded: true,
      getToken: jest.fn(),
      isSignedIn: false,
    } as never);

    render(<AchievementTester />);
    await act(async () => {});

    expect(
      screen.getByText("Clerk 인증 정보가 없어 모니터링만 가능합니다.")
    ).toBeInTheDocument();
    expect(mockedSubscribe).not.toHaveBeenCalled();
  });

  it("triggers achievement action when button is clicked", async () => {
    mockedUseAuth.mockReturnValue({
      userId: "user-1",
      isLoaded: true,
      getToken: jest.fn(() => Promise.resolve("token")),
      isSignedIn: true,
    } as never);

    render(<AchievementTester />);
    await act(async () => {});

    const buttons = screen.getAllByRole("button", { name: "액션 전송" });
    await act(async () => {
      fireEvent.click(buttons[0]);
    });

    expect(mockedTrigger).toHaveBeenCalledWith(
      expect.objectContaining({
        achievementId: "1e0f7c52-1ed4-4bae-8a5c-9836cc72e001",
        event: "READING_ENTRY_CREATED",
        userId: "user-1",
      })
    );
  });
});
