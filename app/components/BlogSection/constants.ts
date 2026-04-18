// app/components/BlogSection/constants.ts

export type BlogPost = {
  id: number;
  tag: string;
  title: string;
  body: string;
  image: string;
  alt: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    tag: "( LINK )",
    title: "NEW COLLECTION - PREVIEW",
    body: "A new collection is on the way.\nBuilt for movement.\n\nDesigned for everyday pace.\nLightweight layers.\nTechnical details.\nA more refined direction.\nThis is a first look.\n\nMore soon.",
    image: "/PhotoSection/photo-section1.jpg",
    alt: "New collection preview",
  },
  {
    id: 2,
    tag: "( LINK )",
    title: "9T7 x NEW BALANCE\nMORE THAN RUNNING",
    body: "A new documentary.\nMore than running.\n\nNot about pace.\nNot about performance.\nAbout the people around it.\nAnd what holds it together.\nA shared routine.\nA reason to show up.\nAnd what happens when that's taken away.\nWhen running is no longer an option.\nAnd everything around it starts to shift.\nBecause it was never just the run.\n\nWatch MORE THAN RUNNING on YouTube.",
    image: "/PhotoSection/photo-section2.jpg",
    alt: "9T7 x New Balance — More Than Running documentary",
  },
  {
    id: 3,
    tag: "( LINK )",
    title: "9TSEVEN & NEW BALANCE 1080v15 CPHFW CELEBRATION",
    body: "As part of Copenhagen Fashion Week, 9TSEVEN and New Balance brought together running, food, art, music and performance to introduce the new NB 1080v15.\n\nThroughout the night, Jonas Erbo ran a full marathon on a treadmill as part of his performance \"Gyldne Tider\" - 12 marathons in 12 months.\n\nAn intimate night where running stepped off the road and into the room.",
    image: "/PhotoSection/photo-section3.jpg",
    alt: "9TSEVEN & New Balance 1080v15 CPHFW celebration event",
  },
];
