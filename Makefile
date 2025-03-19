# ==============================================================================
## Environment File
# You can change the default config with `make cnf="config_special.env" build`
cnf ?= config.env
include $(cnf)

## Environment Variables
API_BASE_IMAGE := ctmd-api
API_VERSION := 2.16.0
API_IMAGE_TAG := $(API_BASE_IMAGE):$(API_VERSION)

UI_BASE_IMAGE := ctmd-frontend
UI_VERSION := 2.16.0
UI_IMAGE_TAG := $(UI_BASE_IMAGE):$(UI_VERSION)

BUILD_DATE ?= $(shell date +'%Y-%m-%dT%H:%M:%S')
# BUILD_DATE := `date -u +"%Y-%m-%dT%H:%M:%SZ"`
## Kind Env
KIND_CLUSTER := ctmd-dashboard
# ==============================================================================
## Computer Setup
setup.mac:
	brew update
	brew list kubectl || brew install kubectl
	brew list kustomize || brew install kustomize
	brew list kind || brew install kind

# For Windows users with Choclatey Package Manager
# https://community.chocolatey.org/
# Must 'choco install make' in order to run the code.
# Choclatey commands will likely need to be run from an Administrative Console.
setup.windows:
	choco upgrade chocolatey
	choco install kind
	choco install kustomize
	choco install kubernetes-cli
# ==============================================================================
## KiND Kubernetes 
# Create a new kind cluster
# the k8s/kind/kind-config.yml file specifies
# host to container port mappings for easy ingress/egress
# of user and application data. 
# Similar to docker host:container port mappings with --expose or -p flags.
kind-up:
	kind create cluster \
		--name $(KIND_CLUSTER) \
		--config k8s/kind/kind-config.yml
	kubectl create ns ctmd
	kubectl config set-context --current --namespace=ctmd

# Delete the kind cluster
kind-down:
	kind delete cluster --name $(KIND_CLUSTER)

kind-load-api:

kind-load-frontend:

kind-load:
# ==============================================================================
### Docker 
#
build-api:
	docker buildx build \
	--platform=linux/amd64 \
	--build-arg=BUILD_DATE=$(BUILD_DATE) \
	--file ./services/api/api.Dockerfile \
	./services/api

build-ui:
	docker buildx build \
	--platform=linux/amd64 \
	--build-arg=BUILD_DATE=$(BUILD_DATE) \
	--file ./services/frontend/ui.Dockerfile \
	./services/frontend/

build-all: build-api build-ui

# For local development we deploy directly from the chart. 
# To pass in a different values file set FILE=(/your/values.yaml)
FILE := ./helm-charts/ctmd-dashboard/values.yaml
# helm-up:
#   @echo "Processing file: $(FILE)"
#   @if [ -f $(FILE) ]; then echo "File exists. Processing ..."; \
#   	helm install ctmd-dashboard ./helm-charts/ctmd-dashboard -f $(FILE); \
# 	fi
# ========================== Helm =============================
# Helm dev up - this ensures pvcs are removed when uninstalled
helm-up:
	@echo "Processing file: $(FILE)"
	@if [ -f $(FILE) ]; then \
		echo "File exists. Processing..."; \
		helm install ctmd-dashboard ./helm-charts/ctmd-dashboard -f $(FILE); \
	else \
		echo "Error: File does not exist."; \
		exit 1; \
	fi

# Will ensure pvc's are deleted when uninstalled.
helm-dev-down:
	helm uninstall ctmd-dashboard
	kubectl delete pvc data-ctmd-db-0

helm-down:
	helm uninstall ctmd-dashboard 

# ==============================================================================
################################ LEGACY ################################
### DOCKER COMPOSE STUFF ###
# This should all still work as expected
compose-up:
	@echo "Starting services with Docker Compose..."
	USER=$(shell id -u):$(shell id -g) 
	@export $(cat $(cnf) | xargs) && docker-compose -f ./compose/docker-compose.yml --env-file $(cnf) up --build -V -d

compose-down:
	@echo "Stopping services with Docker Compose..."
	USER=$(shell id -u):$(shell id -g) 
	@export $(cat $(cnf) | xargs) && docker-compose -f ./compose/docker-compose.yml --env-file $(cnf) down

### ctmd.issues-script
# Update CTMD Issues
CTMD_ISSUES_LINK = https://github.com/RENCI/ctmd/issues/
#
# Use with a file 
# make update-issue-links file=yourfile.txt 
update-issue-links:
	@echo "Updating ctmd# links in the file..."
	@sed -i '' "s/ ctmd#/ $(CTMD_ISSUES_LINK)/g" $(file)