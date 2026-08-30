import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, Stack, Button, Chip } from '@mui/material';
import { UploadCloud, Plus } from 'lucide-react';
import { colorTokens } from '../../theme/tokens';
import { isMediaFileSupported } from '@varia/core';

export interface MediaDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  accept?: string;
  formats?: string[];
  title?: string;
  dragOverTitle?: string;
  subtitle?: string;
  buttonText?: string;
  icon?: React.ReactNode;
  validateFile?: (file: File) => boolean;
  enablePaste?: boolean;
}

export const MediaDropzone: React.FC<MediaDropzoneProps> = ({
  onFilesSelected,
  multiple = true,
  disabled = false,
  accept = 'video/*,audio/*,.mp4,.mkv,.webm,.avi,.mov,.flv,.wav,.mp3,.aac,.ogg,.flac,.m4a',
  formats = ['MP4', 'MKV', 'WebM', 'AVI', 'MOV', 'WAV', 'MP3', 'AAC', 'FLAC', 'OGG'],
  title = 'Drag & drop video or audio files here',
  dragOverTitle = 'Drop files right here!',
  subtitle = 'or click to browse from your computer (100% private, client-side WASM)',
  buttonText = 'Choose Media Files',
  icon,
  validateFile = isMediaFileSupported,
  enablePaste = true,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Global paste handler (Ctrl+V / Cmd+V)
  useEffect(() => {
    if (!enablePaste || disabled) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item && item.kind === 'file') {
          const file = item.getAsFile();
          if (file && validateFile(file)) {
            pastedFiles.push(file);
          }
        }
      }

      if (pastedFiles.length > 0) {
        onFilesSelected(multiple ? pastedFiles : [pastedFiles[0]!]);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [enablePaste, disabled, multiple, onFilesSelected, validateFile]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files).filter(validateFile);
    if (files.length > 0) {
      onFilesSelected(multiple ? files : [files[0]!]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).filter(validateFile);
    if (files.length > 0) {
      onFilesSelected(multiple ? files : [files[0]!]);
    }
    e.target.value = '';
  };

  return (
    <Box
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      sx={{
        border: `2px dashed ${isDragOver ? colorTokens.accent.violet : colorTokens.bg.border}`,
        backgroundColor: isDragOver ? 'rgba(139, 92, 246, 0.08)' : 'rgba(24, 24, 27, 0.5)',
        borderRadius: 4,
        p: { xs: 4, md: 6 },
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transform: 'translateZ(0)',
        transition:
          'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
        willChange: disabled ? 'auto' : 'transform',
        backdropFilter: 'blur(12px)',
        '&:hover': {
          borderColor: disabled ? colorTokens.bg.border : colorTokens.accent.violetLight,
          backgroundColor: disabled ? 'rgba(24, 24, 27, 0.5)' : 'rgba(139, 92, 246, 0.04)',
          transform: disabled ? 'none' : 'translateY(-2px)',
          boxShadow: disabled ? 'none' : '0 12px 40px rgba(139, 92, 246, 0.12)',
        },
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      <Stack spacing={2} alignItems="center" justifyContent="center">
        {/* Animated Icon */}
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 3.5,
            background: isDragOver
              ? 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)'
              : 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isDragOver ? '#ffffff' : colorTokens.accent.violet,
            transition: 'transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
            willChange: 'transform',
            boxShadow: isDragOver ? '0 0 30px rgba(139, 92, 246, 0.4)' : 'none',
          }}
        >
          {icon || <UploadCloud size={32} />}
        </Box>

        {/* Text Prompt */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            {isDragOver ? dragOverTitle : title}
          </Typography>
          <Typography variant="body2" sx={{ color: colorTokens.text.secondary }}>
            {subtitle}
          </Typography>
        </Box>

        {/* Supported Format Chips */}
        {formats.length > 0 && (
          <Stack
            direction="row"
            spacing={0.6}
            flexWrap="wrap"
            justifyContent="center"
            sx={{ maxWidth: 500 }}
          >
            {formats.map(fmt => (
              <Chip
                key={fmt}
                label={fmt}
                size="small"
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  color: colorTokens.text.muted,
                  my: 0.3,
                }}
              />
            ))}
          </Stack>
        )}

        <Button
          variant="outlined"
          startIcon={<Plus size={16} />}
          disabled={disabled}
          sx={{
            mt: 1,
            borderRadius: 2,
            px: 3,
            borderColor: colorTokens.bg.borderHover,
            color: colorTokens.text.primary,
            '&:hover': {
              borderColor: colorTokens.accent.violet,
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
            },
          }}
        >
          {buttonText}
        </Button>
      </Stack>
    </Box>
  );
};
