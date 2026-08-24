import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Box, Typography, Stack, Button, Portal } from '@mui/material';
import {
  Zap,
  Plus,
  Sparkles,
  GripVertical,
  FileAudio,
  Film,
  Code2,
  Activity,
  Download,
  FileText,
  Key,
  ShieldCheck,
  Image as ImageIcon,
  Wand2,
} from 'lucide-react';
import { colorTokens } from '../../theme/tokens';
import type { VariaToolManifest } from '@varia/core';
import { QuickAccessItem } from './QuickAccessItem';
import { DragRemovalZone } from './DragRemovalZone';
import { AddToolPopover } from './AddToolPopover';

const ICON_MAP: Record<string, React.ReactNode> = {
  audio: <FileAudio size={18} color={colorTokens.accent.violet} />,
  gif: <Film size={18} color="#ec4899" />,
  image: <ImageIcon size={18} color="#ec4899" />,
  uuid: <Key size={18} color={colorTokens.accent.violet} />,
  hash: <ShieldCheck size={18} color={colorTokens.accent.cyan} />,
  speed: <Activity size={18} color={colorTokens.accent.cyan} />,
  social: <Download size={18} color={colorTokens.accent.amber} />,
  code: <Code2 size={18} color={colorTokens.accent.violet} />,
  text: <FileText size={18} color={colorTokens.accent.emerald} />,
  default: <Wand2 size={18} color={colorTokens.accent.violet} />,
};

export interface QuickAccessShelfProps {
  favoriteTools: VariaToolManifest[];
  allTools: VariaToolManifest[];
  onSelectTool: (tool: VariaToolManifest) => void;
  onReorderFavorites: (newOrderedIds: string[]) => void;
  onRemoveFavorite: (toolId: string) => void;
  onAddFavorite: (toolId: string) => void;
}

