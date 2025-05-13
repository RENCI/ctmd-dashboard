FROM python:3.7.3-stretch

RUN pip install -U pip
RUN pip install flask pyopenssl

COPY record.json record.json
COPY metadata.json metadata.json
COPY service.py service.py

ENTRYPOINT ["python", "service.py"]