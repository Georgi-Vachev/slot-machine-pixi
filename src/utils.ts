export function delay(timeInSec: number) {
  return new Promise(resolve => setTimeout(resolve, timeInSec * 1000));
}