import { VideoSequenceHome } from "@/components/video-sequence-home";

export default function HomePage() {
  return (
    <>
      <link rel="preload" href="/models/saptambu-bottle.glb" as="fetch" crossOrigin="anonymous" />
      <link rel="preload" href="/videos/home-sequence/scene-02.mp4" as="video" type="video/mp4" />
      <VideoSequenceHome />
    </>
  );
}
