# base node image
FROM node:16-bullseye-slim as base

# Needed for node-gyp (which is needed for LMDB I think?)
RUN apt-get update && apt-get install -y python3 make gcc g++

# Install all node_modules, including dev dependencies
FROM base as deps

RUN mkdir /app
WORKDIR /app

ADD package.json package-lock.json ./
RUN npm install --production=false

# Setup production node_modules
FROM base as production-deps

RUN mkdir /app
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
ADD package.json package-lock.json ./
RUN npm prune --production

# Build the app
FROM base as build

ENV NODE_ENV=production

RUN mkdir /app
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules

ADD . .
RUN npm run build

# Finally, build the production image with minimal footprint
FROM base

ENV NODE_ENV=production

RUN mkdir /app
WORKDIR /app

COPY --from=production-deps /app/node_modules /app/node_modules

COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public
ADD package.json server.ts ./
ADD app ./app
# For some reason, the .node file has to be in the build folder
# Even though we use tsx in production
ADD app/lib/uws/uws_linux_x64_93.node ./build/uws_linux_x64_93.node

# For local testing
# ENV WEBSOCKET_URL = "ws://localhost:9001"
# ENV CURSOR_CHAT_URL = "ws://localhost:9002"
# ENV HOST_URL = "http://localhost:3000"

CMD ["npm", "run", "start"]
