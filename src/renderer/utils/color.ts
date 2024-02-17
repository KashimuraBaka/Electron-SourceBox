function getContrastRatio(color1: string, color2: string) {
  const luminance1 = getLuminance(color1)
  const luminance2 = getLuminance(color2)
  const brightest = Math.max(luminance1, luminance2)
  const darkest = Math.min(luminance1, luminance2)
  return (brightest + 0.05) / (darkest + 0.05)
}

function getLuminance(color: string) {
  const rgb = getRgb(color)
  const red = rgb[0] / 255
  const green = rgb[1] / 255
  const blue = rgb[2] / 255
  const luminance =
    0.2126 * getLuminancePart(red) +
    0.7152 * getLuminancePart(green) +
    0.0722 * getLuminancePart(blue)
  return luminance
}

function getLuminancePart(colorPart: number) {
  if (colorPart <= 0.03928) {
    return colorPart / 12.92
  } else {
    return Math.pow((colorPart + 0.055) / 1.055, 2.4)
  }
}

function getRgb(color: string) {
  const hex = color.replace('#', '')
  if (hex.length == 6) {
    return [
      parseInt(hex.substring(0, 2), 16),
      parseInt(hex.substring(2, 4), 16),
      parseInt(hex.substring(4, 6), 16)
    ]
  } else {
    const r = hex.substring(0, 1)
    const g = hex.substring(1, 2)
    const b = hex.substring(2, 3)
    return [parseInt(r + r, 16), parseInt(g + g, 16), parseInt(b + b, 16)]
  }
}

export default {
  getContrastRatio,
  getRgb
}
