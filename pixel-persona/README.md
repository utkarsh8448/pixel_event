# Pixel Persona — Breaking the Frame

A cinematic, interactive student-life story. Four acts explore academic burnout, expectations, career uncertainty, and the quiet late-night struggle, followed by an interactive 3D pixel frame and a gentle breathing exercise.

## Run locally

Requires Node.js 22+ and Bun (or npm).

```sh
bun install
bun run dev
```

Open the localhost address printed by Vite. To create a production build:

```sh
bun run build
```

## Stack

React 19, HTML, CSS, JavaScript/TypeScript, TanStack Start, Tailwind CSS v4, and Three.js / React Three Fiber. The existing TanStack framework is preserved. No database, account, or private API key is required.

## Editing the experience

- `src/lib/story.ts`: the dialogue, four acts, problem details, and supportive steps.
- `src/styles.css`: all visual tokens, responsive layouts, and animations.
- `src/components/StudentStory.tsx`: navigation, introduction, video, modals, and breathing.
- `src/components/PixelFrame.tsx`: animated 3D frame.
- `src/lib/story-audio.ts`: gentle, synthesized sound effects.
- `src/assets`: original generated art and uploaded-media asset pointers.

Sound starts muted. Enable sound for gentle effects and the browser’s optional spoken introduction. The story moves into the first act after the introduction; manual scrolling cancels that automatic movement. Reduced-motion settings disable the opening automatic scroll and decorative animation.

Alex and his dialogue are fictional storytelling content, not a real person’s testimony. Support text is general wellbeing information, not clinical advice. The breathing exercise can be paused or stopped at any time.

Media referenced from `src/assets` is bundled for local development and production builds.
