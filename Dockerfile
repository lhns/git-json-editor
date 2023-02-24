FROM node:18

COPY * ./

RUN npm ci

CMD npm run prod
