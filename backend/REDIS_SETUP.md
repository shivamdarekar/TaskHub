# Redis Integration Setup Guide

Your friend's Redis structure is **excellent** and perfectly suited for your TaskHub project! ✅

## ✅ What's Been Implemented

1. ✅ **Redis Package Installed** - Official `redis` client v4
2. ✅ **Core Configuration** - Connection management with auto-reconnect
3. ✅ **JWT Session Management** - Token tracking with JTI (JWT ID)
4. ✅ **Token Blacklisting** - Secure logout functionality
5. ✅ **Cache Utilities** - General caching helpers
6. ✅ **Cache Keys** - Consistent key naming system
7. ✅ **Cache Invalidation** - Smart cache clearing strategies
8. ✅ **Auth Integration** - Blacklist check in JWT verification
9. ✅ **Graceful Shutdown** - Clean Redis disconnect on exit

## 📋 Next Steps - Connecting Your Redis Cloud Database

### Step 1: Get Redis Connection Details

1. Go to [Redis Cloud Dashboard](https://app.redislabs.com/)
2. Select your **"taskhub"** database
3. Click on **"Configuration"** tab
4. Copy these details:
   - **Public endpoint** (looks like: `redis-12345.c1.us-east-1-2.ec2.cloud.redislabs.com:12345`)
   - **Default user password**

### Step 2: Update Your `.env` File

Create/update `backend/.env` with your Redis credentials:

```env
# Redis Configuration (From your Redis Cloud Dashboard)
REDIS_HOST="redis-12345.c1.us-east-1-2.ec2.cloud.redislabs.com"
REDIS_PORT="12345"
REDIS_USERNAME="default"
REDIS_PASSWORD="your_password_from_dashboard"
REDIS_USE_TLS="true"
```

**Important Notes:**
- Split the endpoint: `redis-12345...com:12345` → Host + Port
- Username is usually `"default"` for free tier
- Always use `REDIS_USE_TLS="true"` for Redis Cloud
- Keep the password secret!

### Step 3: Test Redis Connection

Start your backend server:

```bash
cd backend
npm run dev
```

You should see these logs:
```
🔄 Redis connecting...
✅ Redis ready
✅ Redis connected successfully
🚀 Server is running on port 5000
```

If you see errors, check:
- ✅ Correct host, port, and password
- ✅ Redis database is active in dashboard
- ✅ `REDIS_USE_TLS="true"` is set

### Step 4: Test Authentication with Redis

Your logout now uses Redis blacklisting! Try:

1. **Login** → Get access token
2. **Make authenticated request** → Should work
3. **Logout** → Token gets blacklisted in Redis
4. **Try same token again** → Should get "Token has been revoked"

## 🎯 Where to Implement Caching Next

Check the [REDIS_IMPLEMENTATION_GUIDE.md](./REDIS_IMPLEMENTATION_GUIDE.md) for detailed examples.

**Priority Areas:**

### High Priority (Implement First)
1. **User Profile** (`fetchCurrentUser`) - Cache user data
2. **Workspace Overview** - Cache workspace stats
3. **Project Overview** - Cache project metrics
4. **Subscription Limits** - Cache plan limits

### Medium Priority
5. **Kanban Board** - Cache task columns
6. **Project Members** - Cache member lists
7. **Task Comments** - Cache comment threads

### Low Priority
8. **Activity Logs** - Cache recent activities
9. **Search Results** - Cache search queries

## 📊 Monitoring Redis

### Check Redis Status
```bash
# In your Redis Cloud Dashboard
- View "Metrics" tab
- Check "Operations/sec"
- Monitor "Memory usage"
- Track "Hit rate"
```

### Redis CLI Commands (Optional)

If you want to inspect Redis data:

```bash
# Install Redis CLI
npm install -g redis-cli

# Connect
redis-cli -h your-redis-host -p your-port -a your-password --tls

# Check keys
KEYS *

# View a session
GET auth:session:some-jti-uuid

# Check blacklist
GET auth:blacklist:some-jti-uuid

# View cache
GET user:user-id-here
```

## 🔧 Configuration Options

### TTL (Time To Live) Values

Located in [backend/src/services/cache.service.ts](backend/src/services/cache.service.ts):

```typescript
export const CacheTTL = {
  SHORT: 60,        // 1 minute - Real-time data
  MEDIUM: 300,      // 5 minutes - Standard cache
  LONG: 1800,       // 30 minutes - Stable data
  VERY_LONG: 3600,  // 1 hour - User profiles
  DAY: 86400,       // 24 hours - Static content
}
```

Adjust these based on your needs.

## 🔐 Security Features

### JWT Token Blacklisting
- ✅ Tokens are blacklisted on logout
- ✅ Blacklist expires with token TTL (no memory waste)
- ✅ Prevents token reuse after logout
- ✅ Works across multiple servers

### Session Tracking
- ✅ Each token has unique JTI (JWT ID)
- ✅ Sessions can be tracked per device
- ✅ Can implement "logout all devices"
- ✅ Can view active sessions

## 🚀 Performance Benefits

1. **Reduced Database Load** - Cache frequently accessed data
2. **Faster Response Times** - Redis is 10-100x faster than DB queries
3. **Better Scalability** - Handle more concurrent users
4. **Rate Limiting** - Prevent API abuse efficiently
5. **Session Management** - Fast token validation

## 📈 Free Tier Limits (Redis Cloud)

Your free tier includes:
- ✅ **30 MB storage**
- ✅ **30 connections**
- ✅ **10K operations/day**

**Tips to stay within limits:**
- Use appropriate TTL values
- Don't cache large objects unnecessarily
- Clean up old cache keys
- Monitor usage in dashboard

## 🛠️ Troubleshooting

### Error: "Connection refused"
- Check if `REDIS_HOST` and `REDIS_PORT` are correct
- Verify database is active in Redis Cloud dashboard

### Error: "Authentication failed"
- Double-check `REDIS_PASSWORD`
- Ensure username is `"default"`

### Error: "TLS connection failed"
- Verify `REDIS_USE_TLS="true"` is set
- Redis Cloud requires TLS

### Cache not working
- Check Redis connection logs
- Verify `await connectRedis()` is called
- Check error logs for cache operations

## 📚 Additional Resources

- [Redis Cloud Documentation](https://docs.redis.com/latest/rc/)
- [Redis Node.js Client Docs](https://github.com/redis/node-redis)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

## 🎉 You're All Set!

Your Redis integration is production-ready! Just add your connection details and start implementing caching in your controllers.

**Questions?** Refer to the [REDIS_IMPLEMENTATION_GUIDE.md](./REDIS_IMPLEMENTATION_GUIDE.md) for code examples.
