# Module used

[Neode](http://github.com/adam-cowley/neode) package for NodeJS. OGM for Neo4j.

## Routes

GET /api/users

GET /api/users/:id

GET /api/query/lineage/:id

GET /api/query/promo/:end_year

GET /api/users/find?firstname=&lastname=&end_year=

POST /api/users

POST /api/relationship

PUT /api/users/:id

DELETE /api/users/:id

## Models

The basic models are defined in the `./models` directory.

### Running the server
Create the `.env` file at the root of the project and update with the credentials for your Neo4j instance.

```
NEO4J_PROTOCOL=bolt
NEO4J_HOST=localhost
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=test
NEO4J_PORT=7687
```

Then run the server

```javascript
npm install
node server.js
```
### Put some data in neo4j

Post using application/json header

#### Post to http://localhost:3000/api/users to create users

```
{
    "firstname": "hugo",
    "lastname": "lacombe",
    "birthdate": "26/09/1997",
    "email": "salut@tous",
    "phone": "0000000"
}
```

#### Post to http://localhost:3000/api/relationship to create relationship (using users id)
```
{
	"actor": "__id1__",
	"other": "__id2__",
	"type":"follows",
	"properties" : { "since" : "12" }
}
```