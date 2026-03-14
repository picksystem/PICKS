import React, { useRef } from 'react';
import { Box, Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useStyles } from './styles';

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

const UploadFile: React.FC<DSUploadFileProps> = ({
  onChange,
  accept,
  multiple = false,
  maxSize,
  buttonText = 'Choose File',
  helperText,
  className,
  disabled = false,
  onClick,
  onDrop,
  onDragOver,
  onDragLeave,
  ...rest
}) => {
  const { cx, classes } = useStyles();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    onChange(files);
  };

  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    if (!disabled && onDrop) {
      onDrop(event);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    if (!disabled && onDragOver) {
      onDragOver(event);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLElement>) => {
    if (!disabled && onDragLeave) {
      onDragLeave(event);
    }
  };

  return (
    <Box
      className={cx(classes.root, className)}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
      {...rest}
    >
      <input
        ref={inputRef}
        type='file'
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className={classes.input}
        disabled={disabled}
      />
      <Box className={classes.content}>
        <CloudUploadIcon fontSize='large' color='action' />
        <Button variant='contained' disabled={disabled}>
          {buttonText}
        </Button>
        {helperText && <div className={classes.helperText}>{helperText}</div>}
        {maxSize && (
          <div className={classes.helperText}>
            Max file size: {(maxSize / 1024 / 1024).toFixed(2)} MB
          </div>
        )}
      </Box>
    </Box>
  );
};

export default UploadFile;
