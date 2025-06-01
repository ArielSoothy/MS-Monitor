# 🚀 Production Deployment Guide for MS Monitor Dashboard

## Overview
This guide will help you deploy the MS Monitor Dashboard to production with live Azure Data Explorer connection at: `https://arielsoothy.github.io/MS-Monitor/`

## Prerequisites
- Azure subscription with Data Explorer cluster
- Azure AD app registration
- GitHub repository with Actions enabled

---

## Step 1: Configure Azure AD App Registration

### 1.1 Update Redirect URIs
In your Azure AD app registration (**MS-Monitor-Dashboard**), add these redirect URIs:

```
https://arielsoothy.github.io/MS-Monitor/
https://arielsoothy.github.io/MS-Monitor/#/overview
https://arielsoothy.github.io/MS-Monitor/#/
```

### 1.2 Platform Configuration
- Platform: **Single-page application (SPA)**
- ✅ Access tokens (implicit flows)
- ✅ ID tokens (implicit and hybrid flows)

### 1.3 API Permissions
Ensure these permissions are granted:
- **Azure Data Explorer**: `https://help.kusto.windows.net/user_impersonation`
- **Microsoft Graph**: `User.Read`

### 1.4 Grant Admin Consent
Click **"Grant admin consent"** for your organization.

---

## Step 2: Configure GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```
VITE_AZURE_TENANT_ID=a0a91867-5c72-4cca-b8f2-735803aa267d
VITE_AZURE_CLIENT_ID=5ed6a827-00dd-4d4f-ba92-eea47325cc07
VITE_AZURE_CLUSTER=msmonitoradx.israelcentral.kusto.windows.net
VITE_AZURE_DATABASE=monitoringdb
```

---

## Step 3: Deploy to Production

### 3.1 Trigger Deployment
Push to main branch or manually trigger the GitHub Action:

```bash
git add .
git commit -m "Configure production Azure authentication"
git push origin main
```

### 3.2 Monitor Deployment
- Go to GitHub Actions tab
- Watch the "Deploy to GitHub Pages" workflow
- Deployment URL: https://arielsoothy.github.io/MS-Monitor/

---

## Step 4: Test Production Deployment

### 4.1 Access the Application
1. Navigate to: https://arielsoothy.github.io/MS-Monitor/
2. You should see an authentication prompt
3. Click "Sign in with Microsoft"
4. Complete Azure AD authentication flow

### 4.2 Verify Functionality
- ✅ Authentication works
- ✅ Live data loads from Azure Data Explorer
- ✅ All dashboard features work
- ✅ Real-time updates function

---

## Step 5: Fallback and Demo Mode

### 5.1 If Authentication Fails
The application will automatically fall back to demo mode with:
- Realistic mock data
- Full functionality demonstration
- No Azure connection required

### 5.2 Demo Mode Features
- 160+ realistic pipeline names
- Geographic threat data
- Threat correlation insights
- Performance metrics
- Alert management

---

## Configuration Files Updated

### Environment Variables
- `.env.production` - Production configuration
- GitHub Actions environment variables
- Azure config in `src/config/azure.ts`

### Authentication Services
- `src/services/azureAuthService.ts` - OAuth2 flow
- `src/services/azureService.ts` - Data Explorer integration
- `src/components/AzureAuth.tsx` - Authentication UI

### Build Configuration
- `.github/workflows/deploy.yml` - Updated for production
- `vite.config.ts` - GitHub Pages configuration
- `package.json` - Deployment scripts

---

## Troubleshooting

### Common Issues

**1. CORS Errors**
- Ensure redirect URIs are correctly configured
- Check Azure AD app registration platform settings

**2. Authentication Loops**
- Clear browser cache and cookies
- Verify client ID and tenant ID are correct

**3. Data Loading Issues**
- Check Azure Data Explorer cluster status
- Verify database permissions
- Review browser console for errors

**4. Build Failures**
- Ensure all GitHub secrets are set
- Check GitHub Actions logs
- Verify environment variable names

---

## Security Notes

🔒 **Important Security Practices:**
- Never commit Azure credentials to Git
- Use GitHub Secrets for sensitive values
- Regularly rotate access tokens
- Monitor Azure AD sign-in logs
- Review app permissions periodically

---

## Next Steps

After successful deployment:
1. Test all dashboard features
2. Monitor Azure costs
3. Set up Azure alerts
4. Configure log analytics
5. Plan data retention policies

---

## Support

If you encounter issues:
1. Check GitHub Actions logs
2. Review Azure AD audit logs
3. Verify Azure Data Explorer connectivity
4. Test in demo mode first
5. Check browser console for errors

**Production URL**: https://arielsoothy.github.io/MS-Monitor/
**Monitoring**: GitHub Actions dashboard
**Logs**: Azure Portal → Azure AD → Sign-ins
