import { Button } from "@/ui/base/button"
import { Card } from "@/ui/base/card"
import { useNavigate, useRouter } from "@tanstack/react-router"
import { AlertTriangle, ArrowLeft, Home, RefreshCw } from "lucide-react"

interface ErrorPageFallbackProps {
  error?: {
    message?: string
    code?: string | number
  }
  onRetry?: () => void
  onGoBack?: () => void
}

export function ErrorPageFallback({
  error,
  onRetry,
  onGoBack,
}: ErrorPageFallbackProps = {}) {
  const navigate = useNavigate()
  const router = useRouter()

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack()
    } else {
      router.history.back()
    }
  }

  const handleGoHome = () => {
    navigate({ to: "/" })
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-2xl p-8">
        <div className="space-y-6 text-center">
          {/* Error Icon */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>

          {/* Error Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Oops! Something went wrong</h1>
            <p className="text-muted-foreground text-lg">
              An unexpected error occurred. Please try again.
            </p>
          </div>

          {/* Error Details */}
          {error && (
            <Card className="bg-muted/50 p-4 text-left">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Error details:</h3>
                {error.message && (
                  <p className="text-muted-foreground text-sm">
                    <span className="font-medium">Message:</span>{" "}
                    {error.message}
                  </p>
                )}
                {error.code && (
                  <p className="text-muted-foreground text-sm">
                    <span className="font-medium">Code:</span> {error.code}
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Error Description */}
          <div className="mx-auto max-w-lg space-y-4 text-left">
            <h3 className="font-semibold">What might have happened:</h3>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li className="flex items-start space-x-2">
                <span className="bg-muted-foreground mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"></span>
                <span>Temporary server connectivity issue</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="bg-muted-foreground mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"></span>
                <span>Ongoing system maintenance</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="bg-muted-foreground mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"></span>
                <span>Internal server error</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col justify-center gap-3 pt-4 sm:flex-row">
            <Button
              onClick={handleRetry}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try again</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleGoBack}
              className="flex items-center space-x-2 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Go back</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleGoHome}
              className="flex items-center space-x-2 bg-transparent"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Button>
          </div>

          {/* Help Text */}
          <div className="border-t pt-6">
            <p className="text-muted-foreground text-sm">
              If the problem persists, please contact our technical support.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
