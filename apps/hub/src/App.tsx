import React, { useState, useEffect, useMemo, Suspense, lazy, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  AppHeader,
  BentoGrid,
  ToolCard,
  SpotlightSearch,
  GlassCard,
  QuickAccessShelf,
} from '@varia/ui';
import { REGISTERED_TOOLS } from './registry/tools';
import { TOOL_CATEGORIES, type ToolCategory, type VariaToolManifest } from '@varia/core';
import { useUserPreferences } from './hooks/useUserPreferences';

const AudioConverterTool = lazy(() => import('./tools/audio-converter/AudioConverterTool'));
const YouTubeDownloaderTool = lazy(
  () => import('./tools/youtube-downloader/YouTubeDownloaderTool'),
);
const GifStudioTool = lazy(() => import('./tools/gif-studio/GifStudioTool'));
const ImageStudioTool = lazy(() => import('./tools/image-studio/ImageStudioTool'));
const PatternsStudio = lazy(() =>
  import('./components/patterns/PatternsStudio').then(m => ({ default: m.PatternsStudio })),
);

const DEFAULT_TITLE = 'Varia — Minimalist Everyday Digital Toolkit';

type FilterCategory = ToolCategory | 'all' | 'favorites';

const App: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [activeModalTool, setActiveModalTool] = useState<VariaToolManifest | null>(null);
  const [activeWorkspaceTool, setActiveWorkspaceTool] = useState<VariaToolManifest | null>(null);
  const [isPatternsView, setIsPatternsView] = useState<boolean>(false);

  const {
    favoriteToolIds,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    reorderFavorites,
  } = useUserPreferences();

  // Map favorite IDs to full tool manifests, maintaining custom order
  const favoriteTools = useMemo(() => {
    return favoriteToolIds
      .map(id => REGISTERED_TOOLS.find(t => t.id === id))
      .filter((t): t is VariaToolManifest => Boolean(t));
  }, [favoriteToolIds]);

  // Helper to extract base path (e.g. /varia on GitHub Pages)
  const getBasePath = useCallback((): string => {
    const pathname = window.location.pathname;
    const match = pathname.match(/^\/([^/]+)/);
    if (match && match[1] && !REGISTERED_TOOLS.some(t => t.route === `/${match[1]}`)) {
      return `/${match[1]}`;
    }
    return '';
  }, []);

  // Helper to find a tool by current path
  const findToolByPath = useCallback(
    (pathname: string): VariaToolManifest | null => {
      const basePath = getBasePath();
      const cleanPath =
        (basePath ? pathname.replace(basePath, '') : pathname).replace(/\/$/, '') || '/';
      return (
        REGISTERED_TOOLS.find(
          t =>
            t.route === cleanPath ||
            t.route === `/tools${cleanPath}` ||
            `/tools/${t.id}` === cleanPath,
        ) || null
      );
    },
    [getBasePath],
  );

  // Handle URL changes & back/forward navigation
  const syncRouteWithState = useCallback(() => {
    const currentPath = window.location.pathname;
    const basePath = getBasePath();
    const relativePath =
      (basePath ? currentPath.replace(basePath, '') : currentPath).replace(/\/$/, '') || '/';

    if (relativePath === '/' || relativePath === '') {
      setIsPatternsView(false);
      setActiveWorkspaceTool(null);
      setActiveModalTool(null);
      document.title = DEFAULT_TITLE;
      return;
    }

    if (relativePath === '/patterns' || relativePath.startsWith('/patterns')) {
      setIsPatternsView(true);
      setActiveWorkspaceTool(null);
      setActiveModalTool(null);
      document.title = 'Design Patterns Lab — Varia';
      return;
    }

    setIsPatternsView(false);
    const matchedTool = findToolByPath(currentPath);
    if (matchedTool) {
      if (matchedTool.component) {
        setActiveWorkspaceTool(matchedTool);
        setActiveModalTool(null);
      } else {
        setActiveWorkspaceTool(null);
        setActiveModalTool(matchedTool);
      }
      document.title = `${matchedTool.name} — Varia`;
    } else {
      setActiveWorkspaceTool(null);
      setActiveModalTool(null);
      document.title = DEFAULT_TITLE;
    }
  }, [findToolByPath, getBasePath]);

  // Initial load from URL + listen to popstate (browser back/forward)
  useEffect(() => {
    syncRouteWithState();

    const handlePopState = () => {
      syncRouteWithState();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [syncRouteWithState]);

  // Select tool handler (updates URL to /tool-name)
  const handleSelectTool = (tool: VariaToolManifest) => {
    const basePath = getBasePath();
    setIsPatternsView(false);
    window.history.pushState({ toolId: tool.id }, '', `${basePath}${tool.route}`);
    document.title = `${tool.name} — Varia`;

    if (tool.component) {
      setActiveWorkspaceTool(tool);
      setActiveModalTool(null);
    } else {
      setActiveModalTool(tool);
    }
  };

  // Back to Hub handler (updates URL to /)
  const handleBackToHub = () => {
    const basePath = getBasePath();
    setIsPatternsView(false);
    setActiveWorkspaceTool(null);
    setActiveModalTool(null);
    window.history.pushState({}, '', `${basePath}/`);
    document.title = DEFAULT_TITLE;
  };

  // Switch between Tools and Design Patterns Lab
  const handleHeaderTabChange = (tab: 'tools' | 'patterns') => {
    const basePath = getBasePath();
    if (tab === 'patterns') {
      setIsPatternsView(true);
      setActiveWorkspaceTool(null);
      setActiveModalTool(null);
      window.history.pushState({}, '', `${basePath}/patterns`);
      document.title = 'Design Patterns Lab — Varia';
    } else {
      handleBackToHub();
    }
  };

  const filteredTools = useMemo(() => {
    if (selectedCategory === 'favorites') {
      return favoriteTools;
    }
    if (selectedCategory === 'all') {
      return REGISTERED_TOOLS;
    }
    return REGISTERED_TOOLS.filter(t => t.category === selectedCategory);
  }, [selectedCategory, favoriteTools]);

  const categories: Array<{ id: FilterCategory; label: string }> = [
    { id: 'all', label: 'All Utilities' },
    { id: 'favorites', label: `⭐ Favorites (${favoriteTools.length})` },
    { id: 'media', label: 'Media Studio' },
    { id: 'dev', label: 'Developer Tools' },
    { id: 'network', label: 'Network' },
    { id: 'social', label: 'Social & Grabber' },
    { id: 'text', label: 'Text & Docs' },
  ];

  // Render active workspace tool if selected
  if (activeWorkspaceTool) {
    return (
      <Suspense
        fallback={
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress sx={{ color: '#8b5cf6' }} />
          </Box>
        }
      >
        {activeWorkspaceTool.id === 'tool-audio-converter' && (
          <AudioConverterTool onBack={handleBackToHub} />
        )}
        {activeWorkspaceTool.id === 'tool-youtube-downloader' && (
          <YouTubeDownloaderTool onBack={handleBackToHub} />
        )}
        {activeWorkspaceTool.id === 'tool-gif-studio' && <GifStudioTool onBack={handleBackToHub} />}
        {activeWorkspaceTool.id === 'tool-image-studio' && (
          <ImageStudioTool onBack={handleBackToHub} />
        )}
      </Suspense>
    );
  }

  // Render Patterns Studio if active
  if (isPatternsView) {
    return (
      <Box sx={{ minHeight: '100vh', pb: 10 }}>
        <AppHeader
          onOpenSearch={() => setSearchOpen(true)}
          toolCount={REGISTERED_TOOLS.length}
          activeTab="patterns"
          onSelectTab={handleHeaderTabChange}
        />
        <Suspense
          fallback={
            <Box
              sx={{
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress sx={{ color: '#06b6d4' }} />
            </Box>
          }
        >
          <PatternsStudio onBackToTools={handleBackToHub} />
        </Suspense>

        <SpotlightSearch
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          tools={REGISTERED_TOOLS}
          onSelectTool={handleSelectTool}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', pb: 10 }}>
      {/* Sticky Header */}
      <AppHeader
        onOpenSearch={() => setSearchOpen(true)}
        toolCount={REGISTERED_TOOLS.length}
        activeTab="tools"
        onSelectTab={handleHeaderTabChange}
      />

      <Container maxWidth="lg" sx={{ pt: { xs: 5, md: 7 } }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2.4rem', md: '3.6rem' },
              background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.03em',
              mb: 2,
            }}
          >
            All your daily digital tools.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#a1a1aa',
              fontSize: { xs: '1rem', md: '1.2rem' },
              maxWidth: 720,
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            A high-performance personal monorepo workspace for audio extraction, GIF editing, UUID
            forge, network speed test and developer utilities.
          </Typography>
        </Box>

        {/* Personalized Quick Access Shelf */}
        <QuickAccessShelf
          favoriteTools={favoriteTools}
          allTools={REGISTERED_TOOLS}
          onSelectTool={handleSelectTool}
          onReorderFavorites={reorderFavorites}
          onRemoveFavorite={removeFavorite}
          onAddFavorite={addFavorite}
        />

        {/* Category Navigation Pills */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            overflowX: 'auto',
            pb: 2,
            mb: 4,
            '&::-webkit-scrollbar': { display: 'none' },
          }}
          justifyContent={{ xs: 'flex-start', md: 'center' }}
        >
          {categories.map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <Chip
                key={cat.id}
                label={cat.label}
                onClick={() => setSelectedCategory(cat.id)}
                clickable
                sx={{
                  px: 1.5,
                  py: 2.2,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  borderRadius: 2.5,
                  transition:
                    'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
                  backgroundColor: isActive ? '#8b5cf6' : 'rgba(255, 255, 255, 0.04)',
                  color: isActive ? '#ffffff' : '#a1a1aa',
                  border: `1px solid ${isActive ? '#8b5cf6' : 'rgba(255, 255, 255, 0.06)'}`,
                  '&:hover': {
                    backgroundColor: isActive ? '#7c3aed' : 'rgba(255, 255, 255, 0.08)',
                    borderColor: isActive ? '#7c3aed' : 'rgba(255, 255, 255, 0.15)',
                  },
                }}
              />
            );
          })}
        </Stack>

        {/* Bento Grid Tool Showcase */}
        <BentoGrid columns={{ xs: 1, sm: 2, md: 3, lg: 3 }}>
          {filteredTools.map(tool => (
            <ToolCard
              key={tool.id}
              tool={tool}
              isFavorite={isFavorite(tool.id)}
              onToggleFavorite={toggleFavorite}
              onClick={() => handleSelectTool(tool)}
            />
          ))}
        </BentoGrid>
      </Container>

      {/* Spotlight Command Search Modal (Ctrl+K) */}
      <SpotlightSearch
        tools={REGISTERED_TOOLS}
        favoriteToolIds={favoriteToolIds}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectTool={tool => handleSelectTool(tool)}
        onToggleFavorite={toggleFavorite}
      />

      {/* Tool Launch Modal (for tools without interactive view yet) */}
      {activeModalTool && (
        <Dialog
          open={Boolean(activeModalTool)}
          onClose={handleBackToHub}
          maxWidth="sm"
          fullWidth
          disableScrollLock
          PaperProps={{
            sx: {
              backgroundColor: '#121217',
              borderRadius: 3.5,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>{activeModalTool.name}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: '#a1a1aa', mb: 2 }}>
              {activeModalTool.description}
            </Typography>
            <GlassCard sx={{ p: 2 }}>
              <Typography
                variant="caption"
                sx={{ color: '#8b5cf6', fontWeight: 600, display: 'block', mb: 0.5 }}
              >
                Module Route: {activeModalTool.route}
              </Typography>
              <Typography variant="body2" sx={{ color: '#71717a', fontSize: '0.8rem' }}>
                This tool belongs to the <b>{TOOL_CATEGORIES[activeModalTool.category]?.name}</b>{' '}
                module. When this tool is developed in future steps, its fully interactive workspace
                component will render here.
              </Typography>
            </GlassCard>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button onClick={handleBackToHub} variant="outlined">
              Close
            </Button>
            <Button onClick={handleBackToHub} variant="contained">
              Ready to Build
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default App;
