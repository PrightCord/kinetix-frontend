export type DesignId = 'current' | 'flat' | 'glass' | 'brutalist' | 'terminal';

export interface DesignThemeTokens {
  fontBody?: string;
  fontHeading?: string;
  paper?: string;
  ink?: string;
  surface?: string;
  surfaceRaised?: string;
  border?: string;
  radius?: string;
  shadow?: string;
  accent?: string;
}

export interface DesignDefinition {
  id: DesignId;
  name: string;
  tagline: string;
  description: string;
  level: 1 | 2 | 3;
  themeTokens?: DesignThemeTokens;
  cssClass: string;
  features: string[];
}
