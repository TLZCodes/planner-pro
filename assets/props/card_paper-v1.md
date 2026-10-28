# @card_paper — version v1
Status: draft
Type: prop
Scenes: sc02–sc23
Seed files: `generations/sc02/sc02a-v1.png`, `generations/sc12/sc12a-v1.png`, `generations/sc20/sc20a-v1.png`

## Canonical descriptor

The full-width paper card that holds almost all content in the film. Form: a single rounded rectangle with a corner radius between 24 and 32 device-independent pixels depending on the card's rank, largest for primary panels and smallest for nested sub-surfaces. Scale: the card always spans the screen width minus an 18 pixel gutter on each side, so its width is roughly 376 device-independent pixels at a 412 pixel viewport. Material: an opaque flat paper fill at pure white `#ffffff` over a background surface of `#ffeef4` on a ground of `#fff8fa`, with no transparency, no blur and no blend mode. Finish: matte with a one-pixel solid border at roughly 6% opacity in the plum ink colour `#2b1727`, plus one very low elevation shadow of 2 pixels vertical offset and an 8 pixel blur at about 4% opacity, so the card lifts from the ground by less than a millimetre. A nested or recessed sub-surface inside a card uses the surface fill `#ffeef4` instead of white so hierarchy is carried by tone rather than by a heavier border. Markings: none. No printed label, no rule, no perforation, no corner fold, no tab and no index marker is ever drawn on the card itself. Wear: none, anywhere, at any point in the film; the cards are the product as it renders, not a photographed notebook. Moving parts: none. Distinctive details: the border and the shadow are the only two treatments, and they are applied identically on every card so the interface reads as one stationery system rather than a mixed set.

## Reference-sheet prompt

Show the same asset on a neutral grey background in these five views: front, three-quarter, profile, back, and close detail.

The full-width paper card that holds almost all content in the film. Form: a single rounded rectangle with a corner radius between 24 and 32 device-independent pixels depending on the card's rank, largest for primary panels and smallest for nested sub-surfaces. Scale: the card always spans the screen width minus an 18 pixel gutter on each side, so its width is roughly 376 device-independent pixels at a 412 pixel viewport. Material: an opaque flat paper fill at pure white `#ffffff` over a background surface of `#ffeef4` on a ground of `#fff8fa`, with no transparency, no blur and no blend mode. Finish: matte with a one-pixel solid border at roughly 6% opacity in the plum ink colour `#2b1727`, plus one very low elevation shadow of 2 pixels vertical offset and an 8 pixel blur at about 4% opacity, so the card lifts from the ground by less than a millimetre. A nested or recessed sub-surface inside a card uses the surface fill `#ffeef4` instead of white so hierarchy is carried by tone rather than by a heavier border. Markings: none. No printed label, no rule, no perforation, no corner fold, no tab and no index marker is ever drawn on the card itself. Wear: none, anywhere, at any point in the film; the cards are the product as it renders, not a photographed notebook. Moving parts: none. Distinctive details: the border and the shadow are the only two treatments, and they are applied identically on every card so the interface reads as one stationery system rather than a mixed set.

Keep the sheet to `@card_paper` alone on the neutral grey ground. No location, no other prop, no surrounding furniture, no narrative action and no dramatic staging. Do not add any text, label, badge, brand name or caption to the sheet or to the asset. If the asset is a captured screen, do not redraw its interface: reproduce the exact layout, colour values and radii stated above and nothing else.

## Reference files

- `generations/sc02/sc02a-v1.png`, `generations/sc12/sc12a-v1.png`, `generations/sc20/sc20a-v1.png`

## Stress test

Gate: for a location or prop the completed matrix is presented for an explicit pass decision.
Status stays `draft` until that decision is recorded here.

| Test | Angle | Shot size | Scene lighting | Paired asset | Prompt | Result | Verdict |
|---|---|---|---|---|---|---|---|
| View 1 | Front on, straight to the plane | Full screen | Soft even high-key UI light, no key direction (the scene's actual lighting) | `@phone_frame` | Two-shot: the captured `@card_paper` screen inside `@phone_frame`, paired with ``@phone_frame``. Static composition, no action. | pending | pending |
| View 2 | Front on, 8° high | Full screen | Soft even high-key UI light, no key direction (the scene's actual lighting) | `@card_paper` | Two-shot: the captured `@card_paper` screen inside `@phone_frame`, paired with ``@card_paper``. Static composition, no action. | pending | pending |
| View 3 | Front on, 8° low | Full screen | Soft even high-key UI light, no key direction (the scene's actual lighting) | `@shell_bottom_nav` | Two-shot: the captured `@card_paper` screen inside `@phone_frame`, paired with ``@shell_bottom_nav``. Static composition, no action. | pending | pending |
| View 4 | Slight three-quarter to the left | Full screen | Soft even high-key UI light, no key direction (the scene's actual lighting) | `@card_paper` | Two-shot: the captured `@card_paper` screen inside `@phone_frame`, paired with ``@card_paper``. Static composition, no action. | pending | pending |
| View 5 | Slight three-quarter to the right | Full screen | Soft even high-key UI light, no key direction (the scene's actual lighting) | `@phone_frame` | Two-shot: the captured `@card_paper` screen inside `@phone_frame`, paired with ``@phone_frame``. Static composition, no action. | pending | pending |
| View 6 | Tight on the upper third | Upper or lower half | Soft even high-key UI light, no key direction (the scene's actual lighting) | `@card_paper` | Two-shot: the captured `@card_paper` screen inside `@phone_frame`, paired with ``@card_paper``. Static composition, no action. | pending | pending |
| View 7 | Tight on the lower third | Upper or lower half | Soft even high-key UI light, no key direction (the scene's actual lighting) | `@shell_bottom_nav` | Two-shot: the captured `@card_paper` screen inside `@phone_frame`, paired with ``@shell_bottom_nav``. Static composition, no action. | pending | pending |
| View 8 | Centred, wider so the margins read | Full screen | Soft even high-key UI light, no key direction (the scene's actual lighting) | `@card_paper` | Two-shot: the captured `@card_paper` screen inside `@phone_frame`, paired with ``@card_paper``. Static composition, no action. | pending | pending |
| View 9 | Centred, tighter so edge spacing reads | Full screen | Soft even high-key UI light, no key direction (the scene's actual lighting) | `@phone_frame` | Two-shot: the captured `@card_paper` screen inside `@phone_frame`, paired with ``@phone_frame``. Static composition, no action. | pending | pending |
| View 10 | Front on, matched to the neighbouring shot's framing | Full screen | Soft even high-key UI light, no key direction (the scene's actual lighting) | `@card_paper` | Two-shot: the captured `@card_paper` screen inside `@phone_frame`, paired with ``@card_paper``. Static composition, no action. | pending | pending |

Lock decision: **pending**. Ten views are listed. Verdicts and output paths are recorded in the `Result` and `Verdict` cells as each item is reviewed against this passport.
