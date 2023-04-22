export type Theme = Record<string, ComponentStyle>;

export type ComponentStyle = {
  componentName?: string;
  name?: string;
  mapsToKey: string;
  mapsToName?: string;
  mapsToComponentName?: string;
};
