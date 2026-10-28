import type { JournalPage, JournalDocument } from "@/types/canvasTypes";

export async function renderPageToCanvas(
  page: JournalPage,
  scale = 2
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  const width = page.size.width * scale;
  const height = page.size.height * scale;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.scale(scale, scale);

  // 1. Render Background
  ctx.fillStyle = page.background.color || "#FFFBF7";
  ctx.fillRect(0, 0, page.size.width, page.size.height);

  // Background Grid / Pattern
  if (page.background.type === "dotted") {
    ctx.fillStyle = page.background.gridColor || "#E2D9D0";
    const step = page.background.gridSize || 24;
    for (let x = step; x < page.size.width; x += step) {
      for (let y = step; y < page.size.height; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (page.background.type === "grid") {
    ctx.strokeStyle = page.background.gridColor || "#E2D9D0";
    ctx.lineWidth = 0.8;
    const step = page.background.gridSize || 24;
    for (let x = step; x < page.size.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, page.size.height);
      ctx.stroke();
    }
    for (let y = step; y < page.size.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(page.size.width, y);
      ctx.stroke();
    }
  } else if (page.background.type === "lined") {
    ctx.strokeStyle = page.background.gridColor || "#E2D9D0";
    ctx.lineWidth = 1;
    const step = page.background.gridSize || 28;
    for (let y = step; y < page.size.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(page.size.width, y);
      ctx.stroke();
    }
  }

  // 2. Render Sorted Layers
  const sortedLayers = [...page.layers].sort((a, b) => a.zIndex - b.zIndex);

  for (const layer of sortedLayers) {
    if (!layer.visible) continue;

    ctx.save();

    // Transform
    ctx.translate(layer.x + layer.width / 2, layer.y + layer.height / 2);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    ctx.globalAlpha = layer.opacity;

    if (layer.blendMode && layer.blendMode !== "normal") {
      ctx.globalCompositeOperation = layer.blendMode;
    }

    const halfW = layer.width / 2;
    const halfH = layer.height / 2;

    // Render by type
    if (layer.type === "text") {
      const {
        text = "",
        fontFamily = "Outfit",
        fontSize = 28,
        color = "#1E1220",
        fontWeight = "bold",
        fontStyle = "normal",
        textAlign = "left",
        textHighlight,
        curvedText,
        curveRadius = 150,
      } = layer.props;

      ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}, sans-serif`;

      if (textHighlight) {
        ctx.fillStyle = textHighlight;
        ctx.fillRect(-halfW - 4, -halfH - 2, layer.width + 8, layer.height + 4);
      }

      ctx.fillStyle = color;
      ctx.textBaseline = "middle";

      if (curvedText) {
        // Curved text on arc path
        const chars = text.split("");
        const angleStep = 0.08;
        const startAngle = -((chars.length - 1) * angleStep) / 2;
        chars.forEach((char, i) => {
          ctx.save();
          const angle = startAngle + i * angleStep;
          ctx.rotate(angle);
          ctx.fillText(char, 0, -curveRadius);
          ctx.restore();
        });
      } else {
        if (textAlign === "center") {
          ctx.textAlign = "center";
          ctx.fillText(text, 0, 0);
        } else if (textAlign === "right") {
          ctx.textAlign = "right";
          ctx.fillText(text, halfW, 0);
        } else {
          ctx.textAlign = "left";
          ctx.fillText(text, -halfW, 0);
        }
      }
    } else if (layer.type === "shape") {
      const {
        shapeKind = "rectangle",
        fillColor = "#FF1493",
        borderColor = "#1E1220",
        borderWidth = 2,
        borderRadius = 16,
      } = layer.props;

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;

      if (shapeKind === "circle") {
        ctx.beginPath();
        ctx.ellipse(0, 0, halfW, halfH, 0, 0, Math.PI * 2);
        ctx.fill();
        if (borderWidth > 0) ctx.stroke();
      } else if (shapeKind === "star") {
        ctx.beginPath();
        const spikes = 5;
        const outerR = Math.min(halfW, halfH);
        const innerR = outerR / 2;
        for (let i = 0; i < spikes * 2; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const a = (i * Math.PI) / spikes - Math.PI / 2;
          const x = Math.cos(a) * r;
          const y = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        if (borderWidth > 0) ctx.stroke();
      } else {
        // Rectangle / Rounded
        ctx.beginPath();
        ctx.roundRect(-halfW, -halfH, layer.width, layer.height, borderRadius);
        ctx.fill();
        if (borderWidth > 0) ctx.stroke();
      }
    } else if (layer.type === "sticker" || layer.type === "stamp") {
      const symbol = layer.props.stampSymbol || "🌟";
      ctx.font = `${layer.height * 0.75}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(symbol, 0, 0);
    } else if (layer.type === "washiTape") {
      const { pattern = "stripes", tapeColor = "#FF69B4" } = layer.props;
      ctx.fillStyle = tapeColor;
      ctx.fillRect(-halfW, -halfH, layer.width, layer.height);

      // Pattern overlay
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      if (pattern === "stripes") {
        for (let x = -halfW; x < halfW; x += 16) {
          ctx.beginPath();
          ctx.moveTo(x, -halfH);
          ctx.lineTo(x + 10, halfH);
          ctx.lineTo(x + 16, halfH);
          ctx.lineTo(x + 6, -halfH);
          ctx.fill();
        }
      } else if (pattern === "polkadot") {
        for (let x = -halfW + 10; x < halfW; x += 16) {
          for (let y = -halfH + 6; y < halfH; y += 12) {
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    } else if (layer.type === "drawing") {
      const { strokes = [] } = layer.props;
      ctx.translate(-halfW, -halfH);
      for (const stroke of strokes) {
        if (!stroke.points.length) continue;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalAlpha = stroke.opacity;

        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  return canvas;
}

export async function exportPageToPNG(page: JournalPage, filename = "bujo_page.png") {
  const canvas = await renderPageToCanvas(page, 3); // 3x high-res
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export async function exportPageToJPEG(page: JournalPage, filename = "bujo_page.jpg") {
  const canvas = await renderPageToCanvas(page, 3);
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/jpeg", 0.95);
  link.click();
}

export async function exportJournalToPDF(journal: JournalDocument, filename = "AYXA_Bullet_Journal.pdf") {
  const windowPrint = window.open("", "_blank");
  if (!windowPrint) return;

  const canvasPromises = journal.pages.map((p) => renderPageToCanvas(p, 2));
  const canvases = await Promise.all(canvasPromises);
  const dataUrls = canvases.map((c) => c.toDataURL("image/png"));

  const imgTags = dataUrls
    .map(
      (url) =>
        `<div style="page-break-after: always; display: flex; justify-content: center; align-items: center; height: 100vh;">
          <img src="${url}" style="max-width: 100%; max-height: 100%; object-fit: contain; box-shadow: 0 4px 20px rgba(0,0,0,0.15);" />
        </div>`
    )
    .join("");

  windowPrint.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${journal.title}</title>
        <style>
          @page { size: auto; margin: 0; }
          body { margin: 0; background: #111; color: white; font-family: sans-serif; }
        </style>
      </head>
      <body>
        ${imgTags}
        <script>
          setTimeout(() => { window.print(); }, 500);
        </script>
      </body>
    </html>
  `);
  windowPrint.document.close();
}
