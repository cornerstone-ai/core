Theming and Assets Plan

Goals
- Provide cohesive visual/audio identity per theme with licensed assets and efficient delivery.

Assets
- Visuals: backgrounds (1920x1080), overlays (transparent PNG/WebP), icons (SVG), fonts.
- Audio: background tracks (2–5 min), loopable; stingers/sfx optional.

Tasks
- [ ] Define token sets per theme (colors, fonts, iconography) per architecture/theming.md.
- [ ] Source or create assets; confirm licensing (commercial use, redistribution).
- [ ] Optimize images (WebP/PNG), subset fonts (WOFF2), and define font fallbacks.
- [ ] Normalize music loudness to -14 LUFS; identify loop points; export to AAC.
- [ ] Organize Storage layout: cornerstone/themes/{themeId}/assets/* and music/*.
- [ ] Provide sample previews per theme for UI.
- [ ] Map themes → TTS voice presets.

Acceptance criteria
- Page weight for previews < 1.5MB per theme.
- No licensing gaps; attribution included if required.

Verification
- Visual QA sheets; audio loop click-free verification.
- Lint script validates file naming and metadata.

References
- Spec: ../SPEC.md
- Architecture: ../architecture/theming.md
