import React from 'react';
import { ExternalLink, Play } from 'lucide-react';

interface VideoLink {
  embedUrl: string | null;
  platform: string;
}

export const getSocialVideoLink = (rawUrl: string): VideoLink | null => {
  try {
    const url = new URL(rawUrl.trim());
    if (!['https:', 'http:'].includes(url.protocol)) return null;

    const host = url.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
    const pathParts = url.pathname.split('/').filter(Boolean);
    const isDomain = (domain: string) => host === domain || host.endsWith(`.${domain}`);
    const platformName = (name: string) => ({ embedUrl: null, platform: name });

    if (host === 'youtu.be' || isDomain('youtube.com') || isDomain('youtube-nocookie.com')) {
      const videoId = host === 'youtu.be'
        ? pathParts[0]
        : url.searchParams.get('v') || pathParts.find((part, index) => ['embed', 'shorts', 'live'].includes(pathParts[index - 1] || ''));
      if (videoId && /^[\w-]{6,20}$/.test(videoId)) {
        return { embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`, platform: 'YouTube' };
      }
      return platformName('YouTube');
    }

    if (isDomain('tiktok.com')) {
      const videoId = pathParts.find((part, index) => part === 'video' && /^\d+$/.test(pathParts[index + 1] || ''))
        ? pathParts[pathParts.indexOf('video') + 1]
        : pathParts[0] === 'player' && pathParts[1] === 'v1' ? pathParts[2] : null;
      return videoId && /^\d+$/.test(videoId)
        ? { embedUrl: `https://www.tiktok.com/player/v1/${videoId}`, platform: 'TikTok' }
        : platformName('TikTok');
    }

    if (isDomain('instagram.com')) {
      const mediaIndex = pathParts.findIndex((part) => ['reel', 'reels', 'p', 'tv'].includes(part));
      const mediaId = pathParts[mediaIndex + 1];
      if (mediaIndex >= 0 && mediaId && /^[\w-]+$/.test(mediaId)) {
        const mediaType = pathParts[mediaIndex] === 'reels' ? 'reel' : pathParts[mediaIndex];
        return { embedUrl: `https://www.instagram.com/${mediaType}/${mediaId}/embed/`, platform: 'Instagram' };
      }
      return platformName('Instagram');
    }

    if (isDomain('facebook.com') || host === 'fb.watch') {
      const videoIndex = pathParts.findIndex((part) => part === 'videos');
      const videoId = url.searchParams.get('v') || (videoIndex >= 0 ? pathParts[videoIndex + 1] : null);
      if (videoId && /^\d+$/.test(videoId)) {
        const canonical = new URL(url.href);
        canonical.hostname = 'www.facebook.com';
        return {
          embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(canonical.href)}&show_text=false`,
          platform: 'Facebook',
        };
      }
      return platformName('Facebook');
    }

    if (isDomain('x.com') || isDomain('twitter.com')) {
      const statusIndex = pathParts.indexOf('status');
      const statusId = statusIndex >= 0 ? pathParts[statusIndex + 1] : null;
      return statusId && /^\d+$/.test(statusId)
        ? { embedUrl: `https://platform.twitter.com/embed/Tweet.html?id=${statusId}`, platform: 'X' }
        : platformName('X');
    }

    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const videoId = pathParts.find((part) => /^\d+$/.test(part));
      return videoId
        ? { embedUrl: `https://player.vimeo.com/video/${videoId}`, platform: 'Vimeo' }
        : platformName('Vimeo');
    }

    return platformName(host.replace(/^www\./, '').split('.')[0] || 'video');
  } catch {
    return null;
  }
};

interface SocialVideoEmbedProps {
  url?: string | null;
  title: string;
}

/** Shows known social-video providers inline and always keeps a safe new-tab fallback. */
export const SocialVideoEmbed: React.FC<SocialVideoEmbedProps> = ({ url, title }) => {
  const normalizedUrl = url?.trim();
  if (!normalizedUrl) return null;

  const video = getSocialVideoLink(normalizedUrl);
  if (!video) return null;

  return (
    <div className="space-y-2.5 pt-1">
      {video.embedUrl ? (
        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-stone-200 bg-black shadow-inner">
          <iframe
            title={title}
            src={video.embedUrl}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : null}
      <a
        href={normalizedUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-typography-role="button"
        className="invitation-card-action invitation-card-action-compact inline-flex min-h-10 w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-50"
      >
        {video.embedUrl ? <ExternalLink className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
        <span>{video.embedUrl ? `Abrir en ${video.platform}` : `Ver video para llegar en ${video.platform}`}</span>
      </a>
    </div>
  );
};
