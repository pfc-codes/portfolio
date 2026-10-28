export type CategorySlug = "vfx-music-videos" | "audio-visual" | "semi-volumetric" | "time-block-addon" | "time-block-work" | "depth-echo" | "sculpture";
export interface Category {
  slug: CategorySlug; title: string; description: string;
  descriptionDraft?: boolean; related?: string[];
}
export interface Still {
  src: string; alt: string; width: number; height: number;
  focus?: readonly [number, number]; caption?: string;
}
export interface Film { src: string; hd?: string; width: number; height: number; duration?: number; fps?: number }
export interface ProcessMedia {
  label: string; still: Still; video?: Film;
}
export interface Entry {
  slug: string; title: string; category: CategorySlug;
  year: number | null; medium: string[]; tools: string[];
  description?: string; descriptionDraft?: boolean; draft?: boolean;
  credits?: { artist: string; role: string }[];
  links?: { video?: string; store?: string };
  media: { poster?: Still; loop?: Film; film?: Film; stills?: Still[]; youtubeId?: string };
  focus?: readonly [number, number]; process?: ProcessMedia[];
  /** Missing slots are editorial instructions, visible only in previews. */
  needed?: string[];
  tool?: { version: string; price: string; license: string; checked: string; source: string };
}

export const categories: Category[] = [
  { slug: "vfx-music-videos", title: "VFX for music videos", description: "Visual effects for music videos." },
  { slug: "audio-visual", title: "Audio-visual animations", description: "[Copy needed: one line about audio-visual work.]", descriptionDraft: true },
  { slug: "semi-volumetric", title: "Semi-volumetric camera work", description: "LiDAR capture and monocular depth estimation.", related: ["ozzy"] },
  { slug: "time-block-addon", title: "Time Block — the add-on", description: "A Blender tool for turning video into a volume of time." },
  { slug: "time-block-work", title: "Time Block — work", description: "Pieces made with Time Block." },
  { slug: "depth-echo", title: "Depth Echo", description: "[Copy needed: one line about Depth Echo.]", descriptionDraft: true },
  { slug: "sculpture", title: "3D sculpture", description: "Physical, 3D-printed motion sculptures." },
];

