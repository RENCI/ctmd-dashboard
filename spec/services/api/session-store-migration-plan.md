# Session Store Migration Plan

## Problem Statement

The API currently uses the default `MemoryStore` for express-session, which is displaying the following warning:

```
Warning: connect.session() MemoryStore is not designed for a production environment,
as it will leak memory, and will not scale past a single process.
```

**Issues with MemoryStore:**
- Memory leaks over time as sessions accumulate
- Does not persist across server restarts (users get logged out)
- Cannot scale horizontally (sessions not shared between replicas)
- Not suitable for Kubernetes deployments with multiple pods

## Current Implementation

**File:** `services/api/app.js` (lines 30-39)

```javascript
app.use(
  session({
    secret: process.env.API_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: 12 * 60 * 60 * 1000,
    },
  })
)
```

**Current Setup:**
- Sessions stored in memory (default behavior)
- 12-hour session expiration
- Single pod deployment (replicas: 1 in `helm-charts/ctmd-dashboard/templates/api.yaml`)
- Redis already deployed in the cluster (`helm-charts/ctmd-dashboard/templates/redis.yaml`)

## Recommended Solution: Redis Session Store

### Why Redis?

1. **Already Deployed** - Redis is already running in your Kubernetes cluster
2. **Production-Ready** - Designed for session storage and caching
3. **Persistent** - Sessions survive server restarts
4. **Scalable** - Supports multiple API replicas sharing sessions
5. **Fast** - In-memory data store with excellent performance
6. **Well-Supported** - `connect-redis` is the official Redis adapter for express-session

### Alternative Options Considered

| Store Type | Pros | Cons | Verdict |
|------------|------|------|---------|
| **PostgreSQL** | Already using Postgres, no new infrastructure | Slower than Redis, more DB load, requires separate session table | ❌ Not recommended |
| **Redis** | Fast, already deployed, purpose-built for sessions | None for this use case | ✅ **Recommended** |
| **Memcached** | Fast, lightweight | Not deployed, no persistence, less featured than Redis | ❌ Not needed |
| **MongoDB** | Flexible, persistent | Not deployed, overkill for sessions | ❌ Not needed |

## Implementation Plan

### Phase 1: Code Changes

#### Step 1: Install Dependencies

Add to `services/api/package.json`:

```json
{
  "dependencies": {
    "connect-redis": "^7.1.0",
    "redis": "^4.6.0"
  }
}
```

**Commands:**
```bash
cd services/api
npm install connect-redis@^7.1.0 redis@^4.6.0
```

#### Step 2: Update `app.js`

Replace the session configuration in `services/api/app.js`:

**Before (lines 30-39):**
```javascript
app.use(
  session({
    secret: process.env.API_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: 12 * 60 * 60 * 1000,
    },
  })
)
```

**After:**
```javascript
const session = require('express-session')
const RedisStore = require('connect-redis').default
const { createClient } = require('redis')

// Redis client configuration
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379,
  },
  // Optional: Add password if Redis is secured
  // password: process.env.REDIS_PASSWORD,
})

redisClient.connect().catch(console.error)

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err)
})

redisClient.on('connect', () => {
  console.log('Connected to Redis for session storage')
})

// Session configuration with Redis store
app.use(
  session({
    store: new RedisStore({
      client: redisClient,
      prefix: 'ctmd:sess:',  // Namespace for session keys
      ttl: 12 * 60 * 60,      // 12 hours in seconds (matches cookie expiration)
    }),
    secret: process.env.API_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,  // Changed to false for better performance
    cookie: {
      maxAge: 12 * 60 * 60 * 1000,  // 12 hours in milliseconds
      secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
      httpOnly: true,
      sameSite: 'lax',
    },
  })
)
```

**Key Changes:**
- Add Redis client initialization
- Configure RedisStore as session store
- Add error handling and connection logging
- Use `saveUninitialized: false` (recommended for production)
- Add security flags for cookies (`secure`, `httpOnly`, `sameSite`)
- Use `maxAge` instead of `expires` (modern practice)

