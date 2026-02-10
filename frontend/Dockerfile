# Build Stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Build Arguments
ARG VITE_ARCHESTRA_URL
ARG VITE_PROMETHEUS_URL
ARG VITE_API_KEY

# Set Environment Variables for Build
ENV VITE_ARCHESTRA_URL=$VITE_ARCHESTRA_URL
ENV VITE_PROMETHEUS_URL=$VITE_PROMETHEUS_URL
ENV VITE_API_KEY=$VITE_API_KEY

RUN npm run build

# Production Stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
