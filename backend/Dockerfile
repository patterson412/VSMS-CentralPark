FROM node:alpine AS development

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

RUN npm install

COPY src src
COPY test test

RUN npm run build

FROM node:alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci --only=production

COPY --from=development /app/dist ./dist

CMD ["node", "dist/main"]