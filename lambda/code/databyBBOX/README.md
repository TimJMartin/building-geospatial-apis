AWS Lambda: Get data by BBOX
----------------------------
----------------------------

Here we create a new AWS Lambda function that will query our PostGIS database using the bbox query parameter. If you have not done the previous part then start there first as this builds on from it.

So login to AWS and create a new blank AWS Lambda function using the 'Author from scratch' option, with no trigger. Call it 'geospatialBBOX', and however this time reuse the role we created previously.

As we have not used a blueprint the intial code will look like this.

```
exports.handler = (event, context, callback) => {
    // TODO implement
    callback(null, 'Hello from Lambda');
};
```

So remove that code and reuse the code we wrote for the byID function as that is a good starting point, we just need to make some small changes.

As this endpoint does not use a path parameter we can remove that part of our code and replace with a test for our bbox query paramter.

```
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
```

Here we set query to be the event.queryStringParameter and then test to see if bbox query paramter is supplied. If not return a 400 error and then also test to make sure the bbox contains four coordinates, again if not return a 400 error.

Next swap our qs for the following

```
// Build the query
let qs = `SELECT ogc_fid as id, geometry_x as x, geometry_y as y, name FROM open_names.names WHERE geom @ ST_MakeEnvelope($1, $2, $3, $4, ${27700})`;
```

This query uses our bbox coordinates to make a rectangle and use that to intersect against our OS Open Names data.

Our pg query code is slightly different too as we are likely to receieve more than one feature so that code should be

```
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
```

Here we return a successfull 200 if the result array contains more than one row, if not return a 404 No results found error response.

Now configure a test event that uses the queryStringParameter with a bbox of 200000,200000,205000,205000

Run the test - did you get results?

If not add check the consolt.log messages and/or the response and try and debug.

