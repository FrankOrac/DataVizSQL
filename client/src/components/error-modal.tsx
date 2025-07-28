import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFix?: () => void;
  title?: string;
  error: string;
}

export function ErrorModal({ isOpen, onClose, onFix, title = "Query Error", error }: ErrorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-medium text-gray-900">{title}</DialogTitle>
              <p className="text-sm text-gray-600">There was an issue with your SQL query</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 my-4">
          <p className="text-sm text-red-800 font-mono whitespace-pre-wrap">
            {error}
          </p>
        </div>
        
        <DialogFooter className="space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {onFix && (
            <Button onClick={onFix}>
              Fix Query
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
