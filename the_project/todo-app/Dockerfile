FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY index.js .

# Create images directory
RUN mkdir -p /usr/src/app/images

# Expose port
EXPOSE 3000

CMD ["npm", "start"]
