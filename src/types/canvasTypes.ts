export type LayerType =
  | "sticker"
  | "text"
  | "shape"
  | "drawing"
  | "image"
  | "washiTape"
  | "stamp";

export type PaperTextureType =
  | "dotted"
  | "grid"
  | "lined"
  | "blank"
  | "kraft"
  | "music"
  | "isometric";

export type ShapeKind =
  | "rectangle"
  | "rounded-rectangle"
  | "circle"
  | "line"
  | "arrow"
  | "star"
  | "heart"
  | "polygon";

export type BrushStyle =
  | "fineliner"
  | "marker"
  | "watercolor"
  | "calligraphy"
  | "dashed"
  | "glitter";

export type BlendModeType =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten";

export type TemplateCategory =
  | "planning"
  | "trackers"
  | "finance"
  | "study"
  | "goals"
  | "decorative"
  | "my-templates";

export interface CanvasPoint {
  x: number;
  y: number;
  pressure?: number;
}

export interface StrokePath {
  id: string;
  points: CanvasPoint[];
  color: string;
  width: number;
  opacity: number;
  brushStyle: BrushStyle;
}

export interface CanvasLayer {
  id: string;
  type: LayerType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // in degrees
  opacity: number; // 0 to 1
  zIndex: number;
  locked: boolean;
  visible: boolean;
  blendMode: BlendModeType;
  groupId?: string;
  props: {
    // Text props
    text?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
    color?: string;
    textAlign?: "left" | "center" | "right" | "justify";
    letterSpacing?: number;
    lineHeight?: number;
    textHighlight?: string;
    curvedText?: boolean;
    curveRadius?: number;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    strokeColor?: string;
    strokeWidth?: number;

    // Drawing props
    strokes?: StrokePath[];

    // Shape props
    shapeKind?: ShapeKind;
    fillColor?: string;
    fillGradient?: { start: string; end: string; angle: number };
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;

    // Image / Photo props
    src?: string;
    filterBrightness?: number; // 0-200, default 100
    filterContrast?: number;   // 0-200, default 100
    filterSaturation?: number; // 0-200, default 100
    filterWarmth?: number;     // -50 to 50, default 0
    flipX?: boolean;
    flipY?: boolean;
    cropShape?: ShapeKind;     // Mask image inside shape
    polaroidFrame?: boolean;
    polaroidCaption?: string;

    // Sticker / Washi tape / Stamp props
    stickerCategory?: string;
    stampSymbol?: string;
    pattern?: "stripes" | "florals" | "polkadot" | "solid" | "glitter" | "grid";
    tapeColor?: string;
  };
}

export interface PageBackground {
  type: PaperTextureType;
  color: string;
  gridColor?: string;
  gridSize?: number;
  imageUrl?: string;
}

export interface PageSize {
  name: "A4" | "A5" | "Letter" | "Instagram Square" | "Custom";
  width: number;
  height: number;
}

export interface JournalPage {
  pageId: string;
  title: string;
  size: PageSize;
  background: PageBackground;
  layers: CanvasLayer[];
  createdAt: number;
  updatedAt: number;
}

export interface JournalDocument {
  id: string;
  title: string;
  isLocked?: boolean;
  pinCode?: string;
  pages: JournalPage[];
  activePageIndex: number;
  createdAt: number;
  updatedAt: number;
}

export interface TemplateSpread {
  id: string;
  title: string;
  description: string;
  category: TemplateCategory;
  palette: string[];
  icon: string;
  page: JournalPage;
}

export type ActiveTool =
  | "select"
  | "pen"
  | "text"
  | "shapes"
  | "stickers"
  | "images"
  | "washi"
  | "stamps"
  | "templates"
  | "background"
  | "eraser";
