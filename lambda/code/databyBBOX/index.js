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

    //Read BBOX from queryStringParameters
    let query = event.queryStringParameters
    let { bbox } = query
    console.log(bbox)
    if (!bbox)
        return responseObject(callback, 400, 'BBOX query parameter is required')
    let coords = bbox.split(',')
    console.log(coords)
    if (coords.length != 4)
        return responseObject(callback, 400, 'BBOX must contain four coorindates e.g xmin,ymin,xmax,ymax')


    // Build the query
    let qs = `SELECT ogc_fid as id, geometry_x as x, geometry_y as y, name FROM open_names.names WHERE geom @ ST_MakeEnvelope($1, $2, $3, $4, ${27700})`;

    //Connect and execute the query
    client.connect()
    client.query(qs, coords)
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