export const QuickAccessShelf: React.FC<QuickAccessShelfProps> = memo(
  ({
    favoriteTools,
    allTools,
    onSelectTool,
    onReorderFavorites,
    onRemoveFavorite,
    onAddFavorite,
  }) => {
    const shelfRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const previewRef = useRef<HTMLDivElement | null>(null);

    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [insertionIndex, setInsertionIndex] = useState<number | null>(null);
    const [isOutsideShelf, setIsOutsideShelf] = useState(false);
    const [addAnchorEl, setAddAnchorEl] = useState<HTMLElement | null>(null);

    // Refs to avoid heavy re-renders during 60fps drag
    const dragIndexRef = useRef<number | null>(null);
    const insertionIndexRef = useRef<number | null>(null);
    const isOutsideShelfRef = useRef(false);
    const justFinishedDragRef = useRef(false);
    const grabOffsetRef = useRef<{ x: number; y: number }>({ x: 20, y: 20 });
    const favoriteToolsRef = useRef(favoriteTools);
    favoriteToolsRef.current = favoriteTools;

    const handleSelectSafe = useCallback(
      (tool: VariaToolManifest) => {
        if (justFinishedDragRef.current || dragIndexRef.current !== null) {
          return;
        }
        onSelectTool(tool);
      },
      [onSelectTool],
    );

    // Start drag immediately on 6-dots icon handle pointer down
    const handleStartDrag = useCallback(
      (e: React.PointerEvent, index: number) => {
        if (e.button !== 0) return;

        const targetCard = (e.currentTarget as HTMLElement).closest('[data-quick-access-item]');
        if (targetCard) {
          const rect = targetCard.getBoundingClientRect();
          grabOffsetRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          };
        }

        setDragIndex(index);
        setInsertionIndex(index);
        dragIndexRef.current = index;
        insertionIndexRef.current = index;
        isOutsideShelfRef.current = false;
        setIsOutsideShelf(false);

        // Position preview immediately
        if (previewRef.current) {
          const x = e.clientX - grabOffsetRef.current.x;
          const y = e.clientY - grabOffsetRef.current.y;
          previewRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(2.5deg)`;
        }
      },
      [],
    );

    // Ultra-smooth Window Pointer Tracking using direct DOM transform and discrete state updates
    useEffect(() => {
      if (dragIndex === null) return;

      let rafId: number | null = null;
      let latestX = 0;
      let latestY = 0;

      const updatePosition = () => {
        if (previewRef.current) {
          const x = latestX - grabOffsetRef.current.x;
          const y = latestY - grabOffsetRef.current.y;
          previewRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(2.5deg)`;
        }

        const shelfEl = shelfRef.current;
        if (!shelfEl) return;

        const rect = shelfEl.getBoundingClientRect();
        // Check if pointer is outside shelf bounds (with 25px buffer)
        const isOutside =
          latestX < rect.left - 25 ||
          latestX > rect.right + 25 ||
          latestY < rect.top - 25 ||
          latestY > rect.bottom + 25;

        if (isOutside !== isOutsideShelfRef.current) {
          isOutsideShelfRef.current = isOutside;
          setIsOutsideShelf(isOutside);
        }

        if (!isOutside && containerRef.current) {
          const itemElements = Array.from(
            containerRef.current.querySelectorAll('[data-quick-access-item]'),
          );

          if (itemElements.length === 0) {
            if (insertionIndexRef.current !== 0) {
              insertionIndexRef.current = 0;
              setInsertionIndex(0);
            }
            return;
          }

          let calculatedIndex = itemElements.length;

          for (let i = 0; i < itemElements.length; i++) {
            const itemEl = itemElements[i];
            if (!itemEl) continue;
            const itemRect = itemEl.getBoundingClientRect();
            const midpoint = itemRect.left + itemRect.width / 2;

            if (latestX < midpoint) {
              calculatedIndex = i;
              break;
            }
          }

          if (calculatedIndex !== insertionIndexRef.current) {
            insertionIndexRef.current = calculatedIndex;
            setInsertionIndex(calculatedIndex);
          }
        }
      };

      const handleWindowPointerMove = (e: PointerEvent) => {
        if (dragIndexRef.current === null) return;
        latestX = e.clientX;
        latestY = e.clientY;

        if (!rafId) {
          rafId = requestAnimationFrame(() => {
            updatePosition();
            rafId = null;
          });
        }
      };

      const handleWindowPointerUp = () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }

        const fromIdx = dragIndexRef.current;
        const targetInsertIdx = insertionIndexRef.current;
        const isOutside = isOutsideShelfRef.current;

        // Set flag to prevent synthetic click from opening the tool
        justFinishedDragRef.current = true;
        setTimeout(() => {
          justFinishedDragRef.current = false;
        }, 250);

        if (fromIdx !== null) {
          const currentTools = favoriteToolsRef.current;
          const dragged = currentTools[fromIdx];

          if (isOutside && dragged) {
            // Dropped outside -> Remove tool from favorites
            onRemoveFavorite(dragged.id);
          } else if (targetInsertIdx !== null) {
            // Dropped at target insertion position
            const reordered = [...currentTools];
            const [movedItem] = reordered.splice(fromIdx, 1);
            if (movedItem) {
              const finalInsertIdx =
                targetInsertIdx > fromIdx ? targetInsertIdx - 1 : targetInsertIdx;
              reordered.splice(finalInsertIdx, 0, movedItem);
              onReorderFavorites(reordered.map(t => t.id));
            }
          }
        }

        // Reset state
        dragIndexRef.current = null;
        insertionIndexRef.current = null;
        isOutsideShelfRef.current = false;
        setDragIndex(null);
        setInsertionIndex(null);
        setIsOutsideShelf(false);
      };

      window.addEventListener('pointermove', handleWindowPointerMove, { passive: true });
      window.addEventListener('pointerup', handleWindowPointerUp);
      window.addEventListener('pointercancel', handleWindowPointerUp);

      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        window.removeEventListener('pointermove', handleWindowPointerMove);
        window.removeEventListener('pointerup', handleWindowPointerUp);
        window.removeEventListener('pointercancel', handleWindowPointerUp);
      };
    }, [dragIndex, onRemoveFavorite, onReorderFavorites]);

    const draggedTool = dragIndex !== null ? favoriteTools[dragIndex] || null : null;
    const favoriteToolIds = favoriteTools.map(t => t.id);

    return (
      <>
        {/* Drag Removal Zone: dims page when pointer moves outside shelf */}
        <DragRemovalZone
          isDragging={isOutsideShelf && dragIndex !== null}
          draggedTool={draggedTool}
        />

        {/* Floating Preview Card Following Mouse Cursor with Hardware Acceleration */}
        {draggedTool && (
          <Portal>
            <Box
              ref={previewRef}
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: { xs: 180, sm: 210 },
                pointerEvents: 'none',
                zIndex: 10001,
                backgroundColor: isOutsideShelf
                  ? 'rgba(40, 15, 20, 0.95)'
                  : 'rgba(20, 20, 26, 0.96)',
                border: `1.5px solid ${isOutsideShelf ? colorTokens.accent.rose : colorTokens.accent.violet
                  }`,
                borderRadius: 2.5,
                p: 1.5,
                boxShadow: isOutsideShelf
                  ? '0 15px 30px rgba(0,0,0,0.8), 0 0 20px rgba(244, 63, 94, 0.4)'
                  : '0 15px 30px rgba(0, 0, 0, 0.8), 0 0 16px rgba(139, 92, 246, 0.3)',
                willChange: 'transform',
                transition: 'border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    color: isOutsideShelf
                      ? colorTokens.accent.rose
                      : colorTokens.accent.violetLight,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <GripVertical size={16} />
                </Box>
                <Box
                  sx={{
                    p: 0.8,
                    borderRadius: 1.5,
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {ICON_MAP[draggedTool.icon] || ICON_MAP.default}
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="subtitle2"
                    noWrap
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: isOutsideShelf ? colorTokens.accent.rose : colorTokens.text.primary,
                    }}
                  >
                    {draggedTool.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{
                      display: 'block',
                      color: isOutsideShelf ? '#fca5a5' : colorTokens.accent.violetLight,
                      fontSize: '0.72rem',
                      fontWeight: 600,
                    }}
                  >
                    {isOutsideShelf ? 'Drop to Remove ✕' : 'Moving...'}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Portal>
        )}

        {/* Shelf Container */}
        <Box
          ref={shelfRef}
          sx={{
            mb: 4,
            p: { xs: 2, sm: 2.5 },
            backgroundColor: colorTokens.bg.surface,
            backdropFilter: 'blur(16px)',
            border: `1px solid ${dragIndex !== null ? colorTokens.accent.violet : colorTokens.bg.border
              }`,
            borderRadius: 3.5,
            boxShadow:
              dragIndex !== null
                ? '0 0 25px rgba(139, 92, 246, 0.2), 0 8px 32px rgba(0, 0, 0, 0.35)'
                : '0 8px 32px rgba(0, 0, 0, 0.35)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          {/* Header row with Title and Drag Hint */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={1.5}
            flexWrap="wrap"
            gap={1}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  p: 0.6,
                  borderRadius: 1.5,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zap size={15} color="#ffffff" />
              </Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  letterSpacing: '-0.01em',
                  color: colorTokens.text.primary,
                }}
              >
                Quick Access
              </Typography>
            </Stack>

            {/* + Add Tool Button */}
            <Button
              size="small"
              onClick={e => setAddAnchorEl(e.currentTarget)}
              startIcon={<Plus size={14} />}
              sx={{
                fontSize: '0.78rem',
                fontWeight: 600,
                py: 0.4,
                px: 1.2,
                borderRadius: 2,
                color: colorTokens.accent.violetLight,
                backgroundColor: 'rgba(139, 92, 246, 0.08)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                transition: 'all 0.15s ease',
                '&:hover': {
                  backgroundColor: 'rgba(139, 92, 246, 0.18)',
                  borderColor: colorTokens.accent.violet,
                  color: '#ffffff',
                },
              }}
            >
              Add Tool
            </Button>
          </Stack>

          {/* Cards Row or Empty State */}
          {favoriteTools.length === 0 ? (
            <Box
              sx={{
                py: 3,
                px: 2,
                borderRadius: 2.5,
                border: '1px dashed rgba(255, 255, 255, 0.1)',
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.015)',
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                justifyContent="center"
                alignItems="center"
                mb={0.5}
              >
                <Sparkles size={16} color={colorTokens.accent.violet} />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: colorTokens.text.secondary }}
                >
                  Your Quick Access shelf is empty
                </Typography>
              </Stack>
              <Typography
                variant="caption"
                sx={{ color: colorTokens.text.muted, display: 'block', mb: 1.5 }}
              >
                Pin your frequent tools by clicking the Star icon on any tool card below or click
                &quot;Add Tool&quot;.
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={e => setAddAnchorEl(e.currentTarget)}
                startIcon={<Plus size={14} />}
                sx={{
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  borderColor: colorTokens.bg.borderHover,
                  color: colorTokens.accent.violetLight,
                }}
              >
                Browse & Pin Tools
              </Button>
            </Box>
          ) : (
            <Box
              ref={containerRef}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                overflowX: 'auto',
                pb: 0.5,
                pt: 0.5,
                '&::-webkit-scrollbar': {
                  height: 6,
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 3,
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              {favoriteTools.map((tool, idx) => {
                const showInsertionBefore =
                  dragIndex !== null && !isOutsideShelf && insertionIndex === idx;

                return (
                  <React.Fragment key={tool.id}>
                    {/* Clean Drop Indicator Line (Before Item) */}
                    {showInsertionBefore && (
                      <Box
                        sx={{
                          width: 2.5,
                          minWidth: 2.5,
                          height: 38,
                          alignSelf: 'center',
                          borderRadius: 2,
                          backgroundColor: colorTokens.accent.violet,
                          boxShadow: '0 0 8px rgba(139, 92, 246, 0.5)',
                          position: 'relative',
                          zIndex: 10,
                          flexShrink: 0,
                        }}
                      />
                    )}

                    <QuickAccessItem
                      tool={tool}
                      index={idx}
                      isBeingDragged={dragIndex === idx}
                      onSelect={handleSelectSafe}
                      onRemove={onRemoveFavorite}
                      onStartDrag={handleStartDrag}
                    />
                  </React.Fragment>
                );
              })}

              {/* Clean Drop Indicator Line (At End of List) */}
              {dragIndex !== null &&
                !isOutsideShelf &&
                insertionIndex === favoriteTools.length && (
                  <Box
                    sx={{
                      width: 2.5,
                      minWidth: 2.5,
                      height: 38,
                      alignSelf: 'center',
                      borderRadius: 2,
                      backgroundColor: colorTokens.accent.violet,
                      boxShadow: '0 0 8px rgba(139, 92, 246, 0.5)',
                      position: 'relative',
                      zIndex: 10,
                      flexShrink: 0,
                    }}
                  />
                )}
            </Box>
          )}
        </Box>

        {/* Add Tool Popover */}
        <AddToolPopover
          open={Boolean(addAnchorEl)}
          anchorEl={addAnchorEl}
          onClose={() => setAddAnchorEl(null)}
          availableTools={allTools}
          favoriteToolIds={favoriteToolIds}
          onAddTool={toolId => {
            onAddFavorite(toolId);
          }}
        />
      </>
    );
  },
);

QuickAccessShelf.displayName = 'QuickAccessShelf';
