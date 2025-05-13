# Running pipeline standalone (i.e., not running in the pipeline docker container)

### install sbt

https://www.scala-sbt.org/download.html

### compile code using sbt-assembly plugin to create a project JAR file with all of its dependencies
```
sbt assembly
```
the jar file generated is at `target/scala-2.11/TIC preprocessing-assembly-0.1.0.jar`

### process data

```
spark-submit --driver-memory=2g --executor-memory=2g --master <spark host> --class tic.Transform <sbt assembly output> --mapping_input_file <mapping file> --data_input_file <data file> --data_dictionary_input_file <data dictionary file> --data_mapping_files <data mapping files> --output_dir <output dir> [--redcap_application_token <token>]
```

### install csvkit

```
pip install csvkit
pip install psycopg2-binary
```

### create db

```
create user <uid> with password '<pwd>';
create database "<db>";
grant all on database "<db>" to <uid>;
```

### populate db
In output dir, execute

```
csvsql --db "postgresql://<uid>:<pwd>@<host>/<db>" --insert --no-create -p \\ -e utf8 --date-format "%y-%M-%d" tables/*
```

# Running pipeline in the pipeline docker container
All dependencies as shown above in the running pipeline standalone section have been satisfied and encapsulated in the pipeline 
[Dockerfile](https://github.com/RENCI/tic-map-pipeline-script/blob/master/Dockerfile). As such, running the pipeline via 
Docker in a container is sufficient to streamline the whole data transformation pipeline and populate the CTMD database. When 
pipeline code is changed, all that is needed is to rebuild the pipeline image from the [tic-map-pipeline-script repo](https://github.com/RENCI/tic-map-pipeline-script)
and push the rebuilt image to txscience organization in dockerhub. When the code changes are significant enough to warrant a new version of the pipeline image, 
the referenced pipeline image in [docker-compose.yml for local development environment in the ctmd-dashboard repo](https://github.com/RENCI/ctmd-dashboard/blob/master/docker-compose.yml#L19) 
and in [docker-compose.prod.yml for non-local development environment, e.g., production, stage, and dev environments, in the ctmd-dashboard repo](https://github.com/RENCI/ctmd-dashboard/blob/master/docker-compose.prod.yml)
need to be updated accordingly to pick up the updated pipeline image version. The sequence of the involved commands are listed below for easy reference.

- `docker build . -t txscience/ctmd-pipeline-reload:<version>` to build an updated pipeline docker image from tic-map-pipeline-script directory where Dockerfile is located.
- `docker login --username=<your_user_name>` followed by `docker push txscience/ctmd-pipeline-reload:<version>` to push the pipeline image to dockerhub. You will have to have permission in dockerhub to do so.
- Update [docker-compose.prod.yml for non-local development environment, e.g., production, stage, and dev environments, in the ctmd-dashboard repo](https://github.com/RENCI/ctmd-dashboard/blob/master/docker-compose.prod.yml) and [docker-compose.yml for local development environment in the ctmd-dashboard repo](https://github.com/RENCI/ctmd-dashboard/blob/master/docker-compose.yml#L19)
accordingly as needed to correspond to the latest pipeline image version if the image version is changed.
- Refer to the [README.md file in tic-map-pipeline-script repo](https://github.com/RENCI/tic-map-pipeline-script/blob/master/README.md) for description of environment variables which could be updated 
when building ctmd-dashboard in the `.env` file. See [.env.sample](https://github.com/RENCI/ctmd-dashboard/blob/master/.env.sample) for an example of what `.env` file looks like. 

If any of the inputs required to run the pipeline were changed, for example, mapping.json input file, or redcap input data or redcap data dictionary were changed, 
code in the map-pipeline-schema repo, mainly code in [HEALMapping.hs](https://github.com/RENCI/map-pipeline-schema/blob/a97997eb66824875afaf6b99f479a6968e4035c9/src/PMD/HEALMapping.hs) 
need to be updated accordingly to map the redcap data fields into the database tables with the correct types. Then rebuilding the pipeline docker image will create an updated 
tables.sql file by running the updated pipeline schema code. When ctmd dashboard runs, the mapping.json file will be mounted to the pipeline container, and the updated tables.sql file 
will correspond to the updated mapping.json, and the data transformation in the pipeline should run through. 
 
