import { VideoSequenceHome } from "@/components/video-sequence-home";
import { deliveryAssets } from "@/lib/cloudinary-assets";

export default function HomePage() {
  return (
    <>
      <link rel="preload" href={deliveryAssets.models.originalBottle} as="fetch" crossOrigin="anonymous" />
      <link rel="preload" href={deliveryAssets.videos.homeSequence.scene02} as="video" type="video/mp4" />
      <VideoSequenceHome />
    </>
  );
}
