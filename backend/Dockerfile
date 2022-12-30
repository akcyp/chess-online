FROM sanicframework/sanic:3.8-latest

WORKDIR /sanic

COPY ./backend/requirements.txt requirements.txt
RUN pip install -r requirements.txt

EXPOSE 3000
COPY ./backend .

ENV MODE "PRODUCTION"
ADD ./certificates /certs

CMD ["python", "app.py"]
