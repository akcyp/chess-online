FROM sanicframework/sanic:3.8-latest

WORKDIR /sanic

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

EXPOSE 3000
COPY . .

CMD ["python", "server.py"]
