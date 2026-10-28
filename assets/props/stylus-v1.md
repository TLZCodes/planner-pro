# @stylus — version v1
Status: draft
Type: prop
Scenes: sc03, sc05, sc06, sc12, sc20
Seed files: `generations/sc20/sc20a-v1.png`, `generations/sc06/sc06a-v1.png`

## Canonical descriptor

The hand-made accent layer used sparingly to keep the interface feeling written in rather than filled in. Form: four motif families, each drawn as a simple flat vector shape with a uniform stroke and no fill gradient. The first family is a dashed or dotted rule, drawn as a repeated round-cap dash at roughly 3 device-independent pixels thick with 5 pixels of dash and 6 pixels of gap. The second is a torn washi strip, a rectangle roughly 118 by 26 device-independent pixels with a slightly irregular short edge and a repeating diagonal stripe pattern at 50% opacity over a pastel fill, tilted between 6 and 7 degrees either way. The third is a small five-petal flower, drawn as five round petals around a small centre, at roughly 26 device-independent pixels across. The fourth is a four-point sparkle, drawn as a concave diamond, at roughly 20 device-independent pixels across, with smaller instances at 15. Colours: strip and flower and sparkle are drawn only in blush `#ffd6e7`, lavender `#e6e6fa`, butter `#fff1b8`, mint `#98ff98` or powder `#bfe3ff`, always at between 40% and 50% opacity. Placement: the entire layer sits behind and beside content. No motif is ever drawn over a glyph, a numeral, a control, a progress rule or a card border. Wear: none beyond the deliberate torn edge of the strip. Moving parts: none. Distinctive details: the accent is present on fewer than half the screens and always covers less than five percent of the frame, which is what keeps it reading as stationery rather than as decoration.

## Reference-sheet prompt

Show the same asset on a neutral grey background in these five views: front, three-quarter, profile, back, and close detail.

The hand-made accent layer used sparingly to keep the interface feeling written in rather than filled in. Form: four motif families, each drawn as a simple flat vector shape with a uniform stroke and no fill gradient. The first family is a dashed or dotted rule, drawn as a repeated round-cap dash at roughly 3 device-independent pixels thick with 5 pixels of dash and 6 pixels of gap. The second is a torn washi strip, a rectangle roughly 118 by 26 device-independent pixels with a slightly irregular short edge and a repeating diagonal stripe pattern at 50% opacity over a pastel fill, tilted between 6 and 7 degrees either way. The third is a small five-petal flower, drawn as five round petals around a small centre, at roughly 26 device-independent pixels across. The fourth is a four-point sparkle, drawn as a concave diamond, at roughly 20 device-independent pixels across, with smaller instances at 15. Colours: strip and flower and sparkle are drawn only in blush `#ffd6e7`, lavender `#e6e6fa`, butter `#fff1b8`, mint `#98ff98` or powder `#bfe3ff`, always at between 40% and 50% opacity. Placement: the entire layer sits behind and beside content. No motif is ever drawn over a glyph, a numeral, a control, a progress rule or a card border. Wear: none beyond the deliberate torn edge of the strip. Moving parts: none. Distinctive details: the accent is present on fewer than half the screens and always covers less than five percent of the frame, which is what keeps it reading as stationery rather than as decoration.

Keep the sheet to `@stylus` alone on the neutral grey ground. No location, no other prop, no surrounding furniture, no narrative action and no dramatic staging. Do not add any text, label, badge, brand name or caption to the sheet or to the asset. If the asset is a captured screen, do not redraw its interface: reproduce the exact layout, colour values and radii stated above and nothing else.

## Reference files

- `generations/sc20/sc20a-v1.png`, `generations/sc06/sc06a-v1.png`

## Stress test

Gate: for a location or prop the completed matrix is presented for an explicit pass decision.
Status stays `draft` until that decision is recorded here.

| Test | Angle | Shot size | Scene lighting | Paired asset | Prompt | Result | Verdict |
|---|---|---|---|---|---|---|---|
| View 1 | Front on, straight to the plane | Full screen | Soft even high-key UI light, no key direction (the scene's actual lighting) | `@phone_frame` | Two-shot: the captured `@stylus` screen inside `@phone_frame`, paired with ``@phone_frame``. Static composition, no action. | pending | pending |
| View 2 | Front on, 8° high | Full screen | Soft even high-key UI light, no key direction (the scene's actual lighting) | `@card_paper` | Two-shot: the captured `@stylus` screen inside `@phone_frame`, paired with ``@card_paper``. Static composition, no action. | pending | pending |
| View 3 | Front on, 8° low | Full screen | Soft even high-key UI light, no key direction (the scene's actual lighting) | `@shell_bottom_nav` | Two-shot: the captured `@stylus` screen inside `@phone_frame`, paired with ``@shell_bottom_nav``. Static composition, no action. | pending | pending |
| View 4 | Slight three-quarter to the left | Full screen | Soft even high-key UI light, no key direction (the scene's actual lighting) | `@card_paper` | Two-shot: the captured `@stylus` screen inside `@phone_frame`, paired with ``@card_paper``. Static composition, no action. | pending | pending |
| View 5 | Slight three-quarter to the right | Full screen | Soft even high-key UI light, no key direction (the scene's actual lighting) | `@phone_frame` | Two-shot: the captured `@stylus` screen inside `@phone_frame`, paired with ``@phone_frame``. Static composition, no action. | pending | pending |
| View 6 | Tight on the upper third | Upper or lower half | Soft even high-key UI light, no key direction (the scene's actual lighting) | `@card_paper` | Two-shot: the captured `@stylus` screen inside `@phone_frame`, paired with ``@card_paper``. Static composition, no action. | pending | pending |
| View 7 | Tight on the lower third | Upper or lower half | Soft even high-key UI light, no key direction (the scene's actual lighting) | `@shell_bottom_nav` | Two-shot: the captured `@stylus` screen inside `@phone_frame`, paired with ``@shell_bottom_nav``. Static composition, no action. | pending | pending |
| View 8 | Centred, wider so the margins read | Full screen | Soft even high-key UI light, no key direction (the scene's actual lighting) | `@card_paper` | Two-shot: the captured `@stylus` screen inside `@phone_frame`, paired with ``@card_paper``. Static composition, no action. | pending | pending |
| View 9 | Centred, tighter so edge spacing reads | Full screen | Soft even high-key UI light, no key direction (the scene's actual lighting) | `@phone_frame` | Two-shot: the captured `@stylus` screen inside `@phone_frame`, paired with ``@phone_frame``. Static composition, no action. | pending | pending |
| View 10 | Front on, matched to the neighbouring shot's framing | Full screen | Soft even high-key UI light, no key direction (the scene's actual lighting) | `@card_paper` | Two-shot: the captured `@stylus` screen inside `@phone_frame`, paired with ``@card_paper``. Static composition, no action. | pending | pending |

Lock decision: **pending**. Ten views are listed. Verdicts and output paths are recorded in the `Result` and `Verdict` cells as each item is reviewed against this passport.
