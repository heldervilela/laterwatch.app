import { api, tokenManager } from "@/services/api"
import { BrandIconSmall } from "@/ui/assets/brand-icon-small"
import { GoogleIcon } from "@/ui/assets/google-icon"
import { Button } from "@/ui/base/button"
import { Input } from "@/ui/base/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/ui/base/input-otp"
import { Label } from "@/ui/base/label"
import { Link, useRouter } from "@tanstack/react-router"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { useState } from "react"

import { cn } from "@/lib/utils"

export function LoginForm({
  className,
  form,
  ...props
}: React.ComponentProps<"div"> & { form: "login" | "signup" }) {
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<"email" | "code">("email")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await (api.auth as any).sendVerificationCode.mutate({
        email,
      })

      if (response.success) {
        setStep("code")
      } else {
        setError(response.message || "Error sending code")
      }
    } catch (error: any) {
      console.error("[Error][Login] Error sending verification code:", error)
      setError(error.message || "Error sending verification code")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await (api.auth as any).verifyCode.mutate({
        email,
        code,
      })

      if (response.success && response.tokens) {
        tokenManager.setTokens(
          response.tokens.accessToken,
          response.tokens.refreshToken
        )
        router.navigate({ to: "/" })
      } else {
        setError(response.message || "Invalid code")
      }
    } catch (error: any) {
      console.error("[Error][Login] Error verifying code:", error)
      setError(error.message || "Error verifying code")
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setStep("email")
    setCode("")
    setError(null)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {step === "email" && (
        <>
          <form onSubmit={handleSendCode}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-md">
                  <BrandIconSmall className="size-8" />
                </div>

                <h1 className="text-xl font-bold">
                  {form === "login" ? "Welcome back" : "Create an account"}
                </h1>
                <div className="text-center text-sm">
                  Don't have an account? <br />
                  Don't worry, we'll create one if it doesn't exist.
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                {error && (
                  <div className="text-center text-sm text-red-500">
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !email}
                >
                  {loading ? "Sending..." : "Sign in"}
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-background text-muted-foreground relative z-10 px-2">
                  Or
                </span>
              </div>
              <div className="">
                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  disabled={loading}
                >
                  <GoogleIcon className="mr-2 h-4 w-4" />
                  Continue with Google
                </Button>
              </div>
            </div>
          </form>
          <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
            By continuing, you agree to our <a href="#">Terms of Service</a> and{" "}
            <a href="#">Privacy Policy</a>.
          </div>
        </>
      )}
      {step === "code" && (
        <>
          <form onSubmit={handleVerifyCode}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2">
                {form === "login" && (
                  <div className="flex size-8 items-center justify-center rounded-md">
                    <BrandIconSmall className="size-6" />
                  </div>
                )}
                <h1 className="text-xl font-bold">Verification Code</h1>
                <p className="text-center text-sm">
                  We sent a code to <strong>{email}</strong>. <br />
                  Please enter it below.
                </p>
              </div>
              <div className="flex flex-col items-center gap-6">
                <div className="grid gap-3">
                  <InputOTP
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    value={code}
                    onChange={(value) => setCode(value)}
                    disabled={loading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {error && (
                  <div className="text-center text-sm text-red-500">
                    {error}
                  </div>
                )}
                <div className="flex w-full gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={loading}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={loading || code.length !== 6}
                  >
                    {loading ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
          <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
            Didn't receive the code?{" "}
            <Link to="/" onClick={handleBack}>
              Resend code
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