const jordanFilm: Film = { src: "/media/time-block/jordan.mp4", width: 720, height: 1280, duration: 13.04, fps: 24 };
const waterFilm: Film = { src: "/media/depth-echo/water-dance.mp4", width: 720, height: 1280, duration: 11.88, fps: 25 };
export const entries: Entry[] = [
  {
    slug: "ozzy", title: "Sero Flame — Ozzy", category: "vfx-music-videos", year: null,
    medium: ["Music video", "VFX", "Monocular depth"], tools: [],
    credits: [{ artist: "Sero Flame", role: "Artist" }, { artist: "Pietro Francis Costa", role: "VFX" }],
    links: { video: "https://www.youtube.com/watch?v=aOJ1GtodHKo" },
    media: { youtubeId: "aOJ1GtodHKo", poster: { src: "/media/ozzy/poster.webp", alt: "Temporary title card for Sero Flame’s Ozzy music video.", width: 1280, height: 720 } },
    needed: ["Release year and confirmed tools.", "Approved Ozzy poster; VFX shot clips, before/after pairs, stills and captions.", "Source clip → depth map → output, or a node-graph crop.", "Short project description and any additional approved credits."],
  },
  {
    slug: "audio-visual-placeholder", title: "[Audio-visual project needed]", category: "audio-visual", draft: true, year: null,
    medium: [], tools: [], media: {},
    needed: ["Title, year, medium, tools and one-line description.", "Loop, full film, poster, stills and alt text.", "Music/artist credits and links.", "Process clip or node-graph crop."],
  },
  {
    slug: "semi-volumetric-placeholder", title: "[Camera project needed]", category: "semi-volumetric", draft: true, year: null,
    medium: [], tools: [], media: {},
    needed: ["Title, year, capture/depth method, tools and description.", "Source footage, depth map and resulting camera move.", "Poster, stills, captions and approved credits."],
  },
  {
    slug: "time-block-addon", title: "Time Block", category: "time-block-addon", year: null,
    medium: ["Blender add-on"], tools: ["Blender"],
    description: "Turn a video into a three-dimensional block of time. Move and rotate slices through its frames in Blender.",
    links: { store: "https://phr0swork.gumroad.com/l/time-block" },
    media: { poster: { src: "/media/time-block/frame-02.webp", alt: "Jordan, made with Time Block: repeated forms extend from an image plane.", width: 480, height: 853, caption: "Jordan — made with Time Block" } },
    // Observed on the linked product page on this date, not inferred from release history.
    tool: { version: "0.2.2", price: "Free / pay what you want", license: "GPL-3.0-or-later", checked: "2026-10-28", source: "https://phr0swork.gumroad.com/l/time-block" },
    needed: ["Confirm Gumroad’s displayed version 0.2.2 is intended; update the store first if outdated.", "Dedicated add-on demo, interface screenshot and node-graph/process image.", "Final product copy and release year."],
  },
  {
    slug: "jordan", title: "Jordan", category: "time-block-work", year: null,
    medium: ["Moving image"], tools: ["Time Block", "Blender"],
    media: { film: jordanFilm, loop: jordanFilm,
      poster: { src: "/media/time-block/poster.webp", alt: "Jordan: a basketball image plane forming a volume in black space.", width: 720, height: 1280 },
      stills: [
        { src: "/media/time-block/frame-01.webp", alt: "An image plane with a cluster of pale forms extending from its right edge.", width: 480, height: 853, caption: "00:02.5" },
        { src: "/media/time-block/frame-02.webp", alt: "A flowing trail of repeated forms stretches away from the tilted image plane.", width: 480, height: 853, caption: "00:10.5" },
      ],
    },
    needed: ["Release year, final description and any approved source-footage credits.", "Original jordan_render_instagram.mp4 for the 1080 × 1920 encode.", "Source/result or node-graph process media."],
  },
  {
    slug: "water-dance", title: "Water Dance", category: "depth-echo", year: null,
    medium: ["Moving image"], tools: ["Depth Echo"],
    media: { film: waterFilm, loop: waterFilm,
      poster: { src: "/media/depth-echo/poster.webp", alt: "Water Dance: a pale figure with overlapping traces against black.", width: 900, height: 1600 },
      stills: [
        { src: "/media/depth-echo/frame-01.webp", alt: "A pale moving figure and a long, faint vertical trace against black.", width: 480, height: 853, caption: "00:02.8" },
        { src: "/media/depth-echo/frame-02.webp", alt: "The figure unfolds horizontally into multiple soft, overlapping traces.", width: 480, height: 853, caption: "00:09.4" },
      ],
    },
    needed: ["Release year, final description, tools and approved performer/source credits.", "Original water_dance_2_HQ.mp4 for the 1080 × 1920 encode.", "Source → depth map → output process media."],
  },
  {
    slug: "sculpture-placeholder", title: "[Sculpture project needed]", category: "sculpture", draft: true, year: null,
    medium: [], tools: [], media: {},
    needed: ["Title, year, materials, dimensions, printing method and description.", "Sculpture photographs, detail images, turntable loop and alt text.", "Source motion → time stack → printed object process images.", "Fabrication and exhibition credits, if applicable."],
  },
];

export const pointCloudPoster: Still = { src: "/media/about/point-cloud.webp", alt: "A view of the captured point cloud. Activate the scene to explore it in 3D.", width: 1200, height: 800 };
export const site = {
  name: "phro.design", origin: "https://phro.design", identity: "Pietro Francis Costa — moving image.",
  email: "pietrofranciscosta@gmail.com", instagram: "https://www.instagram.com/p_h_r_o_/",
  youtube: "https://www.youtube.com/@p_h_r_o", tiktok: "https://www.tiktok.com/@phrodesign",
};
export const visibleEntries = (preview = false) => entries.filter(entry => preview || !entry.draft);
export const routeList = (preview = false) => ["/", "/work/", ...visibleEntries(preview).map(p => `/work/${p.slug}/`), "/about/", "/contact/", "/404.html"];
export const allStills = () => [...entries.flatMap(p => [p.media.poster, ...(p.media.stills || []), ...(p.process || []).map(m => m.still)]), pointCloudPoster].filter((s): s is Still => !!s);
