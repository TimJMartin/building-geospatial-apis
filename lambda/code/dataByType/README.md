AWS Lambda: Get data by Type
----------------------------
----------------------------

The AWS Lambda function we will write now will respond to our /data/type/{localtype} endpoint with the optional query parameters of LIMIT and PAGE.

As before login to AWS and create a new blank AWS Lambda function using the 'Author from scratch' option, with no trigger. Call it 'geospatialTYPE', and however this time reuse the role we created previously.

As we have not used a blueprint the intial code will look like this.

```
exports.handler = (event, context, callback) => {
    // TODO implement
    callback(null, 'Hello from Lambda');
};
```

Remove all that code and replace with the code from either the dataBYID or dataBYBBOX that we wrote previously.

We will start by checking for the event.pathParameters object and that a localtype has been provided

```
// Read path
let path = event.pathParameters
if(!path) 
    return responseObject(callback, 400, 'No Path Parameter supplied')
    
// Validate path params
let { localtype } = path
if (!localtype)
    return responseObject(callback, 400, 'localtype is required')
```

Next we need to set default values for LIMIT and PAGE and replace them if they have been provided in the query

```
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
```

Replace our query with a new one

```
// Build the query
let qs = `SELECT ogc_fid as id, geometry_x as x, geometry_y as y, name FROM open_names.names WHERE local_type = '${localtype}' LIMIT ${limit} OFFSET ${offset}`;
```

If our query exceeds the default 100, then adding PAGE enables the user to step to the next 100 results, this uses OFFSET to query the database.

Our client.query code is the same as for dataBYBBOX as we expect to want to return all results.

Next configure a text event that has a pathParameter of localtype with a value of any of the following:
- City
- Town
- Village
- Hamlet
- Other Settlement
- Suburban Area
- Named Road
- Numbered Road
- Section Of Named Road
- Section Of Numbered Road
- Postcode

(these are the OS Open Names local types).

Run the event, did you get 100 results (look at the console logs to see the count)?

Next play around with adding the queryStringParameters of LIMIT and PAGE and see what results you get.

Congratualtions you now have 4 AWS Lambda functions which query a database based on either pathParameters or queryStringParameters or both and return them as a response with the correct headers and statusCode.

Up next how to use AWS API Gateway to use our Swagger file and wire them up to our AWS Lambda functions.