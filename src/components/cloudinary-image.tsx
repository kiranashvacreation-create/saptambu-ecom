import Image, { type ImageProps } from "next/image";
import { cloudinaryImageLoader, isCloudinaryImage } from "@/lib/cloudinary-url";

type Props = Omit<ImageProps, "loader">;

export function CloudinaryImage(props: Props) {
  if (isCloudinaryImage(props.src)) {
    return <Image {...props} alt={props.alt} loader={cloudinaryImageLoader} />;
  }

  return <Image {...props} alt={props.alt} />;
}
