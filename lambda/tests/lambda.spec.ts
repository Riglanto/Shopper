import { decode } from '../decoder'
import { getProducts, buildTrolley } from '../api'
import { config } from '../config'

const PRODUCTS_IDS = [
    '2003009324595',
    '2003120112699',
    '2003010750390',
    '2003000101928',
    '2003009324601',
    '2003010363910',
    '2003008961531',
    '2003008961548',
    '2003009909747',
    '2003009324632',
    '2003009909785',
    '2003007405715',
    '2003010889106',
    '2003009324618',
    '2003011767861',
    '2003007110916'
]

const TEST_CASES = [
    ['a', 'mElMjIlN0QlN0Q'],
    ['b', 'mIlMjIlN0QlN0Q'],
    ['c', 'mMlMjIlN0QlN0Q'],
    ['d', 'mQlMjIlN0QlN0Q'],
    ['e', 'mUlMjIlN0QlN0Q'],
    ['f', 'mYlMjIlN0QlN0Q'],
    ['g', 'mclMjIlN0QlN0Q'],
    ['h', 'mglMjIlN0QlN0Q'],
    ['i', 'mklMjIlN0QlN0Q'],
    ['j', 'molMjIlN0QlN0Q'],
    ['k', 'mslMjIlN0QlN0Q'],
    ['l', 'mwlMjIlN0QlN0Q'],
    ['m', 'm0lMjIlN0QlN0Q'],
    ['p', 'nAlMjIlN0QlN0Q'],
    ['u', 'nUlMjIlN0QlN0Q'],
    ['y', 'nklMjIlN0QlN0Q'],
    ['z', 'nolMjIlN0QlN0Q'],
    ['aa', 'mFhJTIyJTdEJTdE'],
    // ['bb', 'mJiJTIyJTdEJTdE'],
    // ['ab', 'mFiJTIyJTdEJTdE'],
    // ['aaa', 'mFhYSUyMiU3RCU3RA'],
    // ['aaaa', 'mFhYWElMjIlN0QlN0Q']
]

describe('lambda', () => {
    describe('decodes', () => {
        for (const test of TEST_CASES) {
            const x = test[0]
            const y = test[1]
            it(x, () => {
                expect(decode(x)).toEqual(y)
            })
        }
    })

    describe('gets product', () => {
        it('cebula', async () => {
            const result = await getProducts('cebula')
            const products = result.products
            const count = result.count
            expect(products.length).toEqual(24)
            expect(products[1].name).toEqual('Cebula czerwona')
            expect(count).toEqual(35)
        })
        it('cebula 2nd page', async () => {
            const result = await getProducts('cebula', 2)
            const products = result.products
            const count = result.count
            expect(products.length).toEqual(11)
            expect(count).toEqual(35)
        })
    })

    describe('buildTrolley', async () => {
        it('add products to trolley', async () => {
            const rand = Math.floor(Math.random() * (PRODUCTS_IDS.length - 1))
            const products = [PRODUCTS_IDS[rand], PRODUCTS_IDS[rand + 1]]
            const res = await buildTrolley(config.email, config.password, products)
            expect(res.length).toEqual(products.length)
        })
        it('cannot login with incorect credentials', async () => {
            await expect(buildTrolley('test@test.com', '12345678', [])).rejects.toEqual('Incorrect credentials')
        })
    })
})