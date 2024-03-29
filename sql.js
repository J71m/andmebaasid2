var mssql = require('mssql');

var config = {
    user: 'testapp',
    password: 'testapp',
    server: '127.0.0.1\\sqlexpress',
    port: 1433,
    database: 'Petsitter',
    
    options: {
        encrypt: false // vaja kui Azure vms pilvebaasi külge ühendada
    }
}

var pool; // Koht, mis salvestab yhenduse info

(async function() {
    try {
        pool = await mssql.connect(config);

        console.log('Connected to DB');
    } catch (err) {
        // Log errors
        console.log('ERROR: ' + err);
    }
})()

exports.querySql = function(query, onData, onError) {
    try {
        //console.log('Getting data for: ' + query);

        pool.request()
            //.input('id', mssql.Int, id)
            .query(query)
            .then(result => {
                // data returns:
                //   data.recordsets.length
                //   data.recordsets[0].length
                //   data.recordset
                //   data.returnValue
                //   data.output
                //   data.rowsAffected
                
                if (onData !== undefined)
                    onData(result);
            })
            .catch(error => {
                if (onError !== undefined)
                    onError(error);
            });
    } catch (err) {
        // Log errors
        if (onError !== undefined)
            onError(err);
    }
}

mssql.on('error', err => {
    console.log('Error with MSSQL: ' + err);
})