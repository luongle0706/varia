/**
 * FFmpeg Log Streams and Media Job Test Fixtures
 */

export const MOCK_FFMPEG_LOGS = {
  progress25: 'frame=  120 fps=60.0 q=-1.0 size=    256kB time=00:00:15.00 bitrate= 139.8kbits/s speed=5.4x',
  progress50: 'frame=  240 fps=60.0 q=-1.0 size=    512kB time=00:00:30.00 bitrate= 139.8kbits/s speed=5.4x',
  progress75: 'frame=  360 fps=60.0 q=-1.0 size=    768kB time=00:00:45.00 bitrate= 139.8kbits/s speed=5.4x',
  progress100: 'frame=  480 fps=60.0 q=-1.0 size=   1024kB time=00:01:00.00 bitrate= 139.8kbits/s speed=5.4x',
  errorUnsupportedCodec: 'Error while opening encoder for output stream #0:0 - maybe incorrect parameters such as bit_rate, rate, width or height',
  successStreamMapping: 'Stream mapping:\n  Stream #0:0 -> #0:0 (copy)\n  Stream #0:1 -> #0:1 (libmp3lame -> mp3)',
};

export const MOCK_YTDLP_LOGS = {
  downloadProgress: '[download]  45.2% of ~12.34MiB at 10.50MiB/s ETA 00:03',
  destination: '[download] Destination: Rick Astley - Never Gonna Give You Up.mp4',
  ffmpegMerge: '[Merger] Merging formats into "Rick Astley - Never Gonna Give You Up.mp4"',
  completed: '[download] 100% of 12.34MiB in 00:01',
};

export const SAMPLE_AUDIO_CONVERSION_PRESETS = [
  { format: 'mp3', bitrate: '320k', expectedCodec: 'libmp3lame' },
  { format: 'wav', bitrate: undefined, expectedCodec: 'pcm_s16le' },
  { format: 'aac', bitrate: '256k', expectedCodec: 'aac' },
  { format: 'flac', bitrate: undefined, expectedCodec: 'flac' },
  { format: 'ogg', bitrate: '192k', expectedCodec: 'libvorbis' },
];
