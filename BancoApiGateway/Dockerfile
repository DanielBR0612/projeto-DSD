FROM node:18-alpine AS build
WORKDIR /usr/src/app
# copy everything then build the nested api-gateway app
COPY . /usr/src/app
WORKDIR /usr/src/app/api-gateway
# Use npm install to avoid requiring a package-lock.json in the api-gateway folder
RUN npm install --legacy-peer-deps --silent
# list installed packages for easier debugging in case of failure
RUN ls -la node_modules || true
RUN npm run build

FROM node:18-alpine
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/api-gateway/dist ./dist
COPY --from=build /usr/src/app/api-gateway/proto ./proto
COPY --from=build /usr/src/app/api-gateway/package.json ./package.json
# Use npm install here because `npm ci` requires a package-lock.json to be present.
# Also include --legacy-peer-deps to avoid peer dependency failures in production install.
RUN npm install --omit=dev --silent --legacy-peer-deps
EXPOSE 3000
CMD ["node","dist/main"]
