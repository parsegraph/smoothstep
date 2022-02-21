export default function smoothstep(x: number): number {
  return x * x * (3 - 2 * x);
}

export function smoothlerp(a:number, b:number, x: number): number {
  return a + smoothstep(x) * (b - a);
}
