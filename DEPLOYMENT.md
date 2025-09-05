# Deployment Guide

This guide covers how to deploy the Politica application to production.

## Environment Variables

### Required Variables

1. **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL
2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Your Supabase anonymous key
3. **GEMINI_API_KEY**: Your Google Gemini API key for AI features
4. **NEXT_PUBLIC_SITE_URL**: Your production domain URL

### Optional Variables

- `GOOGLE_API_KEY`: Additional Google API key (if different from Gemini)
- `DATABASE_URL`: Direct database connection (if not using Supabase)
- `REDIS_URL`: Redis connection for caching
- `SENTRY_DSN`: Error monitoring with Sentry
- `GOOGLE_ANALYTICS_ID`: Google Analytics tracking

## Deployment Platforms

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard:
   - Go to Project Settings > Environment Variables
   - Add all required variables from `.env.production`
3. **Configure build settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
4. **Deploy**: Vercel will automatically deploy on every push to main

### Netlify

1. **Connect your repository** to Netlify
2. **Set environment variables** in Netlify dashboard:
   - Go to Site Settings > Environment Variables
   - Add all required variables
3. **Configure build settings**:
   - Build Command: `npm run build`
   - Publish Directory: `.next`
4. **Deploy**: Netlify will automatically deploy on every push

### Docker

1. **Create a Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

2. **Build and run**:
```bash
docker build -t politica-app .
docker run -p 3000:3000 --env-file .env politica-app
```

### Traditional VPS/Server

1. **Install dependencies**:
```bash
npm install
```

2. **Set environment variables**:
```bash
cp .env.production .env
# Edit .env with your production values
```

3. **Build the application**:
```bash
npm run build
```

4. **Start the application**:
```bash
npm start
```

## Supabase Configuration

### Production Setup

1. **Create a new Supabase project** for production
2. **Configure authentication**:
   - Go to Authentication > Settings
   - Set Site URL to your production domain
   - Add redirect URLs for OAuth
3. **Set up RLS policies** for production
4. **Configure storage** for file uploads
5. **Set up database backups**

### OAuth Configuration

1. **Google OAuth**:
   - Go to Authentication > Providers > Google
   - Enable Google provider
   - Add authorized redirect URIs:
     - `https://your-domain.com/auth/callback`
     - `https://your-supabase-project.supabase.co/auth/v1/callback`

2. **Update redirect URLs** in your Supabase project:
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/**`

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **API Keys**: Use different API keys for development and production
3. **CORS**: Configure CORS settings in Supabase
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **HTTPS**: Always use HTTPS in production
6. **Database**: Use connection pooling and proper indexing

## Performance Optimization

1. **CDN**: Use a CDN for static assets
2. **Caching**: Implement Redis caching for frequently accessed data
3. **Database**: Optimize database queries and add proper indexes
4. **Images**: Use Next.js Image component with optimization
5. **Bundle**: Analyze and optimize bundle size

## Monitoring

1. **Error Tracking**: Set up Sentry for error monitoring
2. **Analytics**: Configure Google Analytics
3. **Uptime**: Use uptime monitoring services
4. **Logs**: Set up proper logging and log aggregation

## Backup Strategy

1. **Database**: Regular automated backups
2. **Files**: Backup uploaded files to cloud storage
3. **Configuration**: Version control all configuration files
4. **Disaster Recovery**: Test restore procedures regularly

## Troubleshooting

### Common Issues

1. **OAuth Errors**: Check redirect URLs and OAuth configuration
2. **Database Connection**: Verify Supabase credentials and network access
3. **Build Errors**: Check Node.js version and dependencies
4. **Environment Variables**: Ensure all required variables are set

### Debug Mode

Enable debug mode by setting:
```bash
DEBUG=*
NODE_ENV=development
```

## Support

For deployment issues:
1. Check the application logs
2. Verify environment variables
3. Test database connectivity
4. Check OAuth configuration
5. Review Supabase project settings
