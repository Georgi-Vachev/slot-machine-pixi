import background from 'url:./background.jpg'
import * as img from 'url:./*.png';

export const urls = Object.freeze([
    { alias: 'background', src: background },
    ...Object.entries(img).map(([alias, src]) => ({ alias, src }))
]);