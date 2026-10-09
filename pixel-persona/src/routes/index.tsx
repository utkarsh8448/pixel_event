import { createFileRoute } from "@tanstack/react-router";
import StudentStory from "@/components/StudentStory";
export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Pixel Persona — Breaking the Frame" },
    { name: "description", content: "Step into Alex’s world: an interactive student story about pressure, expectations, and finding your own way." },
    { property: "og:title", content: "Pixel Persona — Breaking the Frame" },
    { property: "og:description", content: "Four acts. One unseen reality. A cinematic student story about the weight behind the grades." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: StudentStory,
});
