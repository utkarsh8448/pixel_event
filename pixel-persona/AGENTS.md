## Application architecture
- Keep the student story frontend-only with content in a separate data module and visual interactions in React components; no account or persistence service is needed.
- Mount the interactive story on a client-only index route so the Three.js canvas and browser audio never render on the server.
- Define visual roles and 3D material colors in global CSS semantic tokens so the editorial identity stays consistent.
