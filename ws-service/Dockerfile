FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# install all deps (including dev deps because the project uses tsx to run TypeScript)
RUN npm ci --silent
COPY . .
# if there's a build step, run it; if not, this will harmlessly fail
RUN npm run build || true
EXPOSE 3000
CMD ["npm","run","start"]
