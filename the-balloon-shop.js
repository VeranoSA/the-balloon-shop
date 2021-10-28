module.exports = (pool, validColors) => {

/*Create database my_balloon_test
Valid colors are stored in a database table called **valid_color**. Valid colours should be pre-populated. 
Keep count of how many times a given color is requested (asked for)*/

    // insert valid colors into the database here
    async function populatedColours() {
        for (let i = 0; i < validColors.length; i++) {
            await pool.query('INSERT INTO valid_color (color_name, count) VALUES($1, 0)', [validColours[i]]);
        }
    }
    
    async function getValidColors() {
        return await pool.query('SELECT color_name From valid_color');
    }

    async function requestColor (color) {
        const sql = 'SELECT * FROM valid_color WHERE color_name=$1';
        const params = [color];
        let result = await pool.query(sql, params);
        if (result.rows ===[]) {
            const sql = 'SELECT count FROM valid_color WHERE color_name=$1';
            const params = [color];
            let result = await pool.query(sql, params)
            let colCount = result.row[0].count;
            colCount++;
            await pool.query('UPDATE valid_color SET count = $1', [colCount]);
        }

    }

    async function colorCount (color) {
        let sql = ('SELECT id FROM valid_color');
        let result = await client.query(sql);
        return result.rowCount;
    }

    function getInvalidColors () {

    }
     
    function allColors () {

    }

    return {
        getValidColors,
        requestColor,
        colorCount,
        getInvalidColors,
        allColors,
        populatedColours
    }
}