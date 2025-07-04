import { Button } from "@/ui/base/button";
import { Card } from "@/ui/base/card";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Home, RefreshCw } from "lucide-react";

interface ErrorPageFallbackProps {
  error?: {
    message?: string;
    code?: string | number;
  };
  onRetry?: () => void;
  onGoBack?: () => void;
}

export function ErrorPageFallback({
  error,
  onRetry,
  onGoBack,
}: ErrorPageFallbackProps = {}) {
  const navigate = useNavigate();
  const router = useRouter();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      router.history.back();
    }
  };

  const handleGoHome = () => {
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Card className="w-full max-w-2xl p-8">
        <div className="text-center space-y-6">
          {/* Error Icon */}
          <div className="w-24 h-24 bg-red-100 rounded-full mx-auto flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-red-500" />
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
            <Card className="p-4 bg-muted/50 text-left">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Error details:</h3>
                {error.message && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Message:</span>{" "}
                    {error.message}
                  </p>
                )}
                {error.code && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Code:</span> {error.code}
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Error Description */}
          <div className="space-y-4 text-left max-w-lg mx-auto">
            <h3 className="font-semibold">What might have happened:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></span>
                <span>Temporary server connectivity issue</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></span>
                <span>Ongoing system maintenance</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></span>
                <span>Internal server error</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button
              onClick={handleRetry}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try again</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleGoBack}
              className="flex items-center space-x-2 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go back</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleGoHome}
              className="flex items-center space-x-2 bg-transparent"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Button>
          </div>

          {/* Help Text */}
          <div className="pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              If the problem persists, please contact our technical support.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
