# Trial Innovation Center Dashboard
- [Server Setup](#server-setup)
  + [Install Docker](#install-docker)
  + [Docker Post-Installation Steps](#docker-post-installation-steps)
  + [Install Docker Compose](#install-docker-compose)
- [Application Setup](#application-setup)
  + [Clone](#clone)
  + [Set up environment variables file](#set-up-environment-variables-file)
  + [Copy the existing database](#copy-the-existing-database)
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

## Application Setup

### Clone

Fork or clone this repo.

```bash
$ git clone https://github.com/renci/dashboard.git
```

### Set up environment variables file

There are two places we specify environemt-specific variables `./.env` and `./frontend/.env`. The former will contain database credentials necessary for building the Docker images. The latter indicates the URL at which the frontend can access the API. It is necessary that the names of variables used in the React frontend begin with `REACT_APP_`. The variable is referenced in the `ApiContext`, which resides at `'./frontend/src/contexts/ApiContext.js`, providing access to the API's endpoints across the frontend application.

There is a `.env.sample` file in each location that can be copied to get things working out of the box. Changes must be made to the `REACT_APP_API_ROOT` variable for various environments throughout the development workflow, so be sure make changes to that file accordingly--`http://localhost/api/` will work for testing development locally.

### Copy the existing database

On the PMD VM, dump a snapshot of the database. In the example here, we're `pg_dump`ing the database called `duketicheal`.

```bash
$ pg_dump duketicheal > duketic.sql
```

The dumped file needs to live in this project's `db` directory.
Running the above `pg_dump` command after switching to the `postgres` user with no directory-changing puts the dumped data into the `/var/lib/pgsql` directory. 
Copy that dumped data to the `db` directory.

```bash
/cloned/repo/db/ $ scp username@pmd-host:/path/to/duketic.sql .
```

The `postgres` container looks for that file--`./db/duketic.sql`--to populate a copy of the database.

### Start 

There are three services that we need to run--they are named `frontend`, `api`, and `db`, and the assodicated containers are prepended with `pmd-`. the development containers are named similarly, but appended with `-dev`.

#### Development

Start all three services:

```bash
$ docker-compose up
```

The above command starts and attaches to the three containers and results in output like the following.

```bash
Starting pmd-db-dev ... 
Starting pmd-db-dev ... done
Starting pmd-api-dev ... 
Starting pmd-api-dev ... done
Starting pmd-frontend-dev ... 
Starting pmd-frontend-dev ... done
Attaching to pmd-db-dev, pmd-api-dev, pmd-frontend-dev
pmd-db-dev        | 2019-01-14 15:31:03.025 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
pmd-db-dev        | 2019-01-14 15:31:03.025 UTC [1] LOG:  listening on IPv6 address "::", port 5432
pmd-db-dev        | 2019-01-14 15:31:03.033 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
pmd-db-dev        | 2019-01-14 15:31:03.066 UTC [24] LOG:  database system was shut down at 2019-01-14 14:51:46 UTC
pmd-api-dev       | 
pmd-db-dev        | 2019-01-14 15:31:03.077 UTC [1] LOG:  database system is ready to accept connections
pmd-api-dev       | > api@1.0.0 start /usr/src/app
pmd-api-dev       | > nodemon app
pmd-api-dev       | 
pmd-api-dev       | [nodemon] 1.18.9
pmd-api-dev       | [nodemon] to restart at any time, enter `rs`
pmd-api-dev       | [nodemon] watching: *.*
pmd-api-dev       | [nodemon] starting `node app.js`
pmd-api-dev       | 
pmd-api-dev       | Shhh... I'm listening on port 3030.
pmd-api-dev       | 
pmd-frontend-dev  | 
pmd-frontend-dev  | > duke-tic@0.1.0 start /usr/src/app
pmd-frontend-dev  | > react-scripts start
pmd-frontend-dev  | 
pmd-frontend-dev  | Starting the development server...
pmd-frontend-dev  | 
  .
  .
  .
```

Once everything is started up, point your browser to `http://localhost:3000` to access the dashboard. The API is served to `http://localhost:3030` in case you need to play with it directly the browser or in Postman, say.

##### Hot Reloading

Note that the development `frontend` and `api` services start with React's development server and nodemon, respectively, allowing hot reloading.

##### Installing New Modules

If a new npm module is installed, for example, someone on the project executes `npm install some-tool` to install, the next time `docker-compose up` is run, you will need to supply the `--build` flag so that `some-tool` is installed on the image before the container spins up.

Alternatively, you may find that this needs to be done retrospectively, after a container is already running. Perhaps you've received an error in the browser such as `Module not found: Can't resolve '@name-space/module' in '/usr/src/app/src/components/someComponent'`, in which case you can log into the running `pmd-frontend-dev` container and `npm install` it there in (the default location) `/usr/src/app`. Simply executing `docker exec -it pmd-frontend-dev npm install` is a quick, easy way to handle this.

#### Production

Running this in production is quite similar to the development environment, but a few details need to be provided in order first.

##### Environment variables

`REDCAP_APPLICATION_TOKEN` pulling data from redcap data source

`POSTGRES_DUMP_PATH` backing up postgres database

##### Prerequisites

###### HTTP Authentication

The production server will employ basic http authentication. For this, we'll need a password file, and Docker will look for the file `frontend/.htpasswd`. It holds usernames and hashed passwords, as the sample file--`./frontend/.htpasswd.sample` illustrates. To generate the hashed password, use a tool like `htpasswd` from `apache2-utils` or `httpd-tools`. To use `htpasswd`, you can execute `htpasswd -c ./frontend/.htpasswd [username]`, where you replace `[username]` with the desired username. Then you'll be prompted to enter a password twice.

The entire interaction shows output like the following.

```bash
$ sudo htpasswd -c ./frontend/.htpasswd myusername
New password: 
Re-type new password: 
Adding password for user myusername
```

If this is not done, Nginx will throw a `500 Internal Server Error` at your browser whne you try to access the site.

###### API URL
<<<<<<< HEAD

The second thing that you'll need to specify is the URL at which the frontend can access the container running the API. This is accomplished by specifying `REACT_APP_API_ROOT` in the environment variables file, `.env`. For example the corresponding line in the staging server for this application might look like `REACT_APP_API_ROOT=http://localhost/api/`.

=======

The second thing that you'll need to specify is the URL at which the frontend can access the container running the API. This is accomplished by specifying `REACT_APP_API_ROOT` in the environment variables file, `.env`. For example the corresponding line in the staging server for this application might look like `REACT_APP_API_ROOT=http://localhost/api/`.

>>>>>>> bfe2b406085456736278f72b7e0bf3de413e4274
If this is not done, you will see progress/loading spinners in the browser. This is because the frontend will be reaching out for data from the wrong location and never receive it.

##### OK, Let's Go

Start all three services using the production Docker Compose file, `docker-compose.prod.yml`:

```bash
$ docker-compose -f docker-compose.prod.yml up --build -d
```

This serves the frontend to port `80` on the host, and is thus reachable simply at `http://localhost` (or your domain name). The API is publicly accessible via `http://localhost/api`.
<<<<<<< HEAD

### Notes About Docker

#### Detaching

It's nice to leave your session attached to keep an eye on errors throughout the development process, but of course you want to rebuild and/or detach in some cases:

```bash
$ docker-compose up --build -d
```

Only start a couple services, you may specify them explicitly:

```bash
$ docker-compose up api
```

The above command starts the development `api` and its dependency, the `db` service (indicated with the `depends_on` tag in the `docker-compose.yml` file. Similarly, one can also just build specific images and start containers based on them. The following command behaves just like the previous one, except that it rebuilds the images first.

```bash
$ docker-compose up --build api
```

#### Tinkering in a Running Container

To tinker and test various things, one often needs to log into an individual container with `docker exec`. (This was mentioned earlier when describing the installation of new npm modules.) To, say, run some database queries inside the database container, we can attach to it with the following command.

```bash
docker exec -it pmd-db bash
```

=======

### Notes About Docker

#### Detaching

It's nice to leave your session attached to keep an eye on errors throughout the development process, but of course you want to rebuild and/or detach in some cases:

```bash
$ docker-compose up --build -d
```

Only start a couple services, you may specify them explicitly:

```bash
$ docker-compose up api
```

The above command starts the development `api` and its dependency, the `db` service (indicated with the `depends_on` tag in the `docker-compose.yml` file. Similarly, one can also just build specific images and start containers based on them. The following command behaves just like the previous one, except that it rebuilds the images first.

```bash
$ docker-compose up --build api
```

#### Tinkering in a Running Container

To tinker and test various things, one often needs to log into an individual container with `docker exec`. (This was mentioned earlier when describing the installation of new npm modules.) To, say, run some database queries inside the database container, we can attach to it with the following command.

```bash
docker exec -it pmd-db bash
```

>>>>>>> bfe2b406085456736278f72b7e0bf3de413e4274
Now you're inside the container and can proceed normally -- switch to the `postgres` user with something like `sudo -u postgres -i`, access the database `psql duketic`, and execute queries to your heart's content, `select * from proposal where false;` is a fun one.

## Tear it Down

If you started without the detach flag, `-d`, you can stop the containers running with `CTRL+C`, and Docker will clean up after itself. If you ran things in detched mode (_with_ the `-d` flag), then bring everything down with `$ docker-compose down`

\* Note: the postgres storage (at `/db/pgdata`) is persisted on the host and is created with root privileges. If the `db` image needs to be rebuilt (with a new `.sql` file perhaps), docker qill squawk at you with a permission error. Remove this directory with `$ sudo rm -r /db/pgdata`. Then the next time it builds, the new `.sql` file will be used to populate the database.

## References

Links to some tools used in this project are below.

- Docker
  + Docker: [https://docs.docker.com](https://docs.docker.com)
  + Docker Compose: [https://docs.docker.com/compose/](https://docs.docker.com/compose/)
  + Docker Multi-Stage Builds [https://docs.docker.com/develop/develop-images/multistage-build/](https://docs.docker.com/develop/develop-images/multistage-build/)
- React
  + React JS: [https://reactjs.org/](https://reactjs.org/)
  + Material UI: [https://material-ui.com/](https://material-ui.com/)
  + Nivo: [https://nivo.rocks/](https://nivo.rocks/)
- D3: [https://d3js.org/](https://d3js.org/)
- Nodemon [https://nodemon.io/](https://nodemon.io/)
- Express [https://expressjs.com/](https://expressjs.com/)
- Nginx: [https://nginx.org/en/docs/](https://nginx.org/en/docs/)
- HTTP Authentication [https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)
- htpasswd: [https://httpd.apache.org/docs/2.4/programs/htpasswd.html](https://httpd.apache.org/docs/2.4/programs/htpasswd.html)
