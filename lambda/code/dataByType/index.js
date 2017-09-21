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
    let { localtype } = path
    if (!localtype)
        return responseObject(callback, 400, 'localtype is required')

    //Read queryStringParameters
    let limit = 100
    let page = 0
    let offset = 0
    let query = event.queryStringParameters
    console.log(query)
    if(query) {
        if(query.limit) {
            limit = query.limit
        }
        if(query.page) {
            page = query.page
        }
        offset = page * limit
    }

    // Build the query
    let qs = `SELECT ogc_fid as id, geometry_x as x, geometry_y as y, name FROM open_names.names WHERE local_type = '${localtype}' LIMIT ${limit || 1} OFFSET ${offset || 0}`;
    console.log(qs)

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
            responseObject(callback, 200, result.rows)
          }
        })
        .catch(err => {
            console.error(err)
            responseObject(callback, 500, err)
        })
}