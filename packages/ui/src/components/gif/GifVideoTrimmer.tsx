import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, Stack, IconButton, Button, Slider, Tooltip } from '@mui/material';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Move,
  Lock,
  Unlock,
} from 'lucide-react';
import { formatTimecode, type GifCropRegion } from '@varia/core';
import { colorTokens } from '../../theme/tokens';
import { GlassCard } from '../GlassCard';

export type CropDragMode = 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e';

export interface GifVideoTrimmerProps {
  videoUrl: string;
  duration: number;
  videoWidth?: number;
  videoHeight?: number;
  trimStart: number;
  trimEnd: number;
  onTrimChange: (start: number, end: number) => void;
  speed?: number;
  crop?: GifCropRegion;
  onCropChange?: (crop: GifCropRegion) => void;
  isRatioLocked?: boolean;
  onToggleRatioLock?: (locked: boolean) => void;
}

export const GifVideoTrimmer: React.FC<GifVideoTrimmerProps> = ({
  videoUrl,
  duration,
  videoWidth = 640,
  videoHeight = 360,
  trimStart,
  trimEnd,
  onTrimChange,
  speed = 1.0,
  crop,
  onCropChange,
  isRatioLocked: externalRatioLocked,
  onToggleRatioLock,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoWrapperRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  // Aspect ratio lock state (defaults to true for consistent cropping)
  const [internalRatioLocked, setInternalRatioLocked] = useState(true);
  const isRatioLocked =
    externalRatioLocked !== undefined ? externalRatioLocked : internalRatioLocked;

  const toggleRatioLock = () => {
    const nextVal = !isRatioLocked;
    setInternalRatioLocked(nextVal);
    onToggleRatioLock?.(nextVal);
  };

  // Dragging & Resizing state for interactive crop box
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [dragMode, setDragMode] = useState<CropDragMode>('move');
  const dragStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    initX: number;
    initY: number;
    initW: number;
    initH: number;
    ratio: number;
  } | null>(null);

  // Dragging state for Playback Position Needle
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const timelineTrackRef = useRef<HTMLDivElement | null>(null);

  const handlePlayheadPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsDraggingPlayhead(true);
  };

  const handlePlayheadPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingPlayhead || !timelineTrackRef.current || duration <= 0) return;
    const rect = timelineTrackRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    handleSeek(ratio * duration);
  };

  const handlePlayheadPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingPlayhead) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
      setIsDraggingPlayhead(false);
    }
  };

  // Sync playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);

      // Loop inside trim window
      if (time >= trimEnd) {
        videoRef.current.currentTime = trimStart;
      }
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime >= trimEnd || videoRef.current.currentTime < trimStart) {
        videoRef.current.currentTime = trimStart;
      }
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (newTime: number) => {
    if (!videoRef.current) return;
    const clamped = Math.max(0, Math.min(duration, newTime));
    videoRef.current.currentTime = clamped;
    setCurrentTime(clamped);
  };

  const handleStep = (deltaSeconds: number) => {
    handleSeek(currentTime + deltaSeconds);
  };

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      const [start, end] = newValue;
      if (typeof start === 'number' && typeof end === 'number') {
        onTrimChange(Math.max(0, start), Math.min(duration, end));
      }
    }
  };

  const setStartToCurrent = () => {
    if (currentTime < trimEnd) {
      onTrimChange(currentTime, trimEnd);
    }
  };

  const setEndToCurrent = () => {
    if (currentTime > trimStart) {
      onTrimChange(trimStart, currentTime);
    }
  };

  // --- Interactive Move & Resize Handlers with Ratio-Locking Support ---
  const handleCropPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    mode: CropDragMode = 'move',
  ) => {
    if (!crop || !onCropChange || !videoWrapperRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsDraggingCrop(true);
    setDragMode(mode);

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initX: crop.x,
      initY: crop.y,
      initW: crop.width,
      initH: crop.height,
      ratio: crop.width / Math.max(1, crop.height),
    };
  };

  const handleCropPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (
      !isDraggingCrop ||
      !dragStartRef.current ||
      !crop ||
      !onCropChange ||
      !videoWrapperRef.current
    )
      return;

    const wrapperRect = videoWrapperRef.current.getBoundingClientRect();
    if (wrapperRect.width <= 0 || wrapperRect.height <= 0) return;

    // Scale factor from rendered display pixels to source video coordinates
    const scaleX = videoWidth / wrapperRect.width;
    const scaleY = videoHeight / wrapperRect.height;

    const deltaX = (e.clientX - dragStartRef.current.mouseX) * scaleX;
    const deltaY = (e.clientY - dragStartRef.current.mouseY) * scaleY;

    const { initX, initY, initW, initH, ratio } = dragStartRef.current;
    const MIN_SIZE = 20;

    let newX = initX;
    let newY = initY;
    let newW = initW;
    let newH = initH;

    if (dragMode === 'move') {
      const maxX = Math.max(0, videoWidth - initW);
      const maxY = Math.max(0, videoHeight - initH);
      newX = Math.max(0, Math.min(maxX, initX + deltaX));
      newY = Math.max(0, Math.min(maxY, initY + deltaY));
    } else if (isRatioLocked) {
      // --- Ratio Locked Resizing ---
      const R = ratio > 0 ? ratio : 1;

      if (dragMode === 'se') {
        let candW = Math.max(MIN_SIZE, initW + deltaX);
        let candH = Math.round(candW / R);
        if (candH > videoHeight - initY) {
          candH = videoHeight - initY;
          candW = Math.round(candH * R);
        }
        if (candW > videoWidth - initX) {
          candW = videoWidth - initX;
          candH = Math.round(candW / R);
        }
        newW = Math.max(MIN_SIZE, candW);
        newH = Math.max(MIN_SIZE, candH);
      } else if (dragMode === 'sw') {
        let candW = Math.max(MIN_SIZE, initW - deltaX);
        let candH = Math.round(candW / R);
        let candX = initX + (initW - candW);
        if (candX < 0) {
          candX = 0;
          candW = initX + initW;
          candH = Math.round(candW / R);
        }
        if (candH > videoHeight - initY) {
          candH = videoHeight - initY;
          candW = Math.round(candH * R);
          candX = initX + (initW - candW);
        }
        newX = Math.max(0, candX);
        newW = Math.max(MIN_SIZE, candW);
        newH = Math.max(MIN_SIZE, candH);
      } else if (dragMode === 'ne') {
        let candW = Math.max(MIN_SIZE, initW + deltaX);
        let candH = Math.round(candW / R);
        let candY = initY + (initH - candH);
        if (candY < 0) {
          candY = 0;
          candH = initY + initH;
          candW = Math.round(candH * R);
        }
        if (candW > videoWidth - initX) {
          candW = videoWidth - initX;
          candH = Math.round(candW / R);
          candY = initY + (initH - candH);
        }
        newY = Math.max(0, candY);
        newW = Math.max(MIN_SIZE, candW);
        newH = Math.max(MIN_SIZE, candH);
      } else if (dragMode === 'nw') {
        let candW = Math.max(MIN_SIZE, initW - deltaX);
        let candH = Math.round(candW / R);
        let candX = initX + (initW - candW);
        let candY = initY + (initH - candH);
        if (candX < 0) {
          candX = 0;
          candW = initX + initW;
          candH = Math.round(candW / R);
          candY = initY + (initH - candH);
        }
        if (candY < 0) {
          candY = 0;
          candH = initY + initH;
          candW = Math.round(candH * R);
          candX = initX + (initW - candW);
        }
        newX = Math.max(0, candX);
        newY = Math.max(0, candY);
        newW = Math.max(MIN_SIZE, candW);
        newH = Math.max(MIN_SIZE, candH);
      } else if (dragMode === 'e' || dragMode === 'w') {
        let candW =
          dragMode === 'e'
            ? Math.max(MIN_SIZE, initW + deltaX)
            : Math.max(MIN_SIZE, initW - deltaX);
        let candH = Math.round(candW / R);
        let candX = dragMode === 'w' ? initX + (initW - candW) : initX;
        let candY = Math.max(
          0,
          Math.min(videoHeight - candH, initY - Math.round((candH - initH) / 2)),
        );
        if (candX >= 0 && candX + candW <= videoWidth && candY + candH <= videoHeight) {
          newX = candX;
          newY = candY;
          newW = candW;
          newH = candH;
        }
      } else if (dragMode === 's' || dragMode === 'n') {
        let candH =
          dragMode === 's'
            ? Math.max(MIN_SIZE, initH + deltaY)
            : Math.max(MIN_SIZE, initH - deltaY);
        let candW = Math.round(candH * R);
        let candY = dragMode === 'n' ? initY + (initH - candH) : initY;
        let candX = Math.max(
          0,
          Math.min(videoWidth - candW, initX - Math.round((candW - initW) / 2)),
        );
        if (candY >= 0 && candY + candH <= videoHeight && candX + candW <= videoWidth) {
          newX = candX;
          newY = candY;
          newW = candW;
          newH = candH;
        }
      }
    } else {
      // --- Freeform / Unlocked Resizing ---
      switch (dragMode) {
        case 'se': {
          newW = Math.max(MIN_SIZE, Math.min(videoWidth - initX, initW + deltaX));
          newH = Math.max(MIN_SIZE, Math.min(videoHeight - initY, initH + deltaY));
          break;
        }
        case 'sw': {
          const maxDeltaX = initW - MIN_SIZE;
          const clampedDeltaX = Math.max(-initX, Math.min(maxDeltaX, deltaX));
          newX = initX + clampedDeltaX;
          newW = initW - clampedDeltaX;
          newH = Math.max(MIN_SIZE, Math.min(videoHeight - initY, initH + deltaY));
          break;
        }
        case 'ne': {
          newW = Math.max(MIN_SIZE, Math.min(videoWidth - initX, initW + deltaX));
          const maxDeltaY = initH - MIN_SIZE;
          const clampedDeltaY = Math.max(-initY, Math.min(maxDeltaY, deltaY));
          newY = initY + clampedDeltaY;
          newH = initH - clampedDeltaY;
          break;
        }
        case 'nw': {
          const maxDeltaX = initW - MIN_SIZE;
          const clampedDeltaX = Math.max(-initX, Math.min(maxDeltaX, deltaX));
          newX = initX + clampedDeltaX;
          newW = initW - clampedDeltaX;

          const maxDeltaY = initH - MIN_SIZE;
          const clampedDeltaY = Math.max(-initY, Math.min(maxDeltaY, deltaY));
          newY = initY + clampedDeltaY;
          newH = initH - clampedDeltaY;
          break;
        }
        case 'e': {
          newW = Math.max(MIN_SIZE, Math.min(videoWidth - initX, initW + deltaX));
          break;
        }
        case 'w': {
          const maxDeltaX = initW - MIN_SIZE;
          const clampedDeltaX = Math.max(-initX, Math.min(maxDeltaX, deltaX));
          newX = initX + clampedDeltaX;
          newW = initW - clampedDeltaX;
          break;
        }
        case 's': {
          newH = Math.max(MIN_SIZE, Math.min(videoHeight - initY, initH + deltaY));
          break;
        }
        case 'n': {
          const maxDeltaY = initH - MIN_SIZE;
          const clampedDeltaY = Math.max(-initY, Math.min(maxDeltaY, deltaY));
          newY = initY + clampedDeltaY;
          newH = initH - clampedDeltaY;
          break;
        }
      }
    }

    onCropChange({
      x: Math.round(newX),
      y: Math.round(newY),
      width: Math.round(newW),
      height: Math.round(newH),
    });
  };

  const handleCropPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingCrop) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
      setIsDraggingCrop(false);
      dragStartRef.current = null;
    }
  };

  const clipDuration = Math.max(0, trimEnd - trimStart);
  const playheadPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <GlassCard sx={{ p: 2.5, mb: 3 }}>
      {/* Top Header Row of Video Trimmer (Outside video to prevent vision blocking) */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={1.5}
        mb={2}
        sx={{ minHeight: 36 }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f4f4f5' }}>
          Video Preview & Trimming
        </Typography>

        {/* Top-Right Controls: Resolution Display & Ratio Lock Toggle */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ height: 32 }}>
          {videoWidth && videoHeight && (
            <Box
              sx={{
                height: 32,
                boxSizing: 'border-box',
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                px: 1.5,
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#d4d4d8',
              }}
            >
              {crop ? (
                <>
                  <span style={{ color: '#a1a1aa' }}>
                    Src: {videoWidth}×{videoHeight}
                  </span>
                  <span style={{ margin: '0 6px', color: '#ec4899' }}>→</span>
                  <span style={{ color: '#ec4899' }}>
                    Crop: {Math.round(crop.width)}×{Math.round(crop.height)}
                  </span>
                </>
              ) : (
                `${videoWidth} × ${videoHeight}`
              )}
            </Box>
          )}

          {crop && (
            <Button
              size="small"
              onClick={toggleRatioLock}
              startIcon={isRatioLocked ? <Lock size={13} /> : <Unlock size={13} />}
              sx={{
                height: 32,
                boxSizing: 'border-box',
                borderRadius: 2,
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'none',
                px: 1.5,
                border: isRatioLocked ? '1px solid #ec4899' : '1px solid rgba(255, 255, 255, 0.15)',
                backgroundColor: isRatioLocked ? '#ec4899' : 'transparent',
                color: isRatioLocked ? '#ffffff !important' : '#a1a1aa',
                '&:hover': {
                  backgroundColor: isRatioLocked ? '#db2777' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: '#ec4899',
                  color: '#ffffff',
                },
              }}
            >
              {isRatioLocked ? 'Ratio Locked' : 'Unlock Ratio'}
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Clean Borderless Video Viewport */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 2.5,
        }}
      >
        {/* Inner Video Wrapper: hugs video tightly so % overlays match actual video coordinates */}
        <Box
          ref={videoWrapperRef}
          sx={{
            position: 'relative',
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            maxWidth: '100%',
            maxHeight: 460,
            overflow: 'hidden',
            borderRadius: 0,
          }}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            muted={isMuted}
            playsInline
            style={{
              maxWidth: '100%',
              maxHeight: 460,
              objectFit: 'contain',
              display: 'block',
              cursor: 'pointer',
              borderRadius: 0,
            }}
            onClick={togglePlayPause}
          />

          {/* Interactive Moveable & Resizable Crop Overlay */}
          {crop && videoWidth > 0 && videoHeight > 0 && (
            <Box
              onPointerDown={e => handleCropPointerDown(e, 'move')}
              onPointerMove={handleCropPointerMove}
              onPointerUp={handleCropPointerUp}
              onPointerCancel={handleCropPointerUp}
              sx={{
                position: 'absolute',
                top: `${(crop.y / videoHeight) * 100}%`,
                left: `${(crop.x / videoWidth) * 100}%`,
                width: `${(crop.width / videoWidth) * 100}%`,
                height: `${(crop.height / videoHeight) * 100}%`,
                border: '2px dashed #ec4899',
                borderRadius: 0,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
                cursor: isDraggingCrop ? 'grabbing' : 'grab',
                zIndex: 4,
                touchAction: 'none',
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: isDraggingCrop ? 'none' : 'border-color 0.15s ease',
                '&:hover': {
                  borderColor: '#f472b6',
                },
              }}
            >
              {/* Drag & Resize Hint Badge */}
              <Box
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.85)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(236, 72, 153, 0.5)',
                  borderRadius: 1.5,
                  px: 1,
                  py: 0.3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  pointerEvents: 'none',
                }}
              >
                <Move size={12} color="#ec4899" />
                <Typography
                  variant="caption"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {Math.round(crop.width)}×{Math.round(crop.height)} (X:{Math.round(crop.x)}, Y:
                  {Math.round(crop.y)})
                </Typography>
              </Box>

              {/* Corner Resize Handles */}
              {/* Top-Left */}
              <Box
                onPointerDown={e => handleCropPointerDown(e, 'nw')}
                sx={{
                  position: 'absolute',
                  top: -6,
                  left: -6,
                  width: 14,
                  height: 14,
                  backgroundColor: '#ffffff',
                  border: '2px solid #ec4899',
                  borderRadius: '2px',
                  cursor: 'nwse-resize',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
                  zIndex: 6,
                }}
              />
              {/* Top-Right */}
              <Box
                onPointerDown={e => handleCropPointerDown(e, 'ne')}
                sx={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  width: 14,
                  height: 14,
                  backgroundColor: '#ffffff',
                  border: '2px solid #ec4899',
                  borderRadius: '2px',
                  cursor: 'nesw-resize',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
                  zIndex: 6,
                }}
              />
              {/* Bottom-Left */}
              <Box
                onPointerDown={e => handleCropPointerDown(e, 'sw')}
                sx={{
                  position: 'absolute',
                  bottom: -6,
                  left: -6,
                  width: 14,
                  height: 14,
                  backgroundColor: '#ffffff',
                  border: '2px solid #ec4899',
                  borderRadius: '2px',
                  cursor: 'nesw-resize',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
                  zIndex: 6,
                }}
              />
              {/* Bottom-Right */}
              <Box
                onPointerDown={e => handleCropPointerDown(e, 'se')}
                sx={{
                  position: 'absolute',
                  bottom: -6,
                  right: -6,
                  width: 14,
                  height: 14,
                  backgroundColor: '#ffffff',
                  border: '2px solid #ec4899',
                  borderRadius: '2px',
                  cursor: 'nwse-resize',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
                  zIndex: 6,
                }}
              />

              {/* Edge Resize Bars */}
              {/* Top Edge */}
              <Box
                onPointerDown={e => handleCropPointerDown(e, 'n')}
                sx={{
                  position: 'absolute',
                  top: -4,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 24,
                  height: 6,
                  backgroundColor: '#ffffff',
                  border: '1px solid #ec4899',
                  borderRadius: 1,
                  cursor: 'ns-resize',
                  zIndex: 5,
                }}
              />
              {/* Bottom Edge */}
              <Box
                onPointerDown={e => handleCropPointerDown(e, 's')}
                sx={{
                  position: 'absolute',
                  bottom: -4,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 24,
                  height: 6,
                  backgroundColor: '#ffffff',
                  border: '1px solid #ec4899',
                  borderRadius: 1,
                  cursor: 'ns-resize',
                  zIndex: 5,
                }}
              />
              {/* Left Edge */}
              <Box
                onPointerDown={e => handleCropPointerDown(e, 'w')}
                sx={{
                  position: 'absolute',
                  left: -4,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 6,
                  height: 24,
                  backgroundColor: '#ffffff',
                  border: '1px solid #ec4899',
                  borderRadius: 1,
                  cursor: 'ew-resize',
                  zIndex: 5,
                }}
              />
              {/* Right Edge */}
              <Box
                onPointerDown={e => handleCropPointerDown(e, 'e')}
                sx={{
                  position: 'absolute',
                  right: -4,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 6,
                  height: 24,
                  backgroundColor: '#ffffff',
                  border: '1px solid #ec4899',
                  borderRadius: 1,
                  cursor: 'ew-resize',
                  zIndex: 5,
                }}
              />
            </Box>
          )}
        </Box>
      </Box>

      {/* Timeline Controls & Dual Range Slider */}
      <Box sx={{ mt: 1, px: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography
              variant="caption"
              sx={{ color: colorTokens.text.secondary, fontWeight: 600 }}
            >
              Current: <b style={{ color: '#ffffff' }}>{formatTimecode(currentTime, true)}</b>
            </Typography>
            <Typography variant="caption" sx={{ color: '#ec4899', fontWeight: 700 }}>
              • GIF Length: {clipDuration.toFixed(2)}s
            </Typography>
          </Stack>

          <Typography variant="caption" sx={{ color: colorTokens.text.muted }}>
            Total: {formatTimecode(duration, true)}
          </Typography>
        </Stack>

        {/* Range Slider Container with Playhead Pointer */}
        <Box
          ref={timelineTrackRef}
          onPointerDown={e => {
            // Only seek if clicking track/background, never when clicking or dragging the start/end thumbs
            if ((e.target as HTMLElement).closest('.MuiSlider-thumb')) return;
            if (!timelineTrackRef.current || duration <= 0) return;
            const rect = timelineTrackRef.current.getBoundingClientRect();
            if (rect.width > 0) {
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              handleSeek(ratio * duration);
            }
          }}
          sx={{
            position: 'relative',
            py: 0.5,
            cursor: 'pointer',
          }}
        >
          <Slider
            disableSwap
            value={[trimStart, trimEnd]}
            onChange={handleSliderChange}
            min={0}
            max={duration || 100}
            step={0.05}
            valueLabelDisplay="off"
            sx={{
              pointerEvents: 'none',
              color: '#ec4899',
              height: 8,
              '& .MuiSlider-thumb': {
                width: 18,
                height: 18,
                backgroundColor: '#ffffff',
                border: '2px solid #ec4899',
                pointerEvents: 'auto',
                zIndex: 4,
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: '0 0 0 8px rgba(236, 72, 153, 0.2)',
                },
              },
              '& .MuiSlider-track': {
                background: 'linear-gradient(90deg, #ec4899 0%, #8b5cf6 100%)',
                pointerEvents: 'none',
              },
              '& .MuiSlider-rail': {
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                pointerEvents: 'none',
              },
            }}
          />

          {/* Movable Playback Playhead / Position Needle */}
          {duration > 0 && (
            <Box
              onPointerDown={handlePlayheadPointerDown}
              onPointerMove={handlePlayheadPointerMove}
              onPointerUp={handlePlayheadPointerUp}
              onPointerCancel={handlePlayheadPointerUp}
              sx={{
                position: 'absolute',
                top: '50%',
                left: `${Math.min(100, Math.max(0, playheadPercent))}%`,
                transform: 'translate(-50%, -50%)',
                width: 22,
                height: 40,
                cursor: isDraggingPlayhead ? 'grabbing' : 'grab',
                zIndex: 5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'auto',
                touchAction: 'none',
                userSelect: 'none',
                transition: isPlaying || isDraggingPlayhead ? 'none' : 'left 0.08s ease',
                '&:hover .playhead-time, &:active .playhead-time': {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              }}
            >
              {/* Floating Timestamp Badge on Drag/Hover */}
              <Box
                className="playhead-time"
                sx={{
                  position: 'absolute',
                  top: -26,
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(236, 72, 153, 0.6)',
                  borderRadius: 1,
                  px: 0.8,
                  py: 0.2,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  opacity: isDraggingPlayhead ? 1 : 0,
                  transform: isDraggingPlayhead ? 'translateY(0)' : 'translateY(4px)',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
                }}
              >
                {formatTimecode(currentTime, true)}
              </Box>

              {/* Playhead Pointer Needle Head */}
              <Box
                sx={{
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: '8px solid #ffffff',
                  filter: 'drop-shadow(0 0 4px #ec4899)',
                }}
              />
              {/* Playhead Needle Line */}
              <Box
                sx={{
                  width: 3,
                  height: 24,
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 8px rgba(255, 255, 255, 0.95), 0 0 14px #ec4899',
                  borderRadius: 1.5,
                }}
              />
            </Box>
          )}
        </Box>

        {/* Playback Controls Row */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          gap={1.5}
          mt={1.5}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              onClick={togglePlayPause}
              sx={{
                backgroundColor: 'rgba(236, 72, 153, 0.15)',
                color: '#ec4899',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(236, 72, 153, 0.25)',
                },
              }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </IconButton>

            <Tooltip title="Step Back 0.1s">
              <IconButton
                size="small"
                onClick={() => handleStep(-0.1)}
                sx={{ color: colorTokens.text.secondary }}
              >
                <ChevronLeft size={18} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Step Forward 0.1s">
              <IconButton
                size="small"
                onClick={() => handleStep(0.1)}
                sx={{ color: colorTokens.text.secondary }}
              >
                <ChevronRight size={18} />
              </IconButton>
            </Tooltip>

            <Tooltip title={isMuted ? 'Unmute Audio' : 'Mute Audio'}>
              <IconButton
                size="small"
                onClick={() => setIsMuted(!isMuted)}
                sx={{ color: isMuted ? colorTokens.text.muted : '#ffffff' }}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Quick Mark Start & End Buttons */}
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              onClick={setStartToCurrent}
              startIcon={<Scissors size={14} />}
              sx={{
                fontSize: '0.75rem',
                borderColor: 'rgba(255, 255, 255, 0.12)',
                color: '#d4d4d8',
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#ec4899',
                  color: '#ffffff',
                },
              }}
            >
              Set Start [{formatTimecode(currentTime)}]
            </Button>

            <Button
              size="small"
              variant="outlined"
              onClick={setEndToCurrent}
              startIcon={<Scissors size={14} />}
              sx={{
                fontSize: '0.75rem',
                borderColor: 'rgba(255, 255, 255, 0.12)',
                color: '#d4d4d8',
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#ec4899',
                  color: '#ffffff',
                },
              }}
            >
              Set End [{formatTimecode(currentTime)}]
            </Button>
          </Stack>
        </Stack>
      </Box>
    </GlassCard>
  );
};
