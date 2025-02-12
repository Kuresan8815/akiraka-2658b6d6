
export function hexToRGB(hex: string): [number, number, number] {
  // Default fallback color (soft blue)
  const defaultColor: [number, number, number] = [59, 130, 246];
  
  // Validate hex color format
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
    console.warn(`Invalid hex color: ${hex}, using default color`);
    return defaultColor;
  }

  try {
    // Remove the hash if present
    const cleanHex = hex.replace('#', '');
    
    // Handle both short and long form hex
    const normalized = cleanHex.length === 3 
      ? cleanHex.split('').map(char => char + char).join('')
      : cleanHex;

    if (normalized.length !== 6) {
      console.warn(`Invalid hex length: ${hex}, using default color`);
      return defaultColor;
    }

    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);

    // Validate each color component
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      console.warn(`Invalid hex values: ${hex}, using default color`);
      return defaultColor;
    }

    return [r, g, b];
  } catch (error) {
    console.error(`Error converting hex color: ${hex}`, error);
    return defaultColor;
  }
}
