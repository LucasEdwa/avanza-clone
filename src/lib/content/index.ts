import { SPARA } from "./spara";
import { BOLAN, PENSION } from "./bolan-pension";
import { LAR } from "./lar";
import type { PageDef } from "./types";

export const PAGES: Record<string, PageDef> = { ...SPARA, ...BOLAN, ...PENSION, ...LAR };
