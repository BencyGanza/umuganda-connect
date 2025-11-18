import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";

interface ProjectQRCodeProps {
  projectId: string;
  projectTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectQRCode = ({ projectId, projectTitle, isOpen, onClose }: ProjectQRCodeProps) => {
  const qrData = JSON.stringify({ projectId, type: "attendance" });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{projectTitle}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 p-4">
          <QRCodeSVG value={qrData} size={256} />
          <p className="text-sm text-muted-foreground text-center">
            Scan this QR code to check in/out of this project
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
