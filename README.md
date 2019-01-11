# TIC

## Prep

### Clone

Fork or clone this repo.

```bash
$ git clone https://github.com/renciweb/tic.git
```

### Set up environment variables file

Make an environment variables file named `.env`. There's a sample one in the repo that will work for development out of the box, so just rename that.

```bash
$ mv .env.sample .env
```

### Copy the existing database

On the PMD VM, dump a snapshot of the database.

```bash
$ pg_dump duketic > duketic.sql
```

That command will put the dumped data into the `/var/lib/pgdata` directory. Copy that file into this project's `db/` directory.

```bash
/cloned/repo/db/ $ scp username@pmd-host:/path/to/duketic.sql .
```

The `db` container looks for that file to populate a copy of the database.

Note: In production, we'll communicate with the real database on the server, but using a working copy for now ensures we avoid conflicts while the schema converges to its final version.

## Start 

There are three containers that we need to run--they are named `frontend`, `api`, and `db`.

### Development

Start all three services:

```bash
$ docker-compose up
```

The development `frontend` and `api` containers start with React's development server and nodemon, respectively, allowing hot reloading, so there's really little need to ever rebuild during development.

It's nice to leave your session attached to keep an eye on errors, but of course you want to rebuild and/or detach at times:

```bash
$ docker-compose up --build -d
```

Or only start a couple services, specify them explicitly:

```bash
$ docker-compose up --build api db
```

Point your browser to `http://localhost:3000` to see the dashboard.
To mess with the API directly (in the browser or Postman, say), that is served to `http://localhost:3030`.

### Production

Start all three services using the production Docker Compose file, `docker-compose.prod.yml`:

```bash
$ docker-compose -f docker-compose.prod.yml up --build -d
```

This serves the frontend to port `80` on the host, and is thus reachable simply at `http://localhost`. The API is publicly accessible via `http://localhost/api`.

## Tear it Down

```bash
$ docker-compose down
```

\* Note: the postgres storage (at `/db/pgdata`) is made with root privileges. If the db image needs to be rebuilt (with a new `.sql` file perhaps), remove this directory: `$ sudo rm -r /db/pgdata`. Next time it builds, the new `.sql` file will be used to build the database.