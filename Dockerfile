FROM node:21

RUN mkdir /project
WORKDIR /project
COPY . .
RUN npm ci

CMD npm run prod -- --host
EXPOSE 4173
