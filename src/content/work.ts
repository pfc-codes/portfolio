import importedMedia from "./imported-media.json" with { type: "json" };
import { DITHER } from "../media/dither.ts";

export type CategorySlug =
  | "vfx-music-videos"
  | "audio-visual"
  | "semi-volumetric"
  | "time-block-addon"
  | "time-block-work"
  | "depth-echo"
  | "particle"
  | "point-cloud";
export interface Category {
  slug: CategorySlug;
  title: string;
  description: string;
  related?: string[];
}
export interface Still {
  src: string;
  alt: string;
  width: number;
  height: number;
  focus?: readonly [number, number];
  caption?: string;
}
export interface Film {
  src: string;
  hd?: string;
  width: number;
  height: number;
  duration?: number;
  fps?: number;
  audio?: boolean;
}
export interface ProcessMedia {
  label: string;
  still: Still;
  video?: Film;
}
export interface Entry {
  slug: string;
  title: string;
  category: CategorySlug;
  year: number | null;
  medium: string[];
  tools: string[];
  description?: string;
  draft?: boolean;
  credits?: { artist: string; role: string; url?: string }[];
  links?: { video?: string; store?: string; audio?: string };
  media: {
    poster?: Still;
    loop?: Film;
    film?: Film;
    stills?: Still[];
    youtubeId?: string;
  };
  focus?: readonly [number, number];
  process?: ProcessMedia[];
  tool?: {
    version: string;
    price: string;
    license: string;
    checked: string;
    source: string;
  };
}

export const categories: Category[] = [
  {
    slug: "vfx-music-videos",
    title: "VFX & music videos",
    description: "Visual effects, procedural experiments and music videos.",
  },
  {
    slug: "audio-visual",
    title: "Audio-visual animations",
    description: "Music translated into points, rings and three-dimensional spectrograms.",
  },
  {
    slug: "semi-volumetric",
    title: "Volumetric video",
    description: "LiDAR capture, depth maps and semi-volumetric video.",
    related: ["ozzy"],
  },
  {
    slug: "time-block-addon",
    title: "Time Block — the add-on",
    description: "A Blender tool for turning video into a volume of time.",
  },
  {
    slug: "time-block-work",
    title: "Time Block — work",
    description: "Pieces made with Time Block.",
  },
  {
    slug: "depth-echo",
    title: "Depth Echo",
    description: "Depth, subject masks and video layered through time in 3D space.",
  },
  {
    slug: "particle",
    title: "Particle",
    description: "Particle studies of gravity, accretion and motion in Blender.",
  },
  {
    slug: "point-cloud",
    title: "Point Cloud",
    description: "Real-world scans and transformations between captured objects.",
  },
];

