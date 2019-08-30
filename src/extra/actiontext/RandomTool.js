export function getRandomNumber(range, offset) {
    return Math.floor(Math.random() * range + (offset ? offset : 0));
}

export function getRandomColor(opacity) {
    return `rgba(${getRandomNumber(255)}, ${getRandomNumber(255)}, ${getRandomNumber(255)}, ${opacity ? opacity : 0.3})`;
}

export function getRandomColorRGB() {
    return {
        r: getRandomNumber(255),
        g: getRandomNumber(255),
        b: getRandomNumber(255)
    }
}
export function toRGBA(object, opacity) {
    if(object.r) {
        return `rgba(${object.r}, ${object.g}, ${object.b}, ${opacity || 1}`;
    }
    return object;
}