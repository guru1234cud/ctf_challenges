# Use a lightweight Node runtime
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files first to leverage Docker cache (if you have them)
COPY package*.json ./

# Install dependencies (use `npm ci` if you commit package-lock.json)
RUN npm install --production

# Copy app source
COPY . .

# Ensure the uploads directory exists (app also creates it, but this keeps layers stable)
RUN mkdir -p /usr/src/app/uploads

# Expose app port
EXPOSE 5000

# Start the app; change 'server.js' to the correct entry filename if needed
CMD ["node", "server.js"]