const jordanFilm: Film = {
  src: "/media/time-block/jordan.mp4",
  width: 720,
  height: 1280,
  duration: 13.04,
  fps: 24,
};
const waterFilm: Film = {
  src: "/media/depth-echo/water-dance.mp4",
  width: 720,
  height: 1280,
  duration: 11.88,
  fps: 25,
};
const suppliedMedia = (slug: keyof typeof importedMedia, alt: string): Entry["media"] => {
  const media = importedMedia[slug];
  return { ...media, poster: { ...media.poster, alt } };
};
export const entries: Entry[] = [
  {
    slug: "ozzy",
    title: "Sero Flame — Ozzy",
    category: "vfx-music-videos",
    year: null,
    medium: ["Music video", "VFX", "Monocular depth"],
    tools: ["Video Depth Anything", "Blender"],
    description:
      "Depth-map displacement of Sero Flame and Phoenix for Ozzy. Video Depth Anything generates depth maps that displace 2D planes in Blender.",
    credits: [
      { artist: "Sero Flame", role: "Artist" },
      { artist: "Jabari Browne", role: "VFX", url: "https://jabaribrxwne.com/" },
      { artist: "Pietro Francis Costa", role: "VFX" },
    ],
    links: { video: "https://www.youtube.com/watch?v=aOJ1GtodHKo" },
    media: {
      youtubeId: "aOJ1GtodHKo",
      poster: {
        src: "/media/ozzy/poster.webp",
        alt: "Title card for Sero Flame’s Ozzy music video.",
        width: 1280,
        height: 720,
      },
    },
  },
  {
    slug: "god-particle-found-footage",
    title: "God Particle — found footage",
    category: "vfx-music-videos",
    year: null,
    medium: ["VFX", "Moving image"],
    tools: ["Blender"],
    description:
      "A God Particle rendered as found footage. Modeling, texturing, lighting, compositing, camera tracking and Geometry Nodes were all done in Blender.",
    media: suppliedMedia("god-particle-found-footage", "A glowing blue particle form suspended in a filmed living room."),
  },
  {
    slug: "god-particle",
    title: "God Particle",
    category: "vfx-music-videos",
    year: null,
    medium: ["VFX", "Procedural animation"],
    tools: ["Blender", "Geometry Nodes"],
    description:
      "A procedural God Particle inspired by the television series Dark, created with Geometry Nodes in Blender.",
    media: suppliedMedia("god-particle", "A tangled dark particle form with a blue center against a pale background."),
  },
  {
    slug: "chet-baker-mel-bands",
    title: "Chet Baker — mel bands",
    category: "audio-visual",
    year: null,
    medium: ["Audio visualization", "Moving image"],
    tools: [],
    description:
      "A three-dimensional visualization of a Chet Baker song. Each of 128 mel-frequency bands maps to a horizontal ring of points.",
    credits: [{ artist: "Chet Baker", role: "Music source" }],
    links: { audio: "https://www.instagram.com/reel/Dax7FUNidEI/" },
    media: suppliedMedia("chet-baker-mel-bands", "Horizontal rings of points stacked into a three-dimensional music visualization."),
  },
  {
    slug: "james-blake-spherical-spectrogram",
    title: "James Blake — spherical spectrogram",
    category: "audio-visual",
    year: null,
    medium: ["Audio visualization", "Moving image"],
    tools: ["Blender", "Geometry Nodes"],
    description:
      "A James Blake spectrogram translated into a three-dimensional sphere using Geometry Nodes in Blender.",
    credits: [{ artist: "James Blake", role: "Music source" }],
    links: { audio: "https://www.instagram.com/reel/DZAmQ-_hKGf/" },
    media: suppliedMedia("james-blake-spherical-spectrogram", "A spherical spectrogram formed from dark, closely spaced strands on a pale background."),
  },
  {
    slug: "volumetric-compositor",
    title: "Volumetric video — compositor",
    category: "semi-volumetric",
    year: null,
    medium: ["LiDAR", "Semi-volumetric video"],
    tools: ["Blender", "Compositor"],
    description:
      "Semi-volumetric video captured with LiDAR, then manipulated in Blender using the compositor.",
    media: suppliedMedia("volumetric-compositor", "A captured face fragmented into red and orange points in the Blender compositor."),
  },
  {
    slug: "iphone-lidar",
    title: "iPhone LiDAR — depth capture",
    category: "semi-volumetric",
    year: null,
    medium: ["Depth capture", "Moving image"],
    tools: ["iPhone front camera"],
    description:
      "Real-time depth maps captured using the iPhone front camera.",
    media: suppliedMedia("iphone-lidar", "A color-coded depth map beside the original camera view of a face and upper body."),
  },
  {
    slug: "time-block-addon",
    title: "Time Block",
    category: "time-block-addon",
    year: null,
    medium: ["Blender add-on"],
    tools: ["Blender"],
    description:
      "Turn a video into a three-dimensional block of time. Move and rotate slices through its frames in Blender.",
    links: { store: "https://phr0swork.gumroad.com/l/time-block" },
    media: {
      poster: {
        src: "/media/time-block/frame-02.webp",
        alt: "Jordan, made with Time Block: repeated forms extend from an image plane.",
        width: 480,
        height: 853,
        caption: "Jordan — made with Time Block",
      },
    },
    // Observed on the linked product page on this date, not inferred from release history.
    tool: {
      version: "0.2.2",
      price: "Free / pay what you want",
      license: "GPL-3.0-or-later",
      checked: "2026-10-28",
      source: "https://phr0swork.gumroad.com/l/time-block",
    },
  },
  {
    slug: "jordan",
    title: "Jordan",
    category: "time-block-work",
    year: null,
    medium: ["Moving image"],
    tools: ["Time Block", "Blender"],
    description:
      "A basketball image becomes a volume of time, with repeated forms extending from the video plane. Made with Time Block in Blender.",
    media: {
      film: jordanFilm,
      loop: jordanFilm,
      poster: {
        src: "/media/time-block/poster.webp",
        alt: "Jordan: a basketball image plane forming a volume in black space.",
        width: 720,
        height: 1280,
      },
      stills: [
        {
          src: "/media/time-block/frame-01.webp",
          alt: "An image plane with a cluster of pale forms extending from its right edge.",
          width: 480,
          height: 853,
          caption: "00:02.5",
        },
        {
          src: "/media/time-block/frame-02.webp",
          alt: "A flowing trail of repeated forms stretches away from the tilted image plane.",
          width: 480,
          height: 853,
          caption: "00:10.5",
        },
      ],
    },
  },
  {
    slug: "time-block-viral",
    title: "Time Block — viral video",
    category: "time-block-work",
    year: null,
    medium: ["Moving image", "Video sculpture"],
    tools: ["Time Block", "Blender"],
    description:
      "The Instagram video that started the online 3D/4D block trend, reaching over 100 million views across the internet. Video frames become a volume that can be explored through time.",
    media: suppliedMedia("time-block-viral", "A video plane stretches into a three-dimensional block of successive frames."),
  },
  {
    slug: "roberto-carlos",
    title: "Roberto Carlos — free kick",
    category: "time-block-work",
    year: null,
    medium: ["Moving image", "Video sculpture"],
    tools: ["Time Block", "Blender"],
    description:
      "A video cube captures the movement of Roberto Carlos’ famous free-kick goal, made with my Time Block add-on for Blender.",
    credits: [{ artist: "Roberto Carlos — free-kick goal", role: "Source footage subject" }],
    media: suppliedMedia("roberto-carlos", "Football footage extended into a video cube with a trail tracing the ball’s movement."),
  },
  {
    slug: "water-dance",
    title: "Water Dance",
    category: "depth-echo",
    year: null,
    medium: ["Moving image"],
    tools: ["Depth Echo"],
    description:
      "A moving figure unfolds into overlapping traces through time in Depth Echo.",
    credits: [
      { artist: "AMA — Julie Gautier", role: "Source film", url: "https://www.youtube.com/watch?v=bdBuDg7mrT8" },
    ],
    media: {
      film: waterFilm,
      loop: waterFilm,
      poster: {
        src: "/media/depth-echo/poster.webp",
        alt: "Water Dance: a pale figure with overlapping traces against black.",
        width: 900,
        height: 1600,
      },
      stills: [
        {
          src: "/media/depth-echo/frame-01.webp",
          alt: "A pale moving figure and a long, faint vertical trace against black.",
          width: 480,
          height: 853,
          caption: "00:02.8",
        },
        {
          src: "/media/depth-echo/frame-02.webp",
          alt: "The figure unfolds horizontally into multiple soft, overlapping traces.",
          width: 480,
          height: 853,
          caption: "00:09.4",
        },
      ],
    },
  },
  {
    slug: "cellophane",
    title: "FKA twigs — cellophane",
    category: "depth-echo",
    year: null,
    medium: ["Depth capture", "Moving image"],
    tools: ["Depth Echo"],
    description:
      "Movement from FKA twigs’ cellophane music video, captured and reconstructed with the local Depth Echo app. Depth, a subject mask and the original RGB video combine in 3D space.",
    credits: [{ artist: "FKA twigs — cellophane music video", role: "Source footage" }],
    media: suppliedMedia("cellophane", "A dancer’s captured movement suspended in layered depth traces."),
  },
  {
    slug: "back-on-74",
    title: "Jungle — Back on 74",
    category: "depth-echo",
    year: null,
    medium: ["Depth capture", "Moving image"],
    tools: ["Depth Echo"],
    description:
      "Movement from the choreography in Jungle’s Back on 74, given temporal depth using the local Depth Echo app.",
    credits: [{ artist: "Jungle — Back on 74 music video", role: "Source footage" }],
    media: suppliedMedia("back-on-74", "Dancers from Back on 74 repeated through a volume of captured movement."),
  },
  {
    slug: "jordan-simone",
    title: "Jordan Simone",
    category: "depth-echo",
    year: null,
    medium: ["Dance collaboration", "Moving image"],
    tools: ["Depth Echo"],
    description:
      "A collaboration with dancer Jordan Simone, capturing movement from her pole-dancing routine with Depth Echo.",
    credits: [{ artist: "Jordan Simone", role: "Dancer / collaborator", url: "https://www.instagram.com/jsiim/" }],
    media: suppliedMedia("jordan-simone", "Jordan Simone’s pole-dance movement extended into a layered three-dimensional trace."),
  },
  {
    slug: "accretion-disk",
    title: "Accretion Disk",
    category: "particle",
    year: null,
    medium: ["Particle simulation", "Moving image"],
    tools: ["Blender", "Geometry Nodes"],
    description:
      "A semi-accurate representation of an accretion disk, created using Geometry Nodes in Blender.",
    media: suppliedMedia("accretion-disk", "A luminous particle sphere surrounded by a broad ring of orbiting points."),
  },
  {
    slug: "motion-blur",
    title: "Motion Blur",
    category: "particle",
    year: null,
    medium: ["Particle simulation", "Moving image"],
    tools: ["Blender", "Geometry Nodes"],
    description:
      "A stylized gravitational pull created with Geometry Nodes in Blender, drawing particles into blurred trails of motion.",
    media: suppliedMedia("motion-blur", "Dark particle trails sweep around a spherical center against a pale background."),
  },
  {
    slug: "apartment",
    title: "Apartment",
    category: "point-cloud",
    year: null,
    medium: ["3D scan", "Point cloud"],
    tools: [],
    description: "A three-dimensional scan of my (messy) apartment.",
    media: suppliedMedia("apartment", "A point-cloud scan of an apartment, with furniture and everyday objects visible as colored points."),
  },
  {
    slug: "san-gennaro-morph",
    title: "Treasure of San Gennaro — morph",
    category: "point-cloud",
    year: null,
    medium: ["Point cloud", "Moving image"],
    tools: [],
    description:
      "Point clouds morph into one another using captures of the Treasure of San Gennaro in Napoli.",
    media: suppliedMedia("san-gennaro-morph", "An ornate object from the Treasure of San Gennaro dissolves into a morphing cloud of points."),
  },
];

