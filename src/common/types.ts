export type ThemeStyleKey = string;

export type Theme = Record<ThemeStyleKey, ComponentStyle>;

export type ComponentStyle = {
  componentName?: string;
  name?: string;
  mapsToKey: ThemeStyleKey;
  mapsToName?: string;
  mapsToComponentName?: string;
};
