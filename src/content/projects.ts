export interface Project {
  slug: string;
  number: string;
  title: string;
  study: string;
  category: string;
  video: string;
  poster: string;
  frames: { src: string; alt: string; time: string }[];
  duration: number;
  fps: number;
  posterAlt: string;
}

// Project identities and film mapping supplied by Pietro.
export const projects: Project[] = [
  {
    slug: "time-block",
    number: "01",
    title: "Time Block",
    study: "Jordan",
    category: "Temporal manipulation / Spatial media",
    video: "/media/time-block/jordan.mp4",
    poster: "/media/time-block/poster.webp",
    frames: [
      {
        src: "/media/time-block/frame-01.webp",
        alt: "An image plane with a cluster of pale forms extending from its right edge.",
        time: "00:02.5",
      },
      {
        src: "/media/time-block/frame-02.webp",
        alt: "A flowing trail of repeated forms stretches away from the tilted image plane.",
        time: "00:10.5",
      },
    ],
    duration: 13.04,
    fps: 24,
    posterAlt: "Jordan: an image plane with a trail of repeated pale forms.",
  },
  {
    slug: "depth-echo",
    number: "02",
    title: "Depth Echo",
    study: "Water Dance",
    category: "Experimental video / Spatial media",
    video: "/media/depth-echo/water-dance.mp4",
    poster: "/media/depth-echo/poster.webp",
    frames: [
      {
        src: "/media/depth-echo/frame-01.webp",
        alt: "A pale moving figure and a long, faint vertical trace against black.",
        time: "00:02.8",
      },
      {
        src: "/media/depth-echo/frame-02.webp",
        alt: "The figure unfolds horizontally into multiple soft, overlapping traces.",
        time: "00:09.4",
      },
    ],
    duration: 11.88,
    fps: 25,
    posterAlt: "Water Dance: a pale figure with overlapping traces against black.",
  },
];

export const site = {
  name: "phro.design",
  origin: "https://phro.design",
  email: "pietrofranciscosta@gmail.com",
  instagram: "https://www.instagram.com/p_h_r_o_/",
  youtube: "https://www.youtube.com/@p_h_r_o",
  tiktok: "https://www.tiktok.com/@phrodesign",
};

export const routes = [
  "/",
  "/work/",
  ...projects.map((p) => `/work/${p.slug}/`),
  "/about/",
  "/contact/",
  "/404.html",
];