### Phase 2: Environment Configuration

#### Step 3: Update Helm Chart

Add Redis environment variables to `helm-charts/ctmd-dashboard/templates/api.yaml`:

**Add to `env:` section (after line 55):**
```yaml
            - name: REDIS_HOST
              value: {{ .Values.redis.name | quote }}
            - name: REDIS_PORT
              value: "6379"
```

**Optional - If Redis requires authentication:**
```yaml
            - name: REDIS_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: redis-secret
                  key: password
```

#### Step 4: Update `values.yaml` (if needed)

Verify Redis configuration in `helm-charts/ctmd-dashboard/values.yaml`:

```yaml
redis:
  name: redis
  tag: "7-alpine"  # or latest stable version
  publicRepository: true
```

### Phase 3: Testing

#### Step 5: Local Testing

**Option A: Docker Compose (if available)**
```yaml
services:
  api:
    # ... existing config
    environment:
      REDIS_HOST: redis
      REDIS_PORT: 6379
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

**Option B: Local Redis**
```bash
# Install Redis locally
brew install redis  # macOS
# or
sudo apt-get install redis  # Linux

# Start Redis
redis-server

# Test connection
redis-cli ping  # Should return PONG
```

**Run API locally:**
```bash
export REDIS_HOST=localhost
export REDIS_PORT=6379
export API_SESSION_SECRET=your-secret-here
cd services/api
npm start
```

**Test session persistence:**
1. Login to application
2. Check Redis for session: `redis-cli keys "ctmd:sess:*"`
3. Restart API server
4. Verify you're still logged in (session persisted)

#### Step 6: Kubernetes Testing

**Build and deploy:**
```bash
# Build new API image
docker build -t your-registry/api:new-version ./services/api

# Push to registry
docker push your-registry/api:new-version

# Update Helm values
helm upgrade ctmd-dashboard ./helm-charts/ctmd-dashboard \
  --set api.tag=new-version

# Check logs
kubectl logs -f deployment/api
# Should see: "Connected to Redis for session storage"
```

**Verify Redis connection:**
```bash
# Connect to Redis pod
kubectl exec -it deployment/redis -- redis-cli

# Check for sessions
keys "ctmd:sess:*"

# View session data
get "ctmd:sess:SESSION_ID_HERE"
```

### Phase 4: Validation

#### Step 7: Verify Functionality

**Test checklist:**
- [ ] Users can log in successfully
- [ ] Sessions persist after API pod restart
- [ ] Session expires after 12 hours
- [ ] Multiple API replicas can share sessions
- [ ] No memory warning on API startup
- [ ] Redis connection logs appear

**Load test (optional):**
```bash
# Check memory usage over time
kubectl top pod -l app=api

# Before: Memory should grow continuously
# After: Memory should remain stable
```

### Phase 5: Scaling (Optional)

#### Step 8: Enable Horizontal Scaling

Once Redis sessions are working, you can scale the API:

**Update `helm-charts/ctmd-dashboard/templates/api.yaml`:**
```yaml
spec:
  replicas: 3  # Scale to multiple pods
```

**Test multi-pod session sharing:**
```bash
# Scale up
kubectl scale deployment/api --replicas=3

# Login through one pod
# Verify session works on different pod
kubectl exec -it deployment/api -- curl localhost:3030/auth_status
```

## Rollback Plan

If issues occur during migration:

### Quick Rollback
```bash
# Revert to previous image version
helm upgrade ctmd-dashboard ./helm-charts/ctmd-dashboard \
  --set api.tag=previous-version
```

### Code Rollback

1. Remove Redis dependencies from `package.json`
2. Restore original session configuration in `app.js`
3. Rebuild and redeploy

### Partial Rollback (Keep Redis, Use Memory as Fallback)

```javascript
let store = undefined  // Default to MemoryStore

if (process.env.REDIS_HOST) {
  try {
    const redisClient = createClient({ /* ... */ })
    await redisClient.connect()
    store = new RedisStore({ client: redisClient })
    console.log('Using Redis session store')
  } catch (err) {
    console.error('Redis connection failed, falling back to MemoryStore:', err)
  }
}

