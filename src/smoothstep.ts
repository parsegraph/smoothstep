export default function smoothstep(x:number):number {
  return x * x * (3 - 2 * x);
}
