<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Application architecture
- Keep the student story frontend-only with content in a separate data module and visual interactions in React components; no account or persistence service is needed.
- Mount the interactive story on a client-only index route so the Three.js canvas and browser audio never render on the server.
- Define visual roles and 3D material colors in global CSS semantic tokens so the editorial identity stays consistent.
