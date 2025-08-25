# 🚀 Railway Deployment Guide

Complete guide to deploy your WhatsApp Message Tracker to Railway for free!

## 📋 Prerequisites

- GitHub account
- Railway account (free)
- WhatsApp account
- Your WhatsApp group ID

## 🎯 Step-by-Step Deployment

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Sign up with GitHub (recommended)
4. **Free tier includes:**
   - 500 hours/month (enough for 24/7 usage)
   - 1GB RAM
   - Shared CPU
   - Perfect for this app!

### Step 2: Deploy Your Repository
1. **In Railway dashboard:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your WhatsApp-Extraction repository
   - Click "Deploy Now"

2. **Railway will automatically:**
   - Detect it's a Node.js project
   - Install dependencies
   - Start the application

### Step 3: Configure Environment Variables
1. **In your Railway project dashboard:**
   - Go to "Variables" tab
   - Add these environment variables:

```
NODE_ENV=production
```

2. **Optional variables:**
```
PORT=3000
```

### Step 4: Set Up WhatsApp Authentication
1. **First deployment will fail** (no WhatsApp auth)
2. **Check the logs:**
   - Go to "Deployments" tab
   - Click on the latest deployment
   - Click "View Logs"
   - Look for the QR code

3. **Scan the QR code:**
   - Open WhatsApp on your phone
   - Go to Settings → Linked Devices
   - Scan the QR code from the logs

4. **Redeploy:**
   - Go back to "Deployments"
   - Click "Redeploy" button
   - The app should now connect successfully

### Step 5: Verify Deployment
1. **Check the logs:**
   - Should show "✅ WhatsApp client is ready!"
   - Should show "🎯 Monitoring group: [your-group-id]"

2. **Test the health endpoint:**
   - Your app URL will be: `https://your-app-name.railway.app`
   - Visit: `https://your-app-name.railway.app/health`
   - Should return: `{"status":"healthy","message":"WhatsApp Tracker is running"}`

## 🔧 Configuration

### Update Group ID
1. **Edit config.js in your local repository:**
   ```javascript
   TARGET_GROUP_ID: "YOUR_ACTUAL_GROUP_ID@g.us"
   ```

2. **Push to GitHub:**
   ```bash
   git add config.js
   git commit -m "Update group ID"
   git push
   ```

3. **Railway will automatically redeploy**

### Customize Settings
Edit `config.js` locally and push changes:
- Excel file path
- Number detection patterns
- Spending keywords
- Logging settings

## 📊 Monitoring Your App

### Railway Dashboard
- **Overview**: See app status and resource usage
- **Deployments**: View deployment history and logs
- **Variables**: Manage environment variables
- **Settings**: Configure app settings

### Logs
- **Real-time logs**: See what's happening
- **Error tracking**: Monitor for issues
- **WhatsApp connection status**: Verify it's connected

### Health Checks
- **Automatic**: Railway checks `/health` endpoint
- **Manual**: Visit your app URL + `/health`
- **Status**: Should return healthy status

## 💰 Free Tier Limits

**Railway Free Tier:**
- ✅ 500 hours/month (enough for 24/7)
- ✅ 1GB RAM
- ✅ Shared CPU
- ✅ Automatic deployments
- ✅ Custom domains
- ✅ SSL certificates

**What happens when you hit limits:**
- App stops running
- No data loss
- Upgrade to paid plan or wait for next month

## 🔄 Updates and Maintenance

### Automatic Updates
- Push to GitHub → Automatic deployment
- No manual intervention needed
- Zero downtime deployments

### Manual Updates
1. **Edit files locally**
2. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Update description"
   git push
   ```
3. **Railway auto-deploys**

### Monitoring
- **Set up notifications** in Railway dashboard
- **Check logs regularly** for issues
- **Monitor resource usage**

## 🛠️ Troubleshooting

### Common Issues

**1. QR Code Not Working**
- Check logs for QR code
- Make sure WhatsApp is latest version
- Try redeploying

**2. App Not Starting**
- Check logs for errors
- Verify all dependencies installed
- Check environment variables

**3. WhatsApp Connection Issues**
- App will auto-reconnect
- Check phone internet connection
- Verify group ID is correct

**4. Excel File Issues**
- File is stored in Railway's ephemeral storage
- Consider using external storage (Google Drive API)
- Or download file periodically

### Getting Help
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **GitHub Issues**: Create issue in your repo

## 🎉 Success!

Once deployed, your WhatsApp tracker will:
- ✅ Run 24/7 on Railway
- ✅ Monitor your WhatsApp group
- ✅ Update Excel file automatically
- ✅ Provide spending analysis
- ✅ Be accessible via web URL

## 📱 Next Steps

1. **Test the deployment** - Send messages to your group
2. **Monitor logs** - Check Railway dashboard
3. **Set up notifications** - Get alerts for issues
4. **Backup strategy** - Consider external storage for Excel file
5. **Scale if needed** - Upgrade to paid plan for more resources

Your WhatsApp tracker is now running in the cloud for free! 🚀
