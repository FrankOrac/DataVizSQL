import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export function LoadingOverlay({ isVisible, message = "Processing your request" }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Executing Query...</h3>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
