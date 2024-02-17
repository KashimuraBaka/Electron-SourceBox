/**
 * 快速生成textShadows字描边木板
 * @param num_points 描边次数
 * @param radius 描边大小
 * @param units 描边单位
 * @param colour 描边颜色
 * @returns 描边样式
 */
function textStorke(num_points: number, radius: number, units: string, colour: string) {
  const shadows: string[] = []
  for (let i = 0; i < num_points; i++) {
    const t = (i * 2 * Math.PI) / num_points
    const x = Math.sin(t) * radius
    const y = Math.cos(t) * radius
    shadows.push(`${x.toFixed(3) + units} ${y.toFixed(3) + units} ${colour}`)
  }
  return shadows.join(', ')
}

export default { textStorke }
