# Generation Log

For this deliverable the "generation" step is a **driven recording of the running app**, not a
model call. One row per record-and-assemble pass. Verdict is the QC result, not an opinion:
`node scripts/studio/qc-frame.mjs` measures the decoded frame numerically.

| Shot ID | Pass | What changed | Result | Verdict |
|---|---|---|---|---|
| ALL tour stops | tour-v1 | First full driven recording: 28 stops, no narration, silent AAC track | `edit/tour/seg-01..28.webm` | pass — 28/28 recorded |
| 01 | tour-v1r | Re-recorded with measured warm-up; take had been numbered 01 by a partial-run bug | `edit/tour/seg-01.webm` | pass — opening card, 4.0 s |
| 28 | tour-v1r | Re-recorded with measured warm-up; take had been overwriting 01 | `edit/tour/seg-28.webm` | pass — closing card, 4.4 s |
| ALL tour stops | film-v1 | Assembled 28 stops → 1080×1920 @ 30fps, CRF 17, app on a paper mat with a product mark and a pink chip | `master/AYXA_Planner_Pro_Client_Tour.mp4` | rejected — the client asked for the app itself, larger |
| ALL tour stops | film-v1 | Numeric frame QC: overlay bbox, chip band under the device, corner background | — | pass — 28/28 stops, all checks green |
| ALL tour stops | film-v1 | Overlaid at 1080×1920 at 8.5% scale to confirm text legibility by eye | `edit/qc/` | superseded — see note |
| ALL tour stops | film-v2 | Dropped the mat and the product mark. App scaled to full frame height, gutters tinted to the app's own canvas, label in an 84px bar below it. CRF 21 `ultrafast` | `master/AYXA_Planner_Pro_Client_Tour.mp4` | pass — app fills the frame, content bbox 1080×1916 |
| ALL tour stops | film-v2 | Numeric frame QC retargeted: bar band at the bottom of the frame, app-reaches-top and frame-height checks | — | pass — all checks green |

## Notes

- **Head trim.** Each recorded stop includes its page load. The recorder measures the warm-up
  window and writes it to `edit/tour/manifest.json` as `headTrim`, so the edit trims to the
  first settled frame exactly rather than guessing a fixed offset.
- **Legibility.** Image preview does not render in this environment, so frame QC is numeric.
  The label bar is measured only in the 84px strip below the app, where the app cannot
  contribute pink pixels of its own — an earlier version scanned the whole frame and produced
  false failures by matching the app's own pink UI.
- **Composition.** `film-v1` inset the app on a paper mat to leave room for a product mark.
  The client's feedback was that the app read too small, so `film-v2` removed the mat and the
  mark entirely: the app is now as large as the frame allows at its true aspect, with only a
  one-line label under it. Nothing is stretched and nothing is cropped.
- **Encode.** `film-v2` moved off CRF 17 `medium` because the client wanted the cut fast. A
  first attempt at CRF 21 `ultrafast` finished quickly but produced a 104 MB file — three times
  the previous master — so the preset settled on CRF 23 `veryfast`, which keeps the render
  short and brings the file back to a size that is easy to forward. The source is a screen
  recording, so the extra compression is not visible at phone size.
- **Superseded rows.** Two earlier passes were discarded: a narrated assembly stage
  (`build-narration.mjs`) and a fixed-residual-head assembly. The narration stage is kept in
  the tree but is unused by this deliverable.
