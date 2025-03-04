
# Troubleshooting Guide

## Common Issues and Solutions

### 1. "Port 5000 is already in use"

**Solution:**
- The application will now automatically try port 3333 if port 5000 is in use
- You can manually specify a port: `PORT=4000 npm run dev`
- If ports are consistently blocked, check for other running services

### 2. "DATABASE_URL must be set"

**Solution:**
- For local development: 
  - Create/update `client/.env` file with your PostgreSQL connection string:
  ```
  DATABASE_URL=postgresql://username:password@hostname:port/database
  ```

- For deployment:
  - Go to the Deployments tab
  - Click on "Secrets"
  - Add a new secret with key `DATABASE_URL` and your connection string as value

### 3. Testing Environment Variables

Run the environment test script:
```
node test-env.js
```

### 4. Database Connection Issues

If your DATABASE_URL is set but you're still having issues:
- Make sure the database exists
- Check network access (IP whitelisting)
- Verify the connection string format is correct
- For Neon databases, make sure to use the pooled connection string

### 5. Deployment Fails Even When All Secrets Are Set

Try these steps:
1. Make sure your port configuration is correct (port 5000 should map to 80)
2. Check the deployment logs for more specific errors
3. Test your application locally before deploying
4. Make sure all required environment variables are set as secrets