app.use(session({
  store: store,  // Will use MemoryStore if undefined
  // ... rest of config
}))
```

## Migration Timeline

| Phase | Tasks | Duration | Dependencies |
|-------|-------|----------|--------------|
| **Phase 1** | Code changes, local testing | 2-4 hours | Dev environment |
| **Phase 2** | Helm configuration | 1 hour | Kubernetes access |
| **Phase 3** | Deploy to staging | 1 hour | Staging environment |
| **Phase 4** | Validation & testing | 2-4 hours | QA team |
| **Phase 5** | Production deployment | 1 hour | Approved testing |
| **Phase 6** | Monitoring | Ongoing | Production metrics |

**Total estimated time:** 1-2 days

## Security Considerations

### Current Security
- Sessions stored in memory (cleared on restart)
- Session secret from environment variable
- 12-hour expiration

### Enhanced Security with Redis

1. **Add Redis password authentication:**
```bash
# In Redis deployment
command: ["redis-server", "--requirepass", "$(REDIS_PASSWORD)"]
```

2. **Enable TLS for Redis connection (optional):**
```javascript
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    tls: process.env.NODE_ENV === 'production',
  },
  password: process.env.REDIS_PASSWORD,
})
```

3. **Session key rotation:**
```javascript
cookie: {
  maxAge: 12 * 60 * 60 * 1000,
  secure: true,
  httpOnly: true,
  sameSite: 'strict',  // Stronger CSRF protection
}
```

## Monitoring & Maintenance

### Metrics to Monitor

**Redis:**
- Connection count
- Memory usage
- Keys count (sessions)
- Hit rate

**API:**
- Session creation rate
- Session errors
- Memory usage (should stabilize)

### Redis Monitoring Commands
```bash
# Monitor Redis
kubectl exec -it deployment/redis -- redis-cli INFO

# Watch memory
kubectl exec -it deployment/redis -- redis-cli INFO memory

# Count sessions
kubectl exec -it deployment/redis -- redis-cli DBSIZE
```

### Cleanup Old Sessions

Redis will automatically expire sessions based on TTL, but you can manually clear if needed:

```bash
# Clear all sessions (emergency only)
kubectl exec -it deployment/redis -- redis-cli FLUSHDB

