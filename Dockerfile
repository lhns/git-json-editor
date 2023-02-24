FROM node:19

COPY * ./

RUN npm ci

CMD npm run prod
