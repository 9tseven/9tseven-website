import { StaticImageData } from "next/image";
import Photo1 from "../../../public/PhotoSection/MockPhotos/Community1.jpg";
import Photo2 from "../../../public/PhotoSection/MockPhotos/Community2.jpg";
import Photo3 from "../../../public/PhotoSection/MockPhotos/Community3.jpg";
import Photo4 from "../../../public/PhotoSection/MockPhotos/Community4.jpg";

interface Image {
  id: number;
  src: string | StaticImageData;
  alt: string;
  width: number | string;
  height: number | string;
  sizes: string; //IMPORTANT for fetching right size
  priority?: boolean;
  loading?: string;
}

export const IMAGES: Image[] = [
  {
    id: 1,
    src: Photo1,
    alt: "",
    width: 0,
    height: 0,
    sizes: "100vw",
  },
  {
    id: 2,
    src: Photo2,
    alt: "",
    width: 0,
    height: 0,
    sizes: "100vw",
  },
  {
    id: 3,
    src: Photo3,
    alt: "",
    width: 0,
    height: 0,
    sizes: "100vw",
  },
  {
    id: 4,
    src: Photo4,
    alt: "",
    width: 0,
    height: 0,
    sizes: "100vw",
  },
];
