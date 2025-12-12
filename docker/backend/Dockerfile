# Use the official Node.js image as the base image
FROM node:20-slim

# Set the working directory inside the container
WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install --include=dev

# Copy Prisma schema
COPY prisma ./prisma

# Run prisma generate BEFORE copying the full source
RUN npx prisma generate

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the application port
EXPOSE 5000

# Command to run the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]