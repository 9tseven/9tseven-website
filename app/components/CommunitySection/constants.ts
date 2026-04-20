interface Image {
  id: number;
  src: string;
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
    src: "",
    alt: "",
    width: 0,
    height: 0,
    sizes: "100vw",
  },
];
