# Clinical Trial Management Dashboard

- [Server Setup](#server-setup)
  + [Install Docker](#install-docker)
  + [Docker Post-Installation Steps](#docker-post-installation-steps)
  + [Install Docker Compose](#install-docker-compose)
- [Workflow](#workflow)
- [Application Setup](#application-setup)
  + [Clone](#clone)
  + [Set up Environment Variables](#set-up-environment-variables)
  + [Take a Snapshot of the Existing Database](#take-a-snapshot-of-the-existing-database)
- [Start](#start)
  + [Development](#development)
    * [Hot Reloading](#hot-reloading)
    * [Installing New Modules](#installing-new-modules)
  + [Production](#production)
    * [Prerequisites](#prerequisites)
    * [OK, Let's Go](#ok-lets-go)
- [Notes About Docker](#notes-about-docker)
  + [Detaching](#detaching)
  + [Tinkering in a Running Container](#tinkering-in-a-running-container)
- [Tear it Down](#tear-it-down)
- [References](#references)

## Server Setup

### Install Docker

Follow instructions in Docker docs for your OS. Here, we'll outline the steps for installing Docker on [CentOS](https://docs.docker.com/install/linux/docker-ce/centos/).

1. Ensure necessary utils are installed.

```bash
$ sudo yum install -y yum-utils device-mapper-persistent-data lvm2
```

2. Add Docker repo.

```bash
$ sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

3. Install Docker.

```bash
$ sudo yum install docker-ce
```

4. Start Docker.

```bash
$ sudo systemctl start docker
```

5. Verify everything is working as expected.

```bash
$ sudo docker run hello-world
```

The above command should show something like the following.

```bash
$ sudo docker run hello-world

Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (amd64)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://hub.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/get-started/

```

### Docker Post-Installation Steps

1. It makes for a better experience to not have to precede every Docker command with `sudo`, so we can make a user a member of the `docker` group to eliminate the need for that.

There is likely already a `docker` group, but check this by attempting to create one.

```bash
$ sudo groupadd docker
```

Add yourself to the `docker` group.

```bash
$ sudo usermod -aG docker $USER
```

Now log out and back in or execute `source ~/.bashrc` and you should be able to execute `docker run hello-world` with no permission errors thrown your way.

2. It's nice for Docker start automatically when the system reboots, which we can accomplish with the following command.

3. For more post-install options, check out [https://docs.docker.com/install/linux/linux-postinstall/](https://docs.docker.com/install/linux/linux-postinstall/).

```bash
sudo systemctl enable docker
```

### Install Docker Compose

These steps were pulled right from the [Docker documentation](https://docs.docker.com/compose/install/).

1. Install Docker Compose.

First, you may want to check the current release and replace the `1.23.2` in the command below if necessary.

```bash
$ sudo curl -L "https://github.com/docker/compose/releases/download/1.23.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

2. Make it executable.

Next, set the permissions to make the binary executable:

```bash
$ sudo chmod +x /usr/local/bin/docker-compose
```

3. Verify it's working as expected.

Then, verify that the installation was successful by checking the version:

```bash
$ docker-compose --version
```

This will print out the version you installed:

```bash
docker-compose version 1.23.2, build 1110ad01
```

## Workflow

Although unusual in this type of application, we attempt to follow a [semantic versioning](https://semver.org/) workflow and release pattern.

### Branching

- The `master` branch is the development branch.
- Feature branches are named `feature/some-cool-feature`.
- Patches are named `patch/short-term-fix-for-weird-thing`.
- Bug fixes are named `bugfix/fix-for-weird-thing`.
- `1.0-staging`, `1.1-staging`, `1.2-staging`, ... are test release branches branched fror deployment on the staging server.
- `1.0`, `1.1`, `1.2`, ... are production release branches, branched off the corresponding staging branch, to be deployed on the production server.

### Merging

We won't commit directly to the master branch. Crate a separate branch for any feature, patch, or bugfix, and submit a pull request, while tagging existing related issues where appropriate. When in doubt about creating a feature, patch, or bugfix branch, create an issue to discuss possible paths with the team.

## Application Setup

### Clone

Clone this repo or fork and clone your own.

```bash
$ git clone https://github.com/renci/ctmd-dashboard.git
```

For local development, create a branch off of master as detailed above.

For deloying to a production server, first determine the branch to deploy. for example, consider the case in which you wish to deploy version `1.19`. Presuming this branch is a tracked remote branch, you would begin by checking out branch `1.19` with the following command.

```bash
git checkout 1.19
```

This automatically creates a local copy of that remote branch. Proceed by setting up the required environment variables below and continue with deployment instruction farther down.

### Set up Environment Variables

Environment variables live in the file `./.env` in the project root. This file contains critical information to ensure communication between services running within Docker containers. The set of variables consists of database credentials, information about accessing the dashboard's API, REDCap database credentials, and data backup location. A brief desription of each environment variable follows.

- `POSTGRES_HOST`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`: These provide credentials to connect to the database container.
- `REACT_APP_API_ROOT`: Environment variables used in React begin with `REACT_APP_`. This variable is referenced in the front-ends source for defining the API endpoints. _This variable is only used in production._
- `API_PORT`: This is the port the `ctmd-api` container should serve the API.
- `REDCAP_APPLICATION_TOKEN`: This token grants access to the RedCap database. _This variable is only used in production._
- `POSTGRES_DUMP_PATH`: This is the location on the host where Postgres backups (via `pg_dump`) will be stored. _This variable is only used in production._
- `PAUSE`: TBA
- `RELOAD_SCHEDULE`: TBA
- `RELOAD_DATABASE`: TBA
- `SCHEDULE_RUN_TIME`: This variable sets the time on the host machine to schedule the database backup process.
- `AUXILIARY_PATH`: TBA
- `FILTER_PATH`: This variable defines the location of a CSV file indicating which proposals to filter from the dashboard interface. This file is a one-column CSV and must have the following structure.
- `IPAM_CONFIG_SUBNET`: This defines the subnet and gateway configurations for the network on which the containers will run.

```
ProposalId
171
186
```

Proposal IDs listed will be shown in the dashboard. If the file is not present, nothing will be filtered, and the dashboard will show all proposals. If the file is present but contains no proposal IDs, _i.e._, contains only the column title, like

```
ProposalId
```

then nothing will be shown in the dashboard.

When in doubt, use the `.env.sample` file as a guide (and it can be copied as-is to get things working out of the box for local development).

### Start 

In development, there are three services that we need to run. They are named `frontend`, `api`, and `db`, and the associated containers are prepended with `ctmd-`, and the development containers are appended with `-dev`. For example, the API is served in development from the container named `ctmd-api-dev`. One additional container called `pipeline` runs in production, which handles choreographing the persistence of data from the production host to the containerized application.

#### Development

Start all services required for development:

```bash
$ docker-compose up
```

The above command starts and attaches the necessary containers, which results in output like the following, consisting of interleaved logs from all running containers.

```bash
$ docker-compose up
Starting ctmd-db-dev ... 
Starting ctmd-db-dev
Starting ctmd-redis ... 
Starting ctmd-db-dev ... done
Starting ctmd-api-dev ... 
Starting ctmd-redis ... done
Starting ctmd-pipeline ... 
Starting ctmd-pipeline ... done
Starting ctmd-frontend-dev ... 
Starting ctmd-frontend-dev ... done
Attaching to ctmd-db-dev, ctmd-redis, ctmd-api-dev, ctmd-pipeline, ctmd-frontend-dev
ctmd-db-dev  | 2019-11-07 06:04:58.866 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
ctmd-db-dev  | 2019-11-07 06:04:58.866 UTC [1] LOG:  listening on IPv6 address "::", port 5432
ctmd-redis   | 1:C 07 Nov 2019 06:04:59.917 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
ctmd-redis   | 1:C 07 Nov 2019 06:04:59.917 # Redis version=5.0.5, bits=64, commit=00000000, modified=0, pid=1, just started
ctmd-redis   | 1:C 07 Nov 2019 06:04:59.917 # Configuration loaded
ctmd-db-dev  | 2019-11-07 06:04:58.874 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
ctmd-api-dev | 
ctmd-redis   | 1:M 07 Nov 2019 06:04:59.918 * Running mode=standalone, port=6379.
ctmd-api-dev | > api@1.0.0 start /usr/src/app
ctmd-api-dev | > nodemon app
ctmd-api-dev | 
ctmd-redis   | 1:M 07 Nov 2019 06:04:59.918 # WARNING: The TCP backlog setting of 511 cannot be enforced because /proc/sys/net/core/somaxconn is set to the lower value of 128.
ctmd-pipeline | INFO:reload:waiting for database to start host=db port=5432
ctmd-db-dev  | 2019-11-07 06:04:58.892 UTC [24] LOG:  database system was shut down at 2019-11-07 05:06:08 UTC
ctmd-redis   | 1:M 07 Nov 2019 06:04:59.918 # Server initialized
ctmd-pipeline | INFO:reload:database started host=db port=5432
ctmd-api-dev | [nodemon] 1.19.1
ctmd-db-dev  | 2019-11-07 06:04:58.901 UTC [1] LOG:  database system is ready to accept connections
ctmd-redis   | 1:M 07 Nov 2019 06:04:59.918 # WARNING overcommit_memory is set to 0! Background save may fail under low memory condition. To fix this issue add 'vm.overcommit_memory = 1' to /etc/sysctl.conf and then reboot or run the command 'sysctl vm.overcommit_memory=1' for this to take effect.
ctmd-pipeline | INFO:reload:waiting for redis to start host=redis port=6379
ctmd-redis   | 1:M 07 Nov 2019 06:04:59.918 # WARNING you have Transparent Huge Pages (THP) support enabled in your kernel. This will create latency and memory usage issues with Redis. To fix this issue run the command 'echo never > /sys/kernel/mm/transparent_hugepage/enabled' as root, and add it to your /etc/rc.local in order to retain the setting after a reboot. Redis must be restarted after THP is disabled.
ctmd-api-dev | [nodemon] to restart at any time, enter `rs`
ctmd-db-dev  | 2019-11-07 06:05:02.453 UTC [31] LOG:  incomplete startup packet
ctmd-pipeline | INFO:rq.worker:Worker rq:worker:927ddbe78c7b457ea66ded5ea3c57234: started, version 1.1.0
ctmd-redis   | 1:M 07 Nov 2019 06:04:59.978 * DB loaded from append only file: 0.061 seconds
ctmd-api-dev | [nodemon] watching: *.*
ctmd-pipeline | INFO:reload:redis started host=redis port=6379
ctmd-redis   | 1:M 07 Nov 2019 06:04:59.978 * Ready to accept connections
ctmd-db-dev  | 2019-11-07 06:05:02.466 UTC [32] ERROR:  relation "StudyPI" already exists
ctmd-api-dev | [nodemon] starting `node app.js`
ctmd-pipeline | INFO:reload:waiting for redis to start host=redis port=6379
ctmd-db-dev  | 2019-11-07 06:05:02.466 UTC [32] STATEMENT:  create table "StudyPI" ("AreYouStudyPI" boolean, "userId" bigint);
ctmd-api-dev | 
ctmd-db-dev  |   
ctmd-pipeline | INFO:rq.worker:*** Listening on default...
ctmd-api-dev | Shhh... I'm listening on port 3030.
ctmd-api-dev | 
ctmd-pipeline | INFO:reload:redis started host=redis port=6379
ctmd-pipeline | INFO:reload:create_tables=True
ctmd-pipeline | INFO:rq.worker:Cleaning registries for queue: default
ctmd-pipeline | INFO:reload:insert_data=False
ctmd-pipeline | INFO:reload:one_off=False
ctmd-pipeline | INFO:reload:realod=True
ctmd-pipeline | INFO:reload:create tables start
ctmd-pipeline |  * Serving Flask app "server" (lazy loading)
ctmd-pipeline |  * Environment: production
ctmd-pipeline |    WARNING: This is a development server. Do not use it in a production deployment.
ctmd-pipeline |    Use a production WSGI server instead.
ctmd-pipeline |  * Debug mode: off
ctmd-pipeline | INFO:werkzeug: * Running on http://0.0.0.0:5000/ (Press CTRL+C to quit)
ctmd-pipeline | INFO:reload:executing create table "StudyPI" ("AreYouStudyPI" boolean, "userId" bigint);
ctmd-pipeline | 
ctmd-pipeline | ERROR:reload:pipeline encountered an error when creating tablesrelation "StudyPI" already exists
ctmd-pipeline | 
ctmd-frontend-dev | 
ctmd-frontend-dev | > duke-tic@0.1.0 start /usr/src/app
ctmd-frontend-dev | > react-scripts start
ctmd-frontend-dev | 
ctmd-frontend-dev | Starting the development server...
  .
  .
  .
```

Errors should be easy to spot at this point. Once everything is started up, point your browser to `http://localhost:3000` to access the dashboard. The API is served to `http://localhost:3030` in case you need to play with it directly the browser or in Postman, say. Check the console for any errors that may prevent access to the application's frontend or API.

##### Hot Reloading

Note that the development `frontend-dev` and `api-dev` services start with React's development server and nodemon, respectively, allowing hot reloading. 

##### Installing New Modules

If a new NPM module is installed, the front-end image will need to be rebuilt. If, for example, someone on the project executes `npm install some-tool`, the next time `docker-compose up` is run, you will need to supply the `--build` flag so that `some-tool` is installed on the image before the container spins up.

Alternatively, this can also be done by installing the dependencies within a container. If you received an error in the browser such as `Module not found: Can't resolve '@name-space/module' in '/usr/src/app/src/components/someComponent'`, in which case you can log into the running `ctmd-frontend-dev` container and `npm install` it there in (the default location) `/usr/src/app`. Simply executing `docker exec -it ctmd-frontend-dev npm install` is a quick, easy way to handle this.

##### Frontend Development

- See the specific documentation for details on [frontend](frontend/README.md) and [API](api/README.md) development for this application's front-end.

#### Production

Running this in production is quite similar to running the development environment. A few things need to be in place first. Namely, we need to set up the aforementioned environment variables and set up authentication.

##### Prerequisites

###### API URL

The first thing the application needs set is the URL at which the frontend can access the container running the API. This is accomplished by specifying `REACT_APP_API_ROOT` in the environment variables file, `.env`. For example the corresponding line in the staging server for this application might look like `REACT_APP_API_ROOT=http://localhost/api/`.

If this is not done, you will see progress/loading spinners when you view the dashboard in your browser. This is because the frontend will be reaching out for data from the wrong location and thus never receive it.

###### REDCap Token

The `ctmd-pipeline` container must communicate with the RedCap database, thus the `REDCAP_APPLICATION_TOKEN` token must be set to access its API.

###### Postgres Dump Location

The `ctmd-pipeline` container manages taking snapshots of the postgres database in the `ctmd-db` container, and stores it in the location specified by `POSTGRES_DUMP_PATH`. The backup of data dictionary is also stored at this path.

###### HTTP Authentication

The production server will employ basic http authentication. For this, we'll need a password file, and Docker will look for the file `frontend/.htpasswd`. It holds usernames and hashed passwords, as the sample file--`./frontend/.htpasswd.sample` illustrates. To generate the hashed password, use `htpasswd` from `apache2-utils` or `httpd-tools`.

To add a user and password, use `htpasswd` by executing `htpasswd  ./frontend/.htpasswd [username]`, where `[username]` is replaced with the desired login username. Then you'll be prompted to enter a password twice.

The entire interaction shows output like the following.

```bash
$ sudo htpasswd ./frontend/.htpasswd myusername
New password: 
Re-type new password: 
Adding password for user myusername
```

This will append a new line with `[username]:[hashed-password]` in the `.htpasswd` file. To completely replace the `.htpasswd` file, with the specified user's credentials, use the `-c` flag:

```bash
sudo htpasswd -c ./frontend/.htpasswd myusername
```

If usernames are not set up, Nginx will throw a `500 Internal Server Error` at your browser when you try to access the site.

###### PAUSE

TBA

###### RELOAD_SCHEDULE

TBA

###### RELOAD_DATABASE

TBA

###### SCHEDULE_RUN_TIME

TBA

###### AUXILIARY_PATH

TBA

###### FILTER_PATH

TBA

##### OK, Let's Go

Build and start all three services using the production Docker Compose file, `docker-compose.prod.yml`, which is specified by the `-f` flag. In production, we commonly need to rebuild the images when we start the services and ru them in detached mode.

```bash
$ docker-compose -f docker-compose.prod.yml up --build -d -V
```

This serves the frontend to port `80` on the host, and is thus reachable simply at `http://you-domain-name.com` (or http://localhost if running in production locally). The API is publicly accessible via `http://localhost/api`.

### Notes About Docker

#### Detaching

It's nice to leave your session attached to keep an eye on errors throughout the development process, but of course you'll want to rebuild and/or detach in some cases:

```bash
$ docker-compose -f docker-compose.prod.yml up --build -d
```

Only start a couple services, you may specify them explicitly:

```bash
$ docker-compose -f docker-compose.prod.yml up api
```

The above command starts the development `api` and its dependency, the `db` service (indicated with the `depends_on` tag in the `docker-compose.yml` file. Similarly, one can also just build specific images and start containers based on them. The following command behaves just like the previous one, except that it rebuilds the images first.

```bash
$ docker-compose -f docker-compose.prod.yml up --build api
```

If development on only one of the services has occurred, say the front-end f the application, simply rebuild and redeploy that service. There's no need to stop everything; Docker Compose handles everything:

```bash
$ docker-compose -f docker-compose.prod.yml up --build -d frontend
```

Becuase the pipeline container keep track of the database, running docker-compose with the `-v` flag hould be used to help clean up unused volumes on the host machine.

#### Tinkering in a Running Container

To tinker and test various things, one often needs to log into an individual container with `docker exec`. (This was mentioned earlier when describing the installation of new NPM modules.) To, say, run some database queries inside the database container, we can attach to it with the following command.

```bash
docker exec -it ctmd-db bash
```

This will plop you inside the container, and you may proceed normally.

## Tear it Down

If you started without the detach flag, `-d`, you can stop the containers running with `CTRL+C`, and Docker will clean up after itself. If you ran things in detatched mode (_with_ the `-d` flag), then bring everything down with `$ docker-compose down` from withing the project's root directory.

\* Note: the postgres storage (at `/db/pgdata`) is persisted on the host and is created with root privileges. If the `db` image needs to be rebuilt (with a new `.sql` file perhaps), Docker will squawk at you with a permission error. Remove this directory (with `$ sudo rm -r /db/pgdata`). Then the next time it builds, your new `.sql` file will be used repopulate the database with your updated data.

## Deploying Updates

There is no need t tear down the containers if you're building and deploying updates. Simply run the same `up` command,

```bash
$ docker-compose -f docker-compose.prod.yml up --build -d
```

and the running containers will be replaced and immediately available on their respective ports after they start successfully. 

We often need to do a complete redeploy, which involves repopulating the database. This runs into permission errors with the host's previously created data directory. Thus, in this case, delete the `./db/data` directory and run the above command.

## Dependencies

External image on Docker Hub: `zooh/ctmd-pipeline-reload:0.2.16` (used by `./docker-compose.prod.yml`).
The ctmd-pipeline-reload:0.2.16 image is built from https://github.com/RENCI/tic-map-pipeline-script.

## Trouble-shooting
- `docker-compose up ... -V ` returns usage
  + Check that you have the latest version of docker-compose; if you're running with a service account, use `sudo - <unprivileged-user>` to pick up that account's environment instead of your own, potentially custom environment.
  + Make sure the service account has the right path to the correct version of docker-compose. For example, you may need to add ```PATH=/usr/local/bin:$PATH``` to ```/home/<unprivileged-user>/.bashrc```
- `ERROR: Service 'frontend' failed to build: devicemapper: Error running  deviceCreate (CreateSnapDeviceRaw) dm_task_run failed`
Try running with `-V` to remove the volume. Containers run with the same volume, and this error indicates there may be a collision

## References

Links to some tools used in this project are below.

- Docker
  + Docker: https://docs.docker.com
  + Docker Compose: https://docs.docker.com/compose/
  + Docker Multi-Stage Builds https://docs.docker.com/develop/develop-images/multistage-build/
- React
  + React JS: https://reactjs.org/
  + Material UI: https://material-ui.com/
  + Nivo: https://nivo.rocks
- D3: https://d3js.org
- Nodemon: https://nodemon.io
- Express: https://expressjs.com/
- Nginx: https://nginx.org/en/docs/
- HTTP Authentication: https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication
- htpasswd: https://httpd.apache.org/docs/2.4/programs/htpasswd.html