# Clear sessions by pattern
kubectl exec -it deployment/redis -- redis-cli --scan --pattern "ctmd:sess:*" | xargs redis-cli DEL
```

## Troubleshooting

### Issue: "Redis connection failed"

**Symptoms:** API logs show Redis connection errors

**Solutions:**
1. Check Redis is running: `kubectl get pods | grep redis`
2. Verify service name: `kubectl get svc redis`
3. Test DNS resolution from API pod:
   ```bash
   kubectl exec -it deployment/api -- nslookup redis
   ```
4. Check Redis logs: `kubectl logs deployment/redis`

### Issue: "Sessions not persisting"

**Symptoms:** Users logged out after page refresh

**Solutions:**
1. Check Redis contains sessions: `redis-cli keys "ctmd:sess:*"`
2. Verify TTL: `redis-cli ttl "ctmd:sess:SESSION_ID"`
3. Check cookie settings (secure flag requires HTTPS)
4. Verify API is connecting to Redis: Check API logs

### Issue: "Memory still growing"

**Symptoms:** API memory usage increases over time

**Solutions:**
1. Verify Redis store is actually being used (check logs)
2. Check for memory leaks elsewhere in application
3. Monitor Redis memory: `redis-cli INFO memory`
4. Review `saveUninitialized` setting (should be `false`)

## Cost & Performance Impact

### Performance
- **Session read/write:** < 1ms overhead with Redis (negligible)
- **Memory savings:** API pod memory usage will be ~30-50% lower
- **Throughput:** No impact, Redis can handle 100k+ ops/sec

### Cost
- **Redis resource usage:** ~50-100MB RAM for typical load
- **Existing deployment:** Redis already running, no additional cost
- **Scaling potential:** Can now safely scale API pods

## Post-Migration Validation

### Week 1: Monitor Closely
- [ ] Check API logs daily for Redis errors
- [ ] Monitor Redis memory usage
- [ ] Verify session expiration working correctly
- [ ] Confirm no user login issues reported

### Week 2-4: Stability Check
- [ ] Review error rates
- [ ] Check memory trends
- [ ] Validate session persistence across restarts
- [ ] Consider enabling auto-scaling

### Success Criteria
- ✅ No MemoryStore warning in logs
- ✅ Sessions persist across API restarts
- ✅ API memory usage stable over time
- ✅ No increase in login errors
- ✅ Can scale API to multiple replicas

## References

- [connect-redis documentation](https://github.com/tj/connect-redis)
- [express-session documentation](https://github.com/expressjs/session)
- [Redis Node.js client](https://github.com/redis/node-redis)
- [Express session best practices](https://expressjs.com/en/advanced/best-practice-security.html)

## Questions & Answers

**Q: Will existing users be logged out during migration?**
A: Yes, during the deployment. Sessions in memory will be lost, but new sessions will persist.

**Q: Can we do a zero-downtime migration?**
A: Yes, by using a blue-green deployment or canary release strategy. Not covered in this basic plan.

**Q: What if Redis goes down?**
A: API will fail to start or handle sessions. Implement health checks and Redis HA for production.

**Q: Should we enable Redis persistence?**
A: Optional. For sessions, in-memory is usually sufficient. Add RDB or AOF if you want sessions to survive Redis restarts.

**Q: How do we backup sessions?**
A: Generally not needed for sessions. If required, use Redis RDB snapshots.

## Appendix: Complete Code Changes

### services/api/app.js

```javascript
const express = require('express')
const https = require('https')
const app = express()
const cors = require('cors')
const db = require('./config/database')
var multer = require('multer')
const session = require('express-session')
const RedisStore = require('connect-redis').default
const { createClient } = require('redis')
const axios = require('axios')
const { getHealUsers, checkIfIsHealUser } = require('./utils/helpers')

// Config
const AGENT = new https.Agent({
  rejectUnauthorized: false,
})
const NON_PROTECTED_ROUTES = ['/auth_status', '/auth', '/logout']
const PORT = process.env.API_PORT || 3030
const isHealServer = process.env.IS_HEAL_SERVER === 'true' || false
const HEALUsersFilePath = process.env.HEAL_USERS_FILE_PATH || './heal-users.txt'
const HEAL_USERS = isHealServer ? getHealUsers(HEALUsersFilePath) : []
const AUTH_URL = process.env.AUTH_URL
const AUTH_API_KEY = process.env.FUSE_AUTH_API_KEY
const REACT_APP_API_ROOT = process.env.REACT_APP_API_ROOT

// CORS
app.use(cors({ origin: '*', credentials: true }))

// Redis client configuration
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379,
  },
})

redisClient.connect().catch(console.error)

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err)
})

redisClient.on('connect', () => {
  console.log('Connected to Redis for session storage')
})

// Session configuration with Redis store
app.use(
  session({
    store: new RedisStore({
      client: redisClient,
      prefix: 'ctmd:sess:',
      ttl: 12 * 60 * 60,
    }),
    secret: process.env.API_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 12 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
    },
  })
)

// ... rest of the file remains the same
```

### services/api/package.json

```json
{
  "name": "api",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "nodemon app"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "axios": "^0.21.1",
    "connect-redis": "^7.1.0",
    "cookie-session": "^1.4.0",
    "cors": "^2.8.5",
    "csv-parser": "^2.3.3",
    "d3": "^5.16.0",
    "d3-node": "^2.2.2",
    "express": "^4.17.1",
    "express-session": "^1.17.1",
    "multer": "^1.4.2",
    "pg-promise": "^10.15.4",
    "redis": "^4.6.0",
    "ssl-root-cas": "^1.3.1"
  },
  "devDependencies": {
    "nodemon": "^2.0.4"
  }
}
```
