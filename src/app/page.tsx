import { VideoSequenceHome } from "@/components/video-sequence-home";
import { deliveryAssets } from "@/lib/cloudinary-assets";

export default function HomePage() {
  return (
    <>
      <link rel="preload" href={deliveryAssets.models.originalBottle} as="fetch" crossOrigin="anonymous" />
      <link rel="preload" href={deliveryAssets.videos.homeFilm.mobile} as="video" type="video/mp4" media="(max-width: 767px)" />
      <link rel="preload" href={deliveryAssets.videos.homeFilm.desktop} as="video" type="video/mp4" media="(min-width: 768px)" />
      <VideoSequenceHome />
    </>
  );
}
