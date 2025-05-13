# tic-map-pipeline-script

### How to build a docker image ###
# Need to update
```
git submodule update --init
```

```
docker build . -t txscience/ctmd-pipeline-reload:v2.5
```
where `txscience/ctmd-pipeline-reload:v2.5` is the pipeline image name 
and version tag to build. Update the image name and version tag as needed 
as part of the CTMD release process. This pipeline image tag must 
correspond to [this line in docker-compose.prod.yml](https://github.com/RENCI/ctmd-dashboard/blob/master/docker-compose.prod.yml#L19) 
and [this line in docker-compose.yml](https://github.com/RENCI/ctmd-dashboard/blob/master/docker-compose.yml#L19)
of [CTMD Dashboard](https://github.com/RENCI/ctmd-dashboard/) in order 
for the latest built pipeline image to be used for CTMD Dashboard. 

### How to push docker image to dockerhub
```
docker login --username=your_dockerhub_username
docker push txscience/ctmd-pipeline-reload:v2.5
```
Update the pipeline image tag to be pushed as needed. 

### How to run test ###


```
cd tic-map-pipeline-script
docker build . -t ctmd-pipeline-reload:v2.5
cd tic-map-pipeline-script/test
docker-compose down
docker-compose up --build --exit-code-from pipeline
```
## environment

`POSTGRES_DATABASE_NAME` postgres database name

`POSTGRES_USER` postgres user

`POSTGRES_PASSWORD` postgres password

`POSTGRES_PORT` postgres port    

`POSTGRES_HOST` postgres host

`REDCAP_APPLICATION_TOKEN` redcap application token

`REDCAP_URL_BASE` redcap url base

`POSTGRES_DUMP_PATH` postgres dump path

`AUXILIARY_PATH` path to auxiliary files to be left joined with source data (source data is left)

`FILTER_PATH` path to filter files to be inner joined with source data

`BLOCK_PATH` path to block files to be right joined with source data and removed

`RELOAD_SCHEDULE` set to `1` to daily reload

`SCHEDULE_RUN_TIME` schedule run time of reload format `HH:MM`

`RELOAD_DATABASE` set to `1` to reload database on start up

`SERVER` set to `1` to run a REST API

`CREATE_TABLES` set to `1` to create tables in database from `data/tables.sql`

`INSERT_DATA` set to `1` to insert data in database from `data/tables`

`REDIS_QUEUE_HOST` redis host for task queue

`REDIS_QUEUE_PORT` redis port for task queue

`REDIS_QUEUE_DB` redis database for task queue

`REDIS_LOCK_HOST` redis host for distributed locking

`REDIS_LOCK_PORT` redis port for distributed locking

`REDIS_LOCK_DB` redis database for distributed locking

`REDIS_LOCK_EXPIRE` expire time for distributed locking in seconds

`REDIS_LOCK_TIMEOUT` timeout for distributed locking in seconds

`PAUSE` pause at the end of test must be run using the run command
## api

list all backups
```
GET /backup
```

create a new backup
```
POST /backup
```

delete a backup
```
DELETE /backup/<backup>
```

restore from a backup
```
POST /restore/<backup>
```

sync with source
```
POST /sync
```

insert data into table in csv
```
POST /table/<tablename>
```
csv should have matching header as the table 

get data from table in json
```
GET /table/<tablename>
```

list all tasks
```
GET /task
```

list a task
```
GET /task/<id>
```

delete task
```
DELETE /task/<id>
```

get table
```
GET /table/<table>
```

overwrite table
```
PUT /table/<table>
```
with file `data` in csv with header in utf-8 encoding or json, and `json` for additional columns, and `content-type` for content type of the data, `has_comments` whether it has comments

append table
```
POST /table/<table>
```
with file `data` in csv with header in utf-8 encoding or json, and `json` for additional columns, and `content-type` for content type of the data, `has_comments` whether it has comments

update table
```
POST /table/<table>/column/<column>
```
with file `data` in csv with header in utf-8 encoding or json, and `json` for additional columns, and `content-type` for content type of the data, `has_comments` whether it has comments

## Procedures to run the TIC pipeline

- Install the TIC pipeline software on your computer
  - get docker installed on your computer. See [here](https://docs.docker.com/get-docker/) for instructions.
  - In tic-map-pipeline-script directory, Run `docker build . -t <pipeline_image_with_tag>` to build a pipeline docker image. You can replace <pipeline_image_with_tag> with the image name and tag you want, e.g., replacing it with txscience/ctmd-pipeline-reload:v2.5.
  - 
- Translate a Redcap codebook and dataset into structural data that can be searched and visualized
- Set up data filters
- Update mapping.json
- Transform data with new filters/mapping/schema
- How to contribute
