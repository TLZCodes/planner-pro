# Visual Bible

## Reference rule

An existing screen must be captured first, then described. Nothing in this film is imagined
before it exists as a real captured frame from the running application at
`http://127.0.0.1:8081`. Captions describe exactly what is taken from each capture.

## Asset boards

### @card_paper — pastel paper card surface

| Reference | Kind | Board | Caption |
|---|---|---|---|
| `screenshots_archive/*.png` (module screens) | Reference | @card_paper | Rounded 24–32px paper cards on a soft blush background, 1px hairline border, very low elevation shadow. Taken for: card radius, border opacity, and the flat pastel fill that lets dark plum text sit at high contrast. |
| `scratch/wellnessEngine.mjs` render probe | anti-reference | @card_paper | Flat, unlayered card grid with no paper texture and no accent colour. Banned: uniform grey cards and heavy drop shadows. |

Decision: `approved`

### @shell_bottom_nav — five-slot bottom navigation

| Reference | Kind | Board | Caption |
|---|---|---|---|
| `src/components/MobileShell.tsx` as rendered at `/` | Reference | @shell_bottom_nav | Fixed 5-slot bar: Home, Tasks, centre raised AI action, Journal, More. Taken for: slot count, centre action prominence, and the persistent placement that is never replaced by the showcase. |

Decision: `approved`

### @brand_mark — AYXA Planner Pro identity

| Reference | Kind | Board | Caption |
|---|---|---|---|
| App title treatment at `/onboarding` | Reference | @brand_mark | Serif-leaning display heading in dark plum with a rose gradient rule. Taken for: wordmark weight, plum-on-blush contrast pairing, and the ✨ motif placement. |
| Stock “tech startup” sans-serif wordmarks | anti-reference | @brand_mark | Hard geometric corporate type on white. Banned: cold blue gradients, pure white backgrounds, and heavy black display type. |

Decision: `approved`

### @phone_frame — graphic device frame

| Reference | Kind | Board | Caption |
|---|---|---|---|
| `releases/AYXA_Planner_Pro_iPhone_Clean_40s.mp4` | Reference | @phone_frame | Rounded phone shell with cut-away pill notch, thin plum bezel. Taken for: corner radius, bezel weight and the clip region used to inset live captures. |

Decision: `revise` — unresolved: exact bezel width and screen inset must be fixed to the final export resolution before lock.

### @stylus — handwriting motif

| Reference | Kind | Board | Caption |
|---|---|---|---|
| Bullet Journal screens at `/bujo` | Reference | @stylus | Hand-drawn planner linework: dotted rule, torn washi strip, small flower. Taken for: the occasional hand-made accent that sits *behind* content, never over it. |
| Grunge/distressed brush textures | anti-reference | @stylus | Heavy ink splatter and grunge. Banned: any texture that reduces text contrast or reads as “dirty paper”. |

Decision: `approved`

## Style boards

### light

| Reference | Kind | Board | Caption |
|---|---|---|---|
| Home dashboard capture at `/` | Reference | light | Soft, even, high-key light. No hard cast shadows. Taken for: diffuse key, gentle falloff, and zero harsh specular. |

Decision: `approved`

### color

| Reference | Kind | Board | Caption |
|---|---|---|---|
| Home dashboard capture at `/` and `/bujo` capture | Reference | color | Blush/cream ground, dark plum text, bright pink primary action, with lavender, mint, butter-yellow and powder-blue accents. Taken for: the exact 60:30:10 ratio used in every graphic title card. |
| Saturated neon UI themes | anti-reference | color | Saturated cyan/magenta on black. Banned: neon primaries and pure-black backgrounds. |

Decision: `approved`

### optics

| Reference | Kind | Board | Caption |
|---|---|---|---|
| Existing showcase cut `releases/AYXA_Planner_Pro_Cinematic_30s.mp4` | Reference | optics | Slow, shallow, locked-off push-ins onto a flat screen. Taken for: lens feel of a single fixed focal length with a very gentle scale change. |
| Faked handheld wobble | anti-reference | optics | Simulated camera shake over a static UI. Banned: handheld wobble, dutch tilt, and lens flare over readable interface content. |

Decision: `approved`

### camera movement

| Reference | Kind | Board | Caption |
|---|---|---|---|
| `releases/AYXA_Planner_Pro_Clean_Screen_40s.mp4` | Reference | camera movement | One continuous move per screen: hold, slow push-in, hold, then a soft cross-dissolve to the next screen. Taken for: the movement grammar that never scrolls away from the subject mid-sentence. |

Decision: `approved`

### texture

| Reference | Kind | Board | Caption |
|---|---|---|---|
| Paper-card surfaces across module captures | Reference | texture | Sub-perceptual paper grain at very low opacity. Taken for: grain strength, and the rule that grain stops short of the phone bezel. |

Decision: `approved`

### cutting tempo

| Reference | Kind | Board | Caption |
|---|---|---|---|
| `releases/AYXA_Planner_Pro_Showcase_1min.mp4` | Reference | cutting tempo | Roughly 2.5 seconds per screen at the fast end, plus a 300–400 ms dissolve. Taken for: cut rhythm and dissolve length. |

Decision: `approved`

### sound

| Reference | Kind | Board | Caption |
|---|---|---|---|
| `src/lib/ambientSounds.ts` catalogue | Reference | sound | Soft, low-tempo ambience: rain, café murmur, deep space hum. Taken for: a single quiet bed that never competes with narration. |
| Trailer braams and riser sweeps | anti-reference | sound | Percussive trailer impacts. Banned: any sound louder than the voice-over. |

Decision: `approved`

## Ban list

- `like this — not allowed` — **cold corporate blue/white**: forbidden visible property is a pure white background or a saturated blue primary (`@brand_mark` reference: “Stock tech startup wordmarks”).
- `like this — not allowed` — **neon on pure black**: forbidden visible property is any background with luminance near zero behind interface content (`color` reference: “Saturated neon UI themes”).
- `like this — not allowed` — **handheld wobble / dutch tilt / lens flare**: forbidden visible property is non-deterministic camera motion or an overlay flare crossing readable text (`optics` reference: “Faked handheld wobble”).
- `like this — not allowed` — **flat grey card grid with heavy shadow**: forbidden visible property is a uniform grey card with a large soft shadow (`@card_paper` reference: “Flat, unlayered card grid”).
- `like this — not allowed` — **grunge / distressed brush texture**: forbidden visible property is texture that measurably reduces text contrast (`@stylus` reference: “Grunge/distressed brush textures”).
- `like this — not allowed` — **trailer braam / riser sweep**: forbidden audible property is any transient louder than the narration peak (`sound` reference: “Trailer braams and riser sweeps”).
