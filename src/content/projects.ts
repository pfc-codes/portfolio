export interface Project {
  slug: string;
  number: string;
  title: string;
  study: string;
  category: string;
  summary: string;
  description: string;
  observation: string;
  video: string;
  poster: string;
  frames: { src: string; alt: string; time: string }[];
  duration: number;
  fps: number;
  visualDescription: string;
}

// Project identities and film mapping supplied by Pietro. Copy describes the
// visible studies; it does not assert unconfirmed clients, dates, or processes.
export const projects: Project[] = [
  {
    slug: "time-block",
    number: "01",
    title: "Time Block",
    study: "Jordan",
    category: "Temporal manipulation / Spatial media",
    summary:
      "Movement becomes a volume. A moment opens into a structure you can see around.",
    description:
      "Time Block explores the relationship between a moving image and a spatial object. In this study, Jordan, a rectangular image plane opens into a trail of repeated forms, giving movement a visible depth.",
    observation:
      "The frame becomes a point of reference as motion extends beyond it. Repetition makes the passage of time legible as shape: clustered in some places, stretched into a ribbon in others.",
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
    visualDescription:
      "A rectangular image plane floats in black space. Pale, repeated shapes extend from it, forming a twisting trail as the viewpoint moves around the structure. The film is silent.",
  },
  {
    slug: "depth-echo",
    number: "02",
    title: "Depth Echo",
    study: "Water Dance",
    category: "Experimental video / Spatial media",
    summary:
      "A gesture leaves a trace. The moving body unfolds through layers of time.",
    description:
      "Depth Echo explores movement through the traces it leaves behind. Water Dance follows a figure whose gestures expand into layered, translucent forms against a dark field.",
    observation:
      "The body shifts between a recognizable figure and an abstract shape. Successive positions appear together, letting a short gesture linger as a larger, changing form.",
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
    visualDescription:
      "A pale figure moves in black space. Its limbs and body stretch into overlapping, translucent layers, shifting from a vertical gesture into a broad, floating form. The film is silent.",
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
  "/lab/",
  "/lab/spatial-study/",
  "/lab/frame-study/",
  "/about/",
  "/contact/",
  "/404.html",
];
