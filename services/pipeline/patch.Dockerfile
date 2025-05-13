FROM ubuntu:20.04 AS transform

RUN apt-get update && apt-get install -y wget openjdk-8-jdk gnupg
RUN apt-get update && apt-get install curl -y

RUN echo "deb https://repo.scala-sbt.org/scalasbt/debian /" | tee -a /etc/apt/sources.list.d/sbt.list
RUN curl -sL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x2EE0EA64E40A89B84B2DF73499E82A75642AC823" | apt-key add
# RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2EE0EA64E40A89B84B2DF73499E82A75642AC823
RUN apt-get update && apt-get install -y sbt
COPY ["map-pipeline", "map-pipeline"]
WORKDIR map-pipeline
RUN sbt assembly


FROM txscience/ctmd-pipeline-reload:v2.11

WORKDIR /

COPY ["reload4j-1.2.26.jar", "/spark-2.4.8-bin-hadoop2.7/jars/log4j-1.2.17.jar"]
COPY --from=transform ["map-pipeline/target/scala-2.11/TIC preprocessing-assembly-0.2.0.jar", "TIC preprocessing-assembly.jar"]


ENTRYPOINT ["python3", "application.py"]

