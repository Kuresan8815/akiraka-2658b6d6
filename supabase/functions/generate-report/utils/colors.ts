
export function hexToRGB(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

export const defaultColors = ['#9b87f5', '#7E69AB', '#6E59A5', '#8B5CF6', '#D946EF', '#F97316', '#0EA5E9'];
