export interface DSUploadFileProps {
  onChange: (files: FileList | null) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  buttonText?: string;
  helperText?: string;
  className?: string;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  onDrop?: (event: React.DragEvent<HTMLElement>) => void;
  onDragOver?: (event: React.DragEvent<HTMLElement>) => void;
  onDragLeave?: (event: React.DragEvent<HTMLElement>) => void;
}
