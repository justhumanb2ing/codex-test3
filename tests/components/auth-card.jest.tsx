import { render, screen } from "@testing-library/react"

import { AuthCard } from "@/components/auth/auth-card"

describe("AuthCard", () => {
  it("renders title, description, and children", () => {
    render(
      <AuthCard title="로그인" description="이메일로 로그인하세요.">
        <span>Child content</span>
      </AuthCard>,
    )

    expect(screen.getByText("로그인")).toBeInTheDocument()
    expect(screen.getByText("이메일로 로그인하세요.")).toBeInTheDocument()
    expect(screen.getByText("Child content")).toBeInTheDocument()
  })

  it("renders footer content when provided", () => {
    render(
      <AuthCard
        title="회원가입"
        description="새 계정을 만드세요."
        footer={<span>이미 계정이 있으신가요?</span>}
      >
        <span />
      </AuthCard>,
    )

    expect(screen.getByText("이미 계정이 있으신가요?")).toBeInTheDocument()
  })
})
