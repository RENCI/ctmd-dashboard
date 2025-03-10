BASE_IMAGE := ctmd-dashboard
IMAGE_TAG := $(BASE_IMAGE):$(VERSION)
KIND_CLUSTER := ctmd-dashboard
KIND_IMAGE := kindest/node:v1.29.0@sha256:eaa1450915475849a73a9227b8f201df25e55e268e5d619312131292e324d570 

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
		--image $(KIND_IMAGE) \
		--name $(KIND_CLUSTER) \
		--config k8s/kind/kind-config.yml
	kubectl create ns ctmd
	kubectl config set-context --current --namespace=ctmd

# Delete the kind cluster
kind-down:
	kind delete cluster --name $(KIND_CLUSTER)
