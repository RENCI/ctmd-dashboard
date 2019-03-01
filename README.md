# Trial Innovation Center Dashboard

## Setup

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

## Application Setup

### Clone

Fork or clone this repo.

```bash
$ git clone https://github.com/renci/dashboard.git
```

### Set up environment variables file

Make an environment variables file named `.env`. There's a sample one in the repo that will work for development out of the box, so just copy that.

```bash
$ cp .env.sample .env
```

### Copy the existing database

On the PMD VM, dump a snapshot of the database.

```bash
$ pg_dump duketic > duketic.sql
```

That command will put the dumped data into the `/var/lib/pgsql` directory. Copy that file into this project's `db` directory.

```bash
/cloned/repo/db/ $ scp username@pmd-host:/path/to/duketic.sql .
```

The `postgres` container looks for that file to populate a copy of the database.

Note: In production, we'll communicate with the real database on the server, but using a working copy for now ensures we avoid conflicts while the schema converges to its final version. Moreover, it's a large file with potentially sensitive information.

### Start 

There are three services that we need to run--they are named `frontend`, `api`, and `db`.

#### Development

Start all three services:

```bash
$ docker-compose up
```

The above command starts and attaches to the three containers and results in output like the following.

```bash
Starting postgres ... 
Starting postgres ... done
Starting node ... 
Starting node ... done
Starting react ... 
Starting react ... done
Attaching to postgres, node, react
postgres    | 2019-01-14 15:31:03.025 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
postgres    | 2019-01-14 15:31:03.025 UTC [1] LOG:  listening on IPv6 address "::", port 5432
postgres    | 2019-01-14 15:31:03.033 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
postgres    | 2019-01-14 15:31:03.066 UTC [24] LOG:  database system was shut down at 2019-01-14 14:51:46 UTC
node        | 
postgres    | 2019-01-14 15:31:03.077 UTC [1] LOG:  database system is ready to accept connections
node        | > api@1.0.0 start /usr/src/app
node        | > nodemon app
node        | 
node        | [nodemon] 1.18.9
node        | [nodemon] to restart at any time, enter `rs`
node        | [nodemon] watching: *.*
node        | [nodemon] starting `node app.js`
node        | 
node        | Shhh... I'm listening on port 3030.
node        | 
react       | 
react       | > duke-tic@0.1.0 start /usr/src/app
react       | > react-scripts start
react       | 
react       | Starting the development server...
react       | 
  .
  .
  .

```

##### Possibly Useful Notes

It's nice to leave your session attached to keep an eye on errors, but of course you want to rebuild and/or detach at times:

```bash
$ docker-compose up --build -d
```

Or only start a couple services, specify them explicitly:

```bash
$ docker-compose up api
```

The above command starts the `api` and its dependency, the `db`. You can also just build specific images.

```bash
$ docker-compose up --build api db
```

Point your browser to `http://localhost:3000` to see the dashboard.
To mess with the API directly (in the browser or Postman, say), that is served to `http://localhost:3030`.

##### Hot Reloading

Note the development `frontend` and `api` services start with React's development server and nodemon, respectively, allowing hot reloading, so it's only necessary to rebuild during development if new packages are installed.

##### Installing New Modules

If, for example, you execute `npm install some-tool` to install a module (which would of course be done from within the `frontend/` directory), the next time `docker-compose up` is run, the `--build` flag will need to be used so that `some-tool` is installed on the image before the container spins up.

Alternatively, you could circumvent this by logging into the running `react` container and `npm install` it there in (the default location) `/usr/src/app`.

#### Production

The production environment looks for a database on the host machine, so ensure that is configured and running first. Then supply the necessary credentials to the environment variables file, `.env.`.

##### Prerequisites

The production server will employ basic http authentication. For this, we'll need a password file, and Docker will look for the file `frontend/.htpasswd`. You can copy the sampel password file `frontend/.htpasswd.sample` to that location. Its contains usernames and hashed passwords, as the sample file illustrates. To generate the hashed password, use a tool like `htpasswd` from `apache2-utils` or `httpd-tools`. To use `htpasswd`, navigate into `frontend/` and execute `htpasswd -c ./.htpasswd [username]`. Then you'll be prompted to enter a password twice.

The entire interaction shows output like the following.

```bash
$ sudo htpasswd -c ./.htpasswd myusername
New password: 
Re-type new password: 
Adding password for user myusername
```

Do all that before spinning up the containers.

\* Note: this is only required for production.

##### OK, Let's Go

Start all three services using the production Docker Compose file, `docker-compose.prod.yml`:

```bash
$ docker-compose -f docker-compose.prod.yml up --build -d
```

This serves the frontend to port `80` on the host, and is thus reachable simply at `http://localhost`. The API is publicly accessible via `http://localhost/api`.


#### Tinkering within a Running Container

To tinker and test various things, one often needs to log into an individual container with `docker exec`. This was mentioned earlier when describing the installation of new frontend modules. To do so, we can attach to the `postgres` container with the following command. Another reason to do this is to test and polish database queries, which could be accomplished by getting into the `postgres` container with the following command.

```bash
docker exec -it postgres bash
```

Then proceed normally, executing something like `psql duketic` to select the desired database---`duketic` in this case. Then execute queries to your heart's content, `select * from proposal where false;` is a fun one.

#### Tear it Down

If you started without the detach flag, `-d`, you can stop the containers running with `CTRL+C`, and Docker will clean up after itself. If you ran things in detched mode (_with_ the `-d` flag), then bring everything down with the following command. 

```bash
$ docker-compose down
```

\* Note: the postgres storage (at `/db/pgdata`) is persisted on the host and is created with root privileges. If the `db` image needs to be rebuilt (with a new `.sql` file perhaps), remove this directory on your host machine `$ sudo rm -r /db/pgdata`. Next time it builds, the new `.sql` file will be used to build the database.

## References

Links to some tools used in this project are below.

- Docker
  + Docker: [https://docs.docker.com](https://docs.docker.com)
  + Docker Compose: [https://docs.docker.com/compose/](https://docs.docker.com/compose/)
  + Docker Multi-Stage Builds [https://docs.docker.com/develop/develop-images/multistage-build/](https://docs.docker.com/develop/develop-images/multistage-build/)
- React
  + React JS: [https://reactjs.org/](https://reactjs.org/)
  + Material UI: [https://material-ui.com/](https://material-ui.com/)
- Nodemon [https://nodemon.io/](https://nodemon.io/)
- Express [https://expressjs.com/](https://expressjs.com/)
- Nginx: [https://nginx.org/en/docs/](https://nginx.org/en/docs/)
- HTTP Authentication [https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)
- htpasswd: [https://httpd.apache.org/docs/2.4/programs/htpasswd.html](https://httpd.apache.org/docs/2.4/programs/htpasswd.html)
- D3: [https://d3js.org/](https://d3js.org/)
