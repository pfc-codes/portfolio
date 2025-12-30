export type Facet = "web" | "vfx" | "3d";

export type Project = {
  title: string;
  year: string;
  client: string;
  facets: Facet[];
  primaryFacet: Facet;
  slug: string;          // "whitespace" (no leading slash)
  hoverImage: string;    // "/previews/placeholder-1.jpg"
  nodeIcon: string;      // "placeholder" for now
  dateISO: string;       // for sorting, e.g. "2025-01-01"
};

const slugify = (s: string) =>
  s.trim().replace(/^\/+/, "").replace(/\/+$/, "");

export const projects: Project[] = [
  {
    title: "whitespace projects Napoli website",
    year: "2025–ongoing",
    client: "WPN",
    facets: ["web"],
    primaryFacet: "web",
    slug: slugify("/whitespace"),
    hoverImage: "/previews/placeholder-1.jpg",
    nodeIcon: "placeholder",
    dateISO: "2025-01-01",
  },
  {
    title: "BACAS",
    year: "2023–ongoing",
    client: "BACAS org",
    facets: ["web"],
    primaryFacet: "web",
    slug: slugify("/bacas"),
    hoverImage: "/previews/placeholder-2.jpg",
    nodeIcon: "placeholder",
    dateISO: "2023-01-01",
  },
  {
    title: "pietrocosta.com",
    year: "2022–ongoing",
    client: "pietrocosta studio",
    facets: ["web"],
    primaryFacet: "web",
    slug: slugify("/pcostastudio"),
    hoverImage: "/previews/placeholder-3.jpg",
    nodeIcon: "placeholder",
    dateISO: "2022-01-01",
  },
  {
    title: "personal projects",
    year: "until the end",
    client: "PFC",
    facets: ["web", "vfx", "3d"],
    primaryFacet: "web",
    slug: slugify("/pfc"),
    hoverImage: "/previews/placeholder-4.jpg",
    nodeIcon: "placeholder",
    dateISO: "2024-01-01",
  },
  {
    title: "Agnes Questionmark Trailer",
    year: "2025",
    client: "WPN",
    facets: ["vfx"],
    primaryFacet: "vfx",
    slug: slugify("/aq-trailer"),
    hoverImage: "/previews/placeholder-5.jpg",
    nodeIcon: "placeholder",
    dateISO: "2025-06-01",
  },
  {
    title: "Untitled Project 6",
    year: "—",
    client: "—",
    facets: ["3d"],
    primaryFacet: "3d",
    slug: "project-6",
    hoverImage: "/previews/placeholder-6.jpg",
    nodeIcon: "placeholder",
    dateISO: "2025-07-01",
  },
  {
    title: "Untitled Project 7",
    year: "—",
    client: "—",
    facets: ["web"],
    primaryFacet: "web",
    slug: "project-7",
    hoverImage: "/previews/placeholder-7.jpg",
    nodeIcon: "placeholder",
    dateISO: "2025-08-01",
  },
  {
    title: "Untitled Project 8",
    year: "—",
    client: "—",
    facets: ["vfx"],
    primaryFacet: "vfx",
    slug: "project-8",
    hoverImage: "/previews/placeholder-8.jpg",
    nodeIcon: "placeholder",
    dateISO: "2025-09-01",
  },
].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