export const pointCloudPoster: Still = {
  src: "/media/about/point-cloud.webp",
  alt: "A view of the captured point cloud. Activate the scene to explore it in 3D.",
  width: 1200,
  height: 800,
};
export const site = {
  name: "phro.design",
  origin: "https://phro.design",
  identity: "Pietro Francis Costa — moving image.",
  email: "pietrofranciscosta@gmail.com",
  instagram: "https://www.instagram.com/p_h_r_o_/",
  youtube: "https://www.youtube.com/@p_h_r_o",
  tiktok: "https://www.tiktok.com/@phrodesign",
};
export const aboutCopy = [
  "Pietro Francis Costa is a creative technologist and digital artist from Brooklyn. His work asks what time does to the things around us: how it moves through people, places, and objects, and what it leaves behind.",
  "Working with point clouds, Gaussian splatting, and volumetric video, he turns real-world captures into imperfect digital objects. A moment becomes a volume and a video becomes a sculpture. The seams of the process, such as points, dither, and artifacts, are kept rather than hidden. That same interest carries into abstract music visualization, particle simulations, and visual effects, where rhythm and motion are treated as forms that unfold over time.",
];
export const visibleEntries = (preview = false) =>
  entries.filter((entry) => preview || !entry.draft);
export const routeList = (preview = false) => [
  "/",
  "/work/",
  ...visibleEntries(preview).map((p) => `/work/${p.slug}/`),
  "/about/",
  "/contact/",
  "/404.html",
];
export const jordanIntro: Still = {
  src: DITHER.heroImage,
  width: 720,
  height: 1280,
  alt: "Jordan: a basketball sequence stretches out from the Time Block volume.",
};
export const allStills = () =>
  [
    ...entries.flatMap((p) => [
      p.media.poster,
      ...(p.media.stills || []),
      ...(p.process || []).map((m) => m.still),
    ]),
    pointCloudPoster,
    jordanIntro,
  ].filter((s): s is Still => !!s);
