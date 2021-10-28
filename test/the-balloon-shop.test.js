let assert = require("assert");
let TheBalloonShop = require("../the-balloon-shop");
const pg = require("pg");
const Pool = pg.Pool;

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:12345@localhost:5432/my_balloon_test';;

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false,
    },
});

describe('The balloon function', function () {


    beforeEach(async function () {
        await pool.query("delete from valid_color;");
    });

    it('should get the valid colors', async function () {

        const theBalloonShop = TheBalloonShop(pool, ['Orange', 'Purple', 'Lime']);
        await theBalloonShop.populatedColours();

        assert.equal(['Orange', 'Purple', 'Lime'], theBalloonShop.getValidColors());

    });

    it('should get invalid colors', async function () {

        const theBalloonShop = TheBalloonShop(pool, ['Orange', 'Purple', 'Lime']);

        await theBalloonShop.requestColor('Blue');
        await theBalloonShop.requestColor('Red');
        await theBalloonShop.requestColor('Green');

        assert.equal(['Blue', 'Red', 'Green'], theBalloonShop.getInvalidColors());

    });

    it('should return count for a specific color', async function () {
        const theBalloonShop = TheBalloonShop(pool, ['Orange', 'Purple', 'Lime']);

        await theBalloonShop.requestColor('Orange');
        await theBalloonShop.requestColor('Orange');
        await theBalloonShop.requestColor('Purple');
        await theBalloonShop.requestColor('Orange');
        await theBalloonShop.requestColor('Purple');
        await theBalloonShop.requestColor('Orange');
        await theBalloonShop.requestColor('Lime');

        assert.equal(4, await theBalloonShop.colorCount('Orange'));
        assert.equal(1, theBalloonShop.colorCount('Lime'));
        assert.equal(2, await theBalloonShop.colorCount('Purple'));

    })

    it('should get all the colors - valid & invalid', async function () {

        const theBalloonShop = TheBalloonShop(pool, ['Orange', 'Purple', 'Lime']);

        await theBalloonShop.requestColor('Blue')
        await theBalloonShop.requestColor('Red')

        assert.equal(['Orange', 'Purple', 'Lime', 'Blue', 'Red'], await theBalloonShop.allColors());

    })

    it('an invalid color should become a valid color after 5 requests', async function () {

        const theBalloonShop = TheBalloonShop(pool, []);

        assert.equal([], await theBalloonShop.getValidColors());

        await theBalloonShop.requestColor('Blue')
        await theBalloonShop.requestColor('Blue')
        await theBalloonShop.requestColor('Red')
        await theBalloonShop.requestColor('Blue')
        await theBalloonShop.requestColor('Blue')

        assert.equal(['Blue', 'Red'], theBalloonShop.getInValidColors());

        await theBalloonShop.requestColor('Blue')

        assert.equal(['Blue'], await theBalloonShop.getValidColors());
        assert.equal(['Red'], await theBalloonShop.getInValidColors());

    });

    after(function () {
        pool.end();
    })
});