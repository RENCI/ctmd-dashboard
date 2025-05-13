FROM ctmd-pipeline-reload:v2.5

RUN mkdir backup
RUN pip3 install pytest hypothesis pyyaml pytest-timeout tx-functional DeepDiff
RUN mkdir test
RUN mv reload.py server.py utils.py test

COPY test_utils.py test/test_utils.py
COPY test_reload.py test/test_reload.py
COPY test_table.py test/test_table.py
COPY conftest.py test/conftest.py
COPY redcap/record.json redcap/record.json
COPY redcap/record2.json redcap/record2.json
COPY redcap/metadata.json redcap/metadata.json
COPY tables etlout
RUN mkdir auxiliary
RUN mkdir filter
RUN mkdir block
COPY auxiliary1 auxiliary1
COPY auxiliary2 auxiliary2
COPY auxiliary3 auxiliary3
COPY filter1 filter1
COPY filter2 filter2
COPY filter3 filter3
COPY block1 block1
COPY block2 block2
COPY block3 block3
COPY add add

WORKDIR test

ENTRYPOINT ["pytest"]

CMD ["--timeout", "600"]
