FROM node:alpine AS development

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
COPY next.config.js ./

RUN npm install

COPY src src
COPY public public
COPY auth.ts ./
COPY middleware.ts ./

RUN npm run build

FROM node:alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY next.config.js ./

RUN npm ci --only=production

COPY --from=development /app/.next ./.next
COPY --from=development /app/public ./public

EXPOSE $PORT

CMD ["npm", "start"]