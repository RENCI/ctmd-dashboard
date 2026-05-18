# Clinical Trial Management Dashboard
This application is a component of the [Trial Innovation Network](https://trialinnovationnetwork.org/) which uses TIN Redcap trial data to further the TIN mission "addressing critical roadblocks in clinical research and accelerate the translation of novel interventions into life-saving therapies."

The Clinical Trial Management Dashboard allows participants to upload and customize additional data atop Redcap data, view graphs, create reports and draw critical insight into areas that can be improved across various research processes and ongoing trials.

## Project Structure
![alt text](https://github.com/RENCI/ctmd-dashboard/blob/adding-pipeline/data/diagram/ctmd-dash-outline.png)

At a high level, the project is structured around 3 core microservices found in the [services](https://github.com/RENCI/ctmd-dashboard/tree/main/services) directory. 
- [api](https://github.com/RENCI/ctmd-dashboard/tree/main/services/api)
- [frontend](https://github.com/RENCI/ctmd-dashboard/tree/main/services/frontend)
- [pipeline](https://github.com/RENCI/ctmd-dashboard/tree/main/services/pipeline)

These services are supported by a relational database (postgres) and job caching service (redis).

## Development
For local development, the [Makefile](https://github.com/RENCI/ctmd-dashboard/blob/main/Makefile) should be the driver for all local infrastructure setup, container builds, and deployments into the local [KiND](https://kind.sigs.k8s.io/) cluster.

#### Environment Assumptions
We assume you already have docker installed 🐳.

#### Initial Setup
Follow the `setup.mac`, `setup.windows`, `setup.linux` targets to install the basic software needed.  

#### Kubernetes in Docker ☸️
`make kind-up` will start a local Kubernetes service in Docker called KiND. ⭐️ You must have the docker service running for this to work.

`make kind-down` will delete the kubernetes service.

#### Using Docker 
If working on a service, for example the api - you can build the image locally using `make build-api`. We have provided similarly named docker make targets `build-[ui || pipeline]` for building the other services. 

#### Loading the image
When deploying the applications into local KiND cluster `make kind-load-api` or similar `kind-load-[ui || pipeline]` will load the image directly into the cluster - without needing to push an external container registry (though this can also be done). 

#### Deploying with helm
`make helm-up` will deploy the full ctmd-dashboard into the KiND cluster. 

`make helm-dev-down` will delete the ctmd-dashboard helm deployment and pvcs (database data), leaving only the KiND cluster up (for redeploying with changes). 

`make helm-down` will uninstall the ctmd-dashboard deployment without removing the pvc (database data).

#### Expose the Frontend Service (Kubernetes pod)
`make port-forward-ui` will expose the frontend pod to your local environment on port 3000.

#### Frontend Hot-Reload Development (recommended for UI changes)

Instead of rebuilding the image on every change, run the CRA dev server locally. Changes are visible in the browser in **under a second** via hot module replacement.

**Terminal 1** — port-forward the backend services from your cluster:
```bash
make dev-services
# forwards ctmd-api → localhost:3030 and ctmd-pipeline2 → localhost:5000
```

**Terminal 2** — start the dev server:
```bash
make dev-ui
# CRA dev server at http://localhost:3000 with HMR + proxy
```

The dev server (`src/setupProxy.js`) mirrors the nginx proxy rules from the helm chart:
- `/api/*` → `http://localhost:3030` (ctmd-api)
- `/data/*` → `http://localhost:5000` (ctmd-pipeline2)

No image rebuild, no pod restart, no port-forwarding the UI — just edit and save.

### CI/CD
⚠️ Still actively being built ⚠️

Automatic container builds occur when pushing to github through github actions. If updates are done to a specific service, only that service container will be built (this saves running costs in Github Actions). 

For example if only the `services/api` code was updated, only that image will be built. The tag will be the branch name, prepended with `test_`. So if your branch name is `adding_pipeline` the resultant build will be tagged with `test_adding-pipeline`.

#### Redundancy of Built Images
Every build and tag is sent to Renci's container registry and Dockerhub's `rencibuild/` namespace.This ensures disaster recovery for images if mistakenly deleted.