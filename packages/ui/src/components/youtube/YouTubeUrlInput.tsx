import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress,
  Typography,
} from '@mui/material';
import { Youtube, Clipboard, X, Search, Sparkles } from 'lucide-react';
import { isValidYouTubeUrl } from '@varia/core';
import { GlassCard } from '../GlassCard';

export interface YouTubeUrlInputProps {
  onFetch: (url: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const YouTubeUrlInput: React.FC<YouTubeUrlInputProps> = ({
  onFetch,
  isLoading = false,
  disabled = false,
}) => {
  const [url, setUrl] = useState('');
  const [touched, setTouched] = useState(false);

  const isValid = isValidYouTubeUrl(url);
  const showError = touched && url.length > 0 && !isValid;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isValid && !isLoading && !disabled) {
      onFetch(url.trim());
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setTouched(true);
        if (isValidYouTubeUrl(text.trim())) {
          onFetch(text.trim());
        }
      }
    } catch {
      // Ignore clipboard permission errors
    }
  };

  const handleClear = () => {
    setUrl('');
    setTouched(false);
  };

  return (
    <GlassCard
      sx={{
        p: { xs: 2.5, md: 3.5 },
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        background:
          'linear-gradient(180deg, rgba(239, 68, 68, 0.04) 0%, rgba(18, 18, 23, 0.7) 100%)',
      }}
    >
      <Box component="form" onSubmit={handleSubmit}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            color: '#f4f4f5',
            mb: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Youtube size={20} color="#ef4444" />
          Enter YouTube Video or Shorts URL
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
            alignItems: 'stretch',
          }}
        >
          <TextField
            fullWidth
            placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
            value={url}
            onChange={e => {
              setUrl(e.target.value);
              setTouched(true);
            }}
            disabled={isLoading || disabled}
            error={showError}
            helperText={showError ? 'Please enter a valid YouTube video or shorts link' : undefined}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Youtube size={18} color="#ef4444" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {url && (
                    <IconButton size="small" onClick={handleClear} sx={{ color: '#71717a' }}>
                      <X size={16} />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={handlePaste}
                    title="Paste from clipboard"
                    sx={{ color: '#a1a1aa', ml: 0.5 }}
                  >
                    <Clipboard size={16} />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 2.5,
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(239, 68, 68, 0.4) !important',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ef4444 !important',
                },
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={!isValid || isLoading || disabled}
            sx={{
              minWidth: { xs: '100%', sm: 160 },
              height: 54,
              borderRadius: 2.5,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#ffffff',
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={20} sx={{ color: '#ffffff' }} />
            ) : (
              <>
                <Search size={18} style={{ marginRight: 8 }} />
                Fetch Media
              </>
            )}
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
          <Sparkles size={14} color="#ef4444" />
          <Typography variant="caption" sx={{ color: '#71717a' }}>
            Supports standard YouTube, YouTube Shorts, and YouTube Music links.
          </Typography>
        </Box>
      </Box>
    </GlassCard>
  );
};
