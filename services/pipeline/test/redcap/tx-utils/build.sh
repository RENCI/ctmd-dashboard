#!/bin/bash
if ! [ -z $IMAGE ] && ! [ -z $VERSION ] ; then
    docker build . -t $IMAGE:$VERSION
    if ! [ -z $REPO ] ; then
        docker tag $IMAGE:$VERSION $REPO/$IMAGE:$VERSION
        docker push $REPO/$IMAGE:$VERSION
    fi
fi

if [ -z $COMMIT_MSG ]; then
    COMMIT_MSG=update
fi

git add -u
git commit -m $COMMIT_MSG
for o in $(git remote)
do
    git push $o
done

if ! [ -z $VERSION ] ; then
    TAG=v$VERSION
    git tag $TAG -f
    for o in $(git remote)
    do
	git push $o refs/tags/$TAG -f
    done
fi
