import background from './background.jpg'
import * as img from './*.png';

export const urls = Object.freeze([
    {alias: 'background', src: background},
    ...Object.entries(img).map(([alias, src]) => ({alias, src}))
]);