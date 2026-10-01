import type { DesignDefinition, DesignId } from './types.ts';
import { currentDesign } from './designs/current.ts';
import { flatDesign } from './designs/flat.ts';
import { glassDesign } from './designs/glass.ts';
import { brutalistDesign } from './designs/brutalist.ts';
import { terminalDesign } from './designs/terminal/terminalDefinition.ts';

export const DESIGNS: Record<DesignId, DesignDefinition> = {
  current: currentDesign,
  flat: flatDesign,
  glass: glassDesign,
  brutalist: brutalistDesign,
  terminal: terminalDesign,
};

export const DESIGN_LIST: DesignDefinition[] = Object.values(DESIGNS);

export function getDesign(id: string): DesignDefinition {
  return DESIGNS[id as DesignId] || DESIGNS.current;
}
