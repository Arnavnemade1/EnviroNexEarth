/// <reference types="vite/client" />

declare module '*.geojson' {
  const value: {
    type: string;
    features: Array<{
      type: string;
      geometry: {
        type: string;
        coordinates: number[][][] | number[][][][];
      };
      properties?: Record<string, unknown>;
    }>;
  };
  export default value;
}
