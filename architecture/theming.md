Theming System

Goals
- Provide cute, motivational themes per SPEC with distinct palettes, iconography, and background music.

Theme Schema
- themeId: string (pink|blue|green|orange|yellow|purple|grey|red)
- name: string
- tokens:
  - colors: {bg, bgSoft, fg, accent, accentDark}
  - fonts: {ui, display}
  - iconography: {outline: ["pearls","stars",...], figures: ["bunnies","ducks",...]} 
- voicePreset: {ttsVoice, speakingRate, pitch}
- music: {trackIds: [string], defaultTrackId}
- assets: {backgrounds: [paths], overlays: [paths], sounds: [paths]}

UI Behaviors
- Sound button uses accentDark color of active theme.
- Theme button icon: three tiny stars.
- Theme affects video overlays and backgrounds via assets.

Asset Locations
- Storage: cornerstone/themes/{themeId}/assets/* and music/*

Mapping from SPEC Examples
- pink: pearls, strawberries, bunnies, whipped cream, sundae, motivational font.
- blue: pearls, cats (grey-blue outline), fishes, whales, bubbles, clouds.
- green: clovers, birds, pearls, apples.
- orange: oranges, pearls, flowers, fish.
- yellow: mango, pearls, stars, ducks.
- purple: pearls, grapes, spider, lavenders.
- grey: pearls, penguins, blackberries, stars.
- red: apples, tiger, pearls.
