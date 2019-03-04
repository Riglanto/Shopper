const ENDINGS = [
    'UyMiU3RCU3RA',
    'lMjIlN0QlN0Q',
    'JTIyJTdEJTdE',
]
const DICT = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.'

const SHIFT = 42
const A = 'a'.charCodeAt(0)
const M = 'm'.charCodeAt(0)
export function decode(query: string) {
    const q = query.toLowerCase()
    let core = ''
    let shift = SHIFT + (q.length > 1 ? 1 : 0)
    for (let i = 0; i < q.length; ++i) {
        const char = q[i]
        const charIndex = DICT.indexOf(char)
        const step = (char.charCodeAt(0) - A) * 3
        const j = (charIndex + shift + step) % DICT.length
        if (i === 0) {
            const rotations = (charIndex + shift + step) / DICT.length - 1
            const prefix = String.fromCharCode(M + rotations)
            core += prefix
        }
        core += DICT.charAt(j)
        // core += DICT.charAt(j - step * i)
        // console.log(char, char_index, step, shift, j, DICT.charAt(j))
        // console.log(step)
        shift += 28
    }
    return `${core}${getEnding(q)}`
}

function getEnding(query: string) {
    return ENDINGS[query.length % 3]
}