const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/dmzwaaf1h";
const COMPRESSED_BOTTLE_VERSION = "draco-17919844";
const HOME_FILM_VERSION = "portrait-mobile-20260528";

function cloudinaryVideo(path: string) {
  return `${CLOUDINARY_BASE_URL}/video/upload/${path}`;
}

function cloudinaryRaw(path: string) {
  return `${CLOUDINARY_BASE_URL}/raw/upload/${path}`;
}

export const localMediaFallbacks = {
  models: {
    originalBottle: `/models/saptambu-bottle.glb?v=${COMPRESSED_BOTTLE_VERSION}`,
    webBottle: "/models/saptambu-bottle-web.glb",
  },
  videos: {
    homeFilm: {
      desktop: `/videos/home-sequence/saptambu-home-desktop.mp4?v=${HOME_FILM_VERSION}`,
      mobile: `/videos/home-sequence/saptambu-home-mobile.mp4?v=${HOME_FILM_VERSION}`,
      poster: `/videos/home-sequence/saptambu-home-poster.jpg?v=${HOME_FILM_VERSION}`,
    },
    homeSequence: {
      scene01: "/videos/home-sequence/scene-01.mp4",
      scene02: "/videos/home-sequence/scene-02.mp4",
      scene03: "/videos/home-sequence/scene-03.mp4",
      scene04: "/videos/home-sequence/scene-04.mp4",
    },
    journey: {
      fireflyDesktop: "/videos/saptambu-firefly-journey-desktop.mp4",
      fireflyMobile: "/videos/saptambu-firefly-journey-mobile.mp4",
      riverDesktopMp4: "/videos/saptambu-river-journey-desktop.mp4",
      riverDesktopWebm: "/videos/saptambu-river-journey-desktop.webm",
      riverMobileMp4: "/videos/saptambu-river-journey-mobile.mp4",
      riverMobileWebm: "/videos/saptambu-river-journey-mobile.webm",
    },
  },
} as const;

export const cloudinaryAssets = {
  models: {
    originalBottle: cloudinaryRaw("saptambu/models/saptambu-bottle.glb"),
    webBottleFallback: cloudinaryRaw("saptambu/models/saptambu-bottle-web.glb"),
  },
  videos: {
    homeFilm: {
      desktop: cloudinaryVideo("saptambu/videos/home-sequence/saptambu-home-desktop.mp4"),
      mobile: cloudinaryVideo("saptambu/videos/home-sequence/saptambu-home-mobile.mp4"),
      poster: `${CLOUDINARY_BASE_URL}/image/upload/saptambu/videos/home-sequence/saptambu-home-poster.jpg`,
    },
    homeSequence: {
      scene01: cloudinaryVideo("saptambu/videos/home-sequence/scene-01.mp4"),
      scene02: cloudinaryVideo("saptambu/videos/home-sequence/scene-02.mp4"),
      scene03: cloudinaryVideo("saptambu/videos/home-sequence/scene-03.mp4"),
      scene04: cloudinaryVideo("saptambu/videos/home-sequence/scene-04.mp4"),
    },
    journey: {
      fireflyDesktop: cloudinaryVideo("saptambu/videos/saptambu-firefly-journey-desktop.mp4"),
      fireflyMobile: cloudinaryVideo("saptambu/videos/saptambu-firefly-journey-mobile.mp4"),
      riverDesktopMp4: cloudinaryVideo("saptambu/videos/saptambu-river-journey-desktop.mp4"),
      riverDesktopWebm: cloudinaryVideo("saptambu/videos/saptambu-river-journey-desktop-webm.webm"),
      riverMobileMp4: cloudinaryVideo("saptambu/videos/saptambu-river-journey-mobile.mp4"),
      riverMobileWebm: cloudinaryVideo("saptambu/videos/saptambu-river-journey-mobile-webm.webm"),
    },
  },
} as const;

export const deliveryAssets = {
  models: {
    originalBottle: localMediaFallbacks.models.originalBottle,
    webBottleFallback: localMediaFallbacks.models.webBottle,
  },
  videos: {
    homeFilm: localMediaFallbacks.videos.homeFilm,
    homeSequence: cloudinaryAssets.videos.homeSequence,
    journey: cloudinaryAssets.videos.journey,
  },
} as const;
