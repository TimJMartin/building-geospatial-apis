const pg = require('pg')

 // Return the results in Lambda Proxy format
const responseObject = (callback, code, response) => callback(null, {
  statusCode: code,
  headers: {
        'Content-Type': 'application/json',
    },
  body: JSON.stringify(response, null, 2)
})

exports.handler = (event, context, callback) => {
    //Setup PG Client connection
    const client = new pg.Client({
        user: 'postgres',
        host: 'x',
        database: 'x',
        password: 'x',
        port: 5432
    });

    // Read path
    let path = event.pathParameters
    if(!path) 
        return responseObject(callback, 400, 'No Path Parameter supplied')
        
    // Validate path params
    let { id } = path
    if (!id)
        return responseObject(callback, 400, 'id is required')

    // Build the query
    let qs = `SELECT ogc_fid as id, geometry_x as x, geometry_y as y, name FROM open_names.names WHERE ogc_fid = ${id}`;

    //Connect and execute the query
    client.connect()
    client.query(qs)
        .then(result => {
          // Release the client and handle the response
          client.end()
          console.log(`${result.rows.length} results found`)
          if(result.rows.length === 0) {
              responseObject(callback, 404, 'No results found')
          } else {
            responseObject(callback, 200, result.rows[0])
          }
        })
        .catch(err => {
            console.error(err)
            responseObject(callback, 500, err)
        })
}