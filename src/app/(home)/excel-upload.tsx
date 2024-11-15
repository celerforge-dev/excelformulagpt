import { ExcelData, ExcelParser } from "@/app/(home)/excel-parser";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRef, useState } from "react";
import { toast } from "sonner";

type ExcelUploadProps = {
  onFileLoaded: (data: ExcelData) => void;
  onFileRemoved: () => void;
};

export function ExcelUpload({ onFileLoaded, onFileRemoved }: ExcelUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await ExcelParser.parse(file);
      onFileLoaded(result);
      setFileName(file.name);
      toast.success(`Successfully loaded "${file.name}"`);
      event.target.value = "";
    } catch (error) {
      clearFile();
      toast.error("Failed to parse Excel file");
      console.error(error);
    }
  };

  const clearFile = () => {
    setFileName(null);
    onFileRemoved();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 pb-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        className="hidden"
      />
      {fileName ? (
        <div className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1">
          <span className="text-xs text-secondary-foreground">{fileName}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={(e) => {
              e.preventDefault();
              clearFile();
            }}
          >
            <Icons.x className="h-3 w-3" />
            <span className="sr-only">Remove file</span>
          </Button>
        </div>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="-mb-1 h-6 p-0 text-secondary-foreground hover:bg-transparent"
                aria-label="Upload excel file"
                onClick={() => fileInputRef.current?.click()}
              >
                <Icons.fileUp />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-xs">
                Upload your file to help us better understand your data context.
                Your file is processed locally and we respect your privacy.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
