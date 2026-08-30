import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography, Stack, Button, CircularProgress } from '@mui/material';
import { Lock, Unlock, Check, X, Crop, RotateCcw } from 'lucide-react';
import type { AspectRatioPreset, CropRect, ImageDimensions } from '@varia/core';
import { colorTokens } from '../../theme/tokens';

export type CropDragHandle = 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e';

export interface ImageStudioCanvasProps {
  sourceImageUrl: string;
  resultImageUrl?: string;
  sourceDimensions: ImageDimensions;
  cropRect?: CropRect;
  onCropChange: (rect: CropRect) => void;
  activePreset: AspectRatioPreset;
  onPresetChange?: (preset: AspectRatioPreset) => void;
  onResetCrop?: () => void;
  onApplyCrop?: () => void;
  onCancelCrop?: () => void;
  isCropMode?: boolean;
  circular?: boolean;
}

export const ImageStudioCanvas: React.FC<ImageStudioCanvasProps> = ({
  sourceImageUrl,
  resultImageUrl,
  sourceDimensions,
  cropRect,
  onCropChange,
  activePreset,
  onPresetChange,
  onResetCrop,
  onApplyCrop,
  onCancelCrop,
  isCropMode = false,
  circular = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [renderedBounds, setRenderedBounds] = useState<{
    width: number;
    height: number;
    left: number;
    top: number;
  } | null>(null);

  // Aspect ratio lock state (locked if preset is specified, unlocked if freeform)
  const [isRatioLocked, setIsRatioLocked] = useState<boolean>(activePreset !== 'freeform');

  useEffect(() => {
    setIsRatioLocked(activePreset !== 'freeform');
  }, [activePreset]);

  const toggleRatioLock = () => {
    const nextVal = !isRatioLocked;
    setIsRatioLocked(nextVal);
    if (!nextVal && onPresetChange) {
      onPresetChange('freeform');
    }
  };

  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [dragHandle, setDragHandle] = useState<CropDragHandle>('move');

  const dragStartRef = useRef<{
    clientX: number;
    clientY: number;
    initRect: CropRect;
    ratio: number;
  } | null>(null);

  // Recalculate rendered image position inside container
  const updateRenderedBounds = useCallback(() => {
    if (!imgRef.current || !containerRef.current) return;
    const img = imgRef.current;

    const imgW = img.offsetWidth;
    const imgH = img.offsetHeight;
    const imgLeft = img.offsetLeft;
    const imgTop = img.offsetTop;

    if (imgW > 0 && imgH > 0) {
      setRenderedBounds({
        width: imgW,
        height: imgH,
        left: imgLeft,
        top: imgTop,
      });
    }
  }, []);

  useEffect(() => {
    updateRenderedBounds();
    window.addEventListener('resize', updateRenderedBounds);
    return () => window.removeEventListener('resize', updateRenderedBounds);
  }, [updateRenderedBounds, sourceImageUrl, resultImageUrl, isCropMode]);

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    handle: CropDragHandle,
  ) => {
    const effectiveCrop = cropRect || {
      x: 0,
      y: 0,
      width: sourceDimensions.width,
      height: sourceDimensions.height,
    };

    if (!renderedBounds) return;
    e.preventDefault();
    e.stopPropagation();

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsDraggingCrop(true);
    setDragHandle(handle);

    const ratio = effectiveCrop.width / Math.max(1, effectiveCrop.height);

    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initRect: { ...effectiveCrop },
      ratio,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (
      !isDraggingCrop ||
      !dragStartRef.current ||
      !renderedBounds ||
      sourceDimensions.width <= 0 ||
      sourceDimensions.height <= 0
    )
      return;

    const { clientX, clientY, initRect, ratio } = dragStartRef.current;
    const scaleX = sourceDimensions.width / renderedBounds.width;
    const scaleY = sourceDimensions.height / renderedBounds.height;

    const deltaX = (e.clientX - clientX) * scaleX;
    const deltaY = (e.clientY - clientY) * scaleY;

    const MIN_SIZE = 20;
    const { width: imgW, height: imgH } = sourceDimensions;

    let newX = initRect.x;
    let newY = initRect.y;
    let newW = initRect.width;
    let newH = initRect.height;

    if (dragHandle === 'move') {
      const maxX = Math.max(0, imgW - initRect.width);
      const maxY = Math.max(0, imgH - initRect.height);
      newX = Math.max(0, Math.min(maxX, initRect.x + deltaX));
      newY = Math.max(0, Math.min(maxY, initRect.y + deltaY));
    } else if (isRatioLocked) {
      // --- Ratio Locked Resizing ---
      const R = ratio > 0 ? ratio : 1;

      if (dragHandle === 'se') {
        let candW = Math.max(MIN_SIZE, initRect.width + deltaX);
        let candH = Math.round(candW / R);
        if (candH > imgH - initRect.y) {
          candH = imgH - initRect.y;
          candW = Math.round(candH * R);
        }
        if (candW > imgW - initRect.x) {
          candW = imgW - initRect.x;
          candH = Math.round(candW / R);
        }
        newW = Math.max(MIN_SIZE, candW);
        newH = Math.max(MIN_SIZE, candH);
      } else if (dragHandle === 'sw') {
        let candW = Math.max(MIN_SIZE, initRect.width - deltaX);
        let candH = Math.round(candW / R);
        let candX = initRect.x + (initRect.width - candW);
        if (candX < 0) {
          candX = 0;
          candW = initRect.x + initRect.width;
          candH = Math.round(candW / R);
        }
        if (candH > imgH - initRect.y) {
          candH = imgH - initRect.y;
          candW = Math.round(candH * R);
          candX = initRect.x + (initRect.width - candW);
        }
        newX = Math.max(0, candX);
        newW = Math.max(MIN_SIZE, candW);
        newH = Math.max(MIN_SIZE, candH);
      } else if (dragHandle === 'ne') {
        let candW = Math.max(MIN_SIZE, initRect.width + deltaX);
        let candH = Math.round(candW / R);
        let candY = initRect.y + (initRect.height - candH);
        if (candY < 0) {
          candY = 0;
          candH = initRect.y + initRect.height;
          candW = Math.round(candH * R);
        }
        if (candW > imgW - initRect.x) {
          candW = imgW - initRect.x;
          candH = Math.round(candW / R);
          candY = initRect.y + (initRect.height - candH);
        }
        newY = Math.max(0, candY);
        newW = Math.max(MIN_SIZE, candW);
        newH = Math.max(MIN_SIZE, candH);
      } else if (dragHandle === 'nw') {
        let candW = Math.max(MIN_SIZE, initRect.width - deltaX);
        let candH = Math.round(candW / R);
        let candX = initRect.x + (initRect.width - candW);
        let candY = initRect.y + (initRect.height - candH);
        if (candX < 0) {
          candX = 0;
          candW = initRect.x + initRect.width;
          candH = Math.round(candW / R);
          candY = initRect.y + (initRect.height - candH);
        }
        if (candY < 0) {
          candY = 0;
          candH = initRect.y + initRect.height;
          candW = Math.round(candH * R);
          candX = initRect.x + (initRect.width - candW);
        }
        newX = Math.max(0, candX);
        newY = Math.max(0, candY);
        newW = Math.max(MIN_SIZE, candW);
        newH = Math.max(MIN_SIZE, candH);
      } else if (dragHandle === 'e' || dragHandle === 'w') {
        const candW =
          dragHandle === 'e'
            ? Math.max(MIN_SIZE, initRect.width + deltaX)
            : Math.max(MIN_SIZE, initRect.width - deltaX);
        const candH = Math.round(candW / R);
        const candX = dragHandle === 'w' ? initRect.x + (initRect.width - candW) : initRect.x;
        const candY = Math.max(
          0,
          Math.min(imgH - candH, initRect.y - Math.round((candH - initRect.height) / 2)),
        );
        if (candX >= 0 && candX + candW <= imgW && candY + candH <= imgH) {
          newX = candX;
          newY = candY;
          newW = candW;
          newH = candH;
        }
      } else if (dragHandle === 's' || dragHandle === 'n') {
        const candH =
          dragHandle === 's'
            ? Math.max(MIN_SIZE, initRect.height + deltaY)
            : Math.max(MIN_SIZE, initRect.height - deltaY);
        const candW = Math.round(candH * R);
        const candY = dragHandle === 'n' ? initRect.y + (initRect.height - candH) : initRect.y;
        const candX = Math.max(
          0,
          Math.min(imgW - candW, initRect.x - Math.round((candW - initRect.width) / 2)),
        );
        if (candY >= 0 && candY + candH <= imgH && candX + candW <= imgW) {
          newX = candX;
          newY = candY;
          newW = candW;
          newH = candH;
        }
      }
    } else {
      // --- Freeform Resizing ---
      switch (dragHandle) {
        case 'se': {
          newW = Math.max(MIN_SIZE, Math.min(imgW - initRect.x, initRect.width + deltaX));
          newH = Math.max(MIN_SIZE, Math.min(imgH - initRect.y, initRect.height + deltaY));
          break;
        }
        case 'sw': {
          const maxDeltaX = initRect.width - MIN_SIZE;
          const clampedDeltaX = Math.max(-initRect.x, Math.min(maxDeltaX, deltaX));
          newX = initRect.x + clampedDeltaX;
          newW = initRect.width - clampedDeltaX;
          newH = Math.max(MIN_SIZE, Math.min(imgH - initRect.y, initRect.height + deltaY));
          break;
        }
        case 'ne': {
          newW = Math.max(MIN_SIZE, Math.min(imgW - initRect.x, initRect.width + deltaX));
          const maxDeltaY = initRect.height - MIN_SIZE;
          const clampedDeltaY = Math.max(-initRect.y, Math.min(maxDeltaY, deltaY));
          newY = initRect.y + clampedDeltaY;
          newH = initRect.height - clampedDeltaY;
          break;
        }
        case 'nw': {
          const maxDeltaX = initRect.width - MIN_SIZE;
          const clampedDeltaX = Math.max(-initRect.x, Math.min(maxDeltaX, deltaX));
          newX = initRect.x + clampedDeltaX;
          newW = initRect.width - clampedDeltaX;

          const maxDeltaY = initRect.height - MIN_SIZE;
          const clampedDeltaY = Math.max(-initRect.y, Math.min(maxDeltaY, deltaY));
          newY = initRect.y + clampedDeltaY;
          newH = initRect.height - clampedDeltaY;
          break;
        }
        case 'e': {
          newW = Math.max(MIN_SIZE, Math.min(imgW - initRect.x, initRect.width + deltaX));
          break;
        }
        case 'w': {
          const maxDeltaX = initRect.width - MIN_SIZE;
          const clampedDeltaX = Math.max(-initRect.x, Math.min(maxDeltaX, deltaX));
          newX = initRect.x + clampedDeltaX;
          newW = initRect.width - clampedDeltaX;
          break;
        }
        case 's': {
          newH = Math.max(MIN_SIZE, Math.min(imgH - initRect.y, initRect.height + deltaY));
          break;
        }
        case 'n': {
          const maxDeltaY = initRect.height - MIN_SIZE;
          const clampedDeltaY = Math.max(-initRect.y, Math.min(maxDeltaY, deltaY));
          newY = initRect.y + clampedDeltaY;
          newH = initRect.height - clampedDeltaY;
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

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
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

  const effectiveCrop = cropRect || {
    x: 0,
    y: 0,
    width: sourceDimensions.width,
    height: sourceDimensions.height,
  };

  const isCropActive =
    Boolean(cropRect) &&
    (effectiveCrop.x > 0 ||
      effectiveCrop.y > 0 ||
      effectiveCrop.width < sourceDimensions.width ||
      effectiveCrop.height < sourceDimensions.height);

  const cropPct = {
    left: (effectiveCrop.x / Math.max(1, sourceDimensions.width)) * 100,
    top: (effectiveCrop.y / Math.max(1, sourceDimensions.height)) * 100,
    width: (effectiveCrop.width / Math.max(1, sourceDimensions.width)) * 100,
    height: (effectiveCrop.height / Math.max(1, sourceDimensions.height)) * 100,
  };

  const displayImageUrl = isCropMode ? sourceImageUrl : (resultImageUrl || sourceImageUrl);

  return (
    <Box>
      {/* Top Action Bar when in Crop Mode */}
      {isCropMode && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={1.5}
          p={1.2}
          sx={{
            borderRadius: 2,
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            border: `1px solid ${colorTokens.accent.violet}`,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Crop size={16} color={colorTokens.accent.violetLight} />
            <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '0.82rem' }}>
              Interactive Crop Mode
            </Typography>
            <Typography variant="caption" sx={{ color: colorTokens.text.muted, display: { xs: 'none', sm: 'inline' } }}>
              (Drag handles to resize / reposition)
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            {/* Lock / Unlock Ratio Toggle */}
            <Button
              size="small"
              onClick={toggleRatioLock}
              startIcon={isRatioLocked ? <Lock size={12} /> : <Unlock size={12} />}
              sx={{
                height: 28,
                borderRadius: 1.5,
                fontSize: '0.72rem',
                fontWeight: 600,
                textTransform: 'none',
                px: 1.2,
                border: isRatioLocked
                  ? `1px solid ${colorTokens.accent.violet}`
                  : '1px solid rgba(255, 255, 255, 0.2)',
                backgroundColor: isRatioLocked ? colorTokens.accent.violet : 'transparent',
                color: isRatioLocked ? '#ffffff !important' : colorTokens.text.secondary,
                '&:hover': {
                  backgroundColor: isRatioLocked ? colorTokens.accent.violetLight : 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                },
              }}
            >
              {isRatioLocked ? 'Ratio Locked' : 'Unlock Ratio'}
            </Button>

            {/* Reset Crop */}
            {isCropActive && onResetCrop && (
              <Button
                size="small"
                startIcon={<RotateCcw size={12} />}
                onClick={onResetCrop}
                sx={{
                  height: 28,
                  fontSize: '0.72rem',
                  color: colorTokens.text.muted,
                  '&:hover': { color: colorTokens.accent.rose },
                }}
              >
                Reset
              </Button>
            )}

            {/* Cancel Button */}
            {onCancelCrop && (
              <Button
                size="small"
                startIcon={<X size={13} />}
                onClick={onCancelCrop}
                sx={{
                  height: 28,
                  borderRadius: 1.5,
                  fontSize: '0.72rem',
                  textTransform: 'none',
                  color: colorTokens.text.muted,
                  '&:hover': { color: '#ffffff', backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                }}
              >
                Cancel
              </Button>
            )}

            {/* Apply Crop Button */}
            {onApplyCrop && (
              <Button
                size="small"
                variant="contained"
                startIcon={<Check size={13} />}
                onClick={onApplyCrop}
                sx={{
                  height: 28,
                  borderRadius: 1.5,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                  color: '#ffffff',
                  boxShadow: '0 2px 10px rgba(139, 92, 246, 0.35)',
                }}
              >
                Apply Crop
              </Button>
            )}
          </Stack>
        </Stack>
      )}

      {/* Main Viewport Container */}
      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: 340, sm: 460, md: 540 },
          borderRadius: 2.5,
          overflow: 'hidden',
          backgroundColor: '#09090b',
          backgroundImage:
            'linear-gradient(45deg, #18181b 25%, transparent 25%), linear-gradient(-45deg, #18181b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #18181b 75%), linear-gradient(-45deg, transparent 75%, #18181b 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        {displayImageUrl ? (
          <Box
            component="img"
            ref={imgRef}
            src={displayImageUrl}
            alt="Studio Canvas"
            onLoad={updateRenderedBounds}
            sx={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              display: 'block',
              pointerEvents: 'none',
            }}
          />
        ) : (
          <CircularProgress size={32} color="secondary" />
        )}

        {/* Interactive Moveable & Resizable Crop Overlay (Only shown in Crop Mode) */}
        {isCropMode && renderedBounds && (
          <Box
            sx={{
              position: 'absolute',
              left: renderedBounds.left,
              top: renderedBounds.top,
              width: renderedBounds.width,
              height: renderedBounds.height,
              pointerEvents: 'auto',
            }}
          >
            {/* Crop Rectangle Box */}
            <Box
              onPointerDown={e => handlePointerDown(e, 'move')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              sx={{
                position: 'absolute',
                left: `${cropPct.left}%`,
                top: `${cropPct.top}%`,
                width: `${cropPct.width}%`,
                height: `${cropPct.height}%`,
                boxSizing: 'border-box',
                border: `2px dashed ${colorTokens.accent.violet}`,
                borderRadius: circular || activePreset === 'circular' ? '50%' : 0,
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
                  borderColor: colorTokens.accent.violetLight,
                },
              }}
            >
              {/* Drag & Resize Hint Badge in Center */}
              <Box
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.85)',
                  backdropFilter: 'blur(6px)',
                  border: `1px solid rgba(139, 92, 246, 0.5)`,
                  borderRadius: 1.5,
                  px: 1,
                  py: 0.3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  pointerEvents: 'none',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {Math.round(effectiveCrop.width)}×{Math.round(effectiveCrop.height)} (X:{Math.round(effectiveCrop.x)}, Y:{Math.round(effectiveCrop.y)})
                </Typography>
              </Box>

              {/* 4 Corner Resize Handles */}
              {/* Top-Left */}
              <Box
                onPointerDown={e => handlePointerDown(e, 'nw')}
                sx={{
                  position: 'absolute',
                  top: -6,
                  left: -6,
                  width: 14,
                  height: 14,
                  backgroundColor: '#ffffff',
                  border: `2px solid ${colorTokens.accent.violet}`,
                  borderRadius: '2px',
                  cursor: 'nwse-resize',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
                  zIndex: 6,
                }}
              />
              {/* Top-Right */}
              <Box
                onPointerDown={e => handlePointerDown(e, 'ne')}
                sx={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  width: 14,
                  height: 14,
                  backgroundColor: '#ffffff',
                  border: `2px solid ${colorTokens.accent.violet}`,
                  borderRadius: '2px',
                  cursor: 'nesw-resize',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
                  zIndex: 6,
                }}
              />
              {/* Bottom-Left */}
              <Box
                onPointerDown={e => handlePointerDown(e, 'sw')}
                sx={{
                  position: 'absolute',
                  bottom: -6,
                  left: -6,
                  width: 14,
                  height: 14,
                  backgroundColor: '#ffffff',
                  border: `2px solid ${colorTokens.accent.violet}`,
                  borderRadius: '2px',
                  cursor: 'nesw-resize',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
                  zIndex: 6,
                }}
              />
              {/* Bottom-Right */}
              <Box
                onPointerDown={e => handlePointerDown(e, 'se')}
                sx={{
                  position: 'absolute',
                  bottom: -6,
                  right: -6,
                  width: 14,
                  height: 14,
                  backgroundColor: '#ffffff',
                  border: `2px solid ${colorTokens.accent.violet}`,
                  borderRadius: '2px',
                  cursor: 'nwse-resize',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
                  zIndex: 6,
                }}
              />

              {/* 4 Edge Resize Handles */}
              {/* Top Edge */}
              <Box
                onPointerDown={e => handlePointerDown(e, 'n')}
                sx={{
                  position: 'absolute',
                  top: -4,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 24,
                  height: 6,
                  backgroundColor: '#ffffff',
                  border: `1px solid ${colorTokens.accent.violet}`,
                  borderRadius: 1,
                  cursor: 'ns-resize',
                  zIndex: 5,
                }}
              />
              {/* Bottom Edge */}
              <Box
                onPointerDown={e => handlePointerDown(e, 's')}
                sx={{
                  position: 'absolute',
                  bottom: -4,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 24,
                  height: 6,
                  backgroundColor: '#ffffff',
                  border: `1px solid ${colorTokens.accent.violet}`,
                  borderRadius: 1,
                  cursor: 'ns-resize',
                  zIndex: 5,
                }}
              />
              {/* Left Edge */}
              <Box
                onPointerDown={e => handlePointerDown(e, 'w')}
                sx={{
                  position: 'absolute',
                  left: -4,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 6,
                  height: 24,
                  backgroundColor: '#ffffff',
                  border: `1px solid ${colorTokens.accent.violet}`,
                  borderRadius: 1,
                  cursor: 'ew-resize',
                  zIndex: 5,
                }}
              />
              {/* Right Edge */}
              <Box
                onPointerDown={e => handlePointerDown(e, 'e')}
                sx={{
                  position: 'absolute',
                  right: -4,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 6,
                  height: 24,
                  backgroundColor: '#ffffff',
                  border: `1px solid ${colorTokens.accent.violet}`,
                  borderRadius: 1,
                  cursor: 'ew-resize',
                  zIndex: 5,
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};
