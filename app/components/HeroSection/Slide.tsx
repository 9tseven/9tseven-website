import Image from "next/image";
import { GRAIN_SVG } from "./constants";

interface SlideProps {
  id: number;
  bg: string;
  accent: string;
  image: string;
  video?: string;
  slideCount: number;
}

export default function Slide({ id, bg, accent, image, video, slideCount }: SlideProps) {
  return (
    <div
      className="relative h-full shrink-0"
      style={{
        width: `${100 / slideCount}%`,
        backgroundColor: bg,
        backgroundImage: accent,
      }}
    >
      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: GRAIN_SVG,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* Hero media */}
      {video ? <video src={video} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover pointer-events-none" /> : <Image src={image} alt={`Hero slide ${id + 1}`} fill className="object-cover pointer-events-none" sizes="100vw" priority={id === 0} draggable={false} />}

      {/* Readability overlay */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
    </div>
  );
}
