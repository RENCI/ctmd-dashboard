# version 0.2.10
# need to set the following env vars
# REDCAP_APPLICATION_TOKEN
# POSTGRES_USER
# POSTGRES_PASSWORD
# POSTGRES_HOST
# POSTGRES_PORT
# POSTGRES_DATABASE_NAME
# POSTGRES_DUMP_PATH
# REDCAP_URL_BASE default should be set to https://redcap.vanderbilt.edu/api/
# SCHEDULE_RUN_TIME default should be set to 00:00
# need to mount backup dir to POSTGRES_DUMP_PATH
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

FROM ubuntu:20.04

RUN apt-get update && apt-get install -y wget curl

RUN curl -sSL https://get.haskellstack.org/ | sh
COPY ["map-pipeline-schema", "map-pipeline-schema"]
WORKDIR map-pipeline-schema
RUN stack build

WORKDIR /
RUN mkdir data

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y wget gnupg git tzdata

RUN echo "deb http://apt.postgresql.org/pub/repos/apt/ bionic-pgdg main" | tee -a /etc/apt/sources.list.d/pgdg.list

RUN wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y python3-pip wget openjdk-8-jdk postgresql-client-11 libmemcached-dev


RUN apt-get install pkg-config libicu-dev -y
RUN pip3 install --no-binary=:pyicu: pyicu
RUN pip3 install csvkit

RUN pip3 install  schedule pandas psycopg2-binary  requests flask flask-cors redis rq oslash==0.5.1 tx-functional
RUN pip3 install git+https://github.com/vaidik/sherlock.git@77742ba91a24f75ee62e1895809901bde018654f

RUN wget https://archive.apache.org/dist/spark/spark-2.4.8/spark-2.4.8-bin-hadoop2.7.tgz
# RUN wget https://apache.claz.org/spark/spark-2.4.8/spark-2.4.8-bin-hadoop2.7.tgz
# https://apache.claz.org/spark/spark-2.4.7/spark-2.4.7-bin-hadoop2.7.tgz
#&& echo "0F5455672045F6110B030CE343C049855B7BA86C0ECB5E39A075FF9D093C7F648DA55DED12E72FFE65D84C32DCD5418A6D764F2D6295A3F894A4286CC80EF478  spark-2.4.7-bin-hadoop2.7.tgz" | sha512sum -c -

# RUN wget http://apache.spinellicreations.com/spark/spark-2.4.7/spark-2.4.7-bin-hadoop2.7.tgz && echo "0F5455672045F6110B030CE343C049855B7BA86C0ECB5E39A075FF9D093C7F648DA55DED12E72FFE65D84C32DCD5418A6D764F2D6295A3F894A4286CC80EF478  spark-2.4.7-bin-hadoop2.7.tgz" | sha512sum -c -

RUN tar zxvf spark-2.4.8-bin-hadoop2.7.tgz
ENV PATH="/spark-2.4.8-bin-hadoop2.7/bin:${PATH}"
# set to 1 to reload data from redcap database
ENV RELOAD_DATABASE=1
# set to 1 for one off reload
ENV RELOAD_ONE_OFF=0
# set to 1 to schedule periodic reload
ENV RELOAD_SCHEDULE=1
# set to 1 to create tables
ENV CREATE_TABLES=1
# set to 1 to insert data
ENV INSERT_DATA=0
ENV SERVER=0
# set time zone
ENV TZ=America/New_York

COPY --from=transform ["map-pipeline/target/scala-2.11/TIC preprocessing-assembly-0.2.0.jar", "TIC preprocessing-assembly.jar"]

COPY ["reload.py", "reload.py"]
COPY ["server.py", "server.py"]
COPY ["application.py", "application.py"]
COPY ["utils.py", "utils.py"]
# COPY ["test_data.json", "test_data.json"]

ENTRYPOINT ["python3", "application.py"]

