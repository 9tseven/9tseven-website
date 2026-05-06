import Image from "next/image";
import { GRAIN_SVG, ACCENT_GRADIENT } from "./constants";

interface SlideProps {
  id: number;
  bg: string;
  image: string;
  video?: string;
  slideCount: number;
  isActive: boolean;
}

export default function Slide({ id, bg, image, video, slideCount, isActive }: SlideProps) {
  return (
    <div
      className="relative h-full shrink-0"
      style={{
        width: `${100 / slideCount}%`,
        backgroundColor: bg,
        backgroundImage: ACCENT_GRADIENT,
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

      {/* Image — always rendered; doubles as poster for video slides */}
      <Image src={image} alt={`Hero slide ${id + 1}`} fill className="object-cover pointer-events-none" sizes="100vw" priority={id === 0} draggable={false} fetchPriority={id === 0 ? "high" : "auto"} />

      {/* Video — mounted only when slide is active so the network request is canceled when the user swipes away */}
      {video && isActive && <video src={video} autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />}

      {/* Readability overlay */}
      <div className="absolute inset-0 bg-bg/35 pointer-events-none" />
    </div>
  );
}
