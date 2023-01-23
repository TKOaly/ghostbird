FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY index.js .
COPY message.html .
CMD ["node", "index.js"]