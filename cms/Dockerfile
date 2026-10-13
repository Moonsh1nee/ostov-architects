FROM node:22-alpine

# sharp (used by Strapi's upload plugin) ships musl prebuilds; this covers its glibc shims.
RUN apk add --no-cache libc6-compat

WORKDIR /opt/app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# Develop mode keeps the Content-Type Builder available: this CMS is for editing the demo's model too.
ENV NODE_ENV=development
EXPOSE 1337
CMD ["npm", "run", "develop"]
