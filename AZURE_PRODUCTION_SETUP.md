# 🔐 Azure AD App Registration Configuration for Production

## Step-by-Step Azure Portal Configuration

### 1. Login to Azure Portal
- Go to: https://portal.azure.com
- Navigate to **Azure Active Directory** > **App registrations**
- Find your app: **MS-Monitor-Dashboard** (Client ID: 5ed6a827-00dd-4d4f-ba92-eea47325cc07)

### 2. Configure Redirect URIs
In your app registration, go to **Authentication** and add these redirect URIs:

**Production URLs to Add:**
```
https://arielsoothy.github.io/MS-Monitor/
https://arielsoothy.github.io/MS-Monitor/#/overview
https://arielsoothy.github.io/MS-Monitor/#/
```

**Development URLs (keep these for testing):**
```
http://localhost:3005/MS-Monitor/
http://localhost:3005/MS-Monitor/#/overview
http://localhost:5173/MS-Monitor/
http://localhost:5173/MS-Monitor/#/overview
```

### 3. Configure Platform Settings
- Platform type: **Single-page application (SPA)**
- Check: ✅ **Access tokens (used for implicit flows)**
- Check: ✅ **ID tokens (used for implicit and hybrid flows)**

### 4. Create Client Secret
- Go to **Certificates & secrets**
- Click **+ New client secret**
- Description: `MS-Monitor-Production`
- Expires: **24 months** (recommended)
- **COPY THE SECRET VALUE** (you'll only see it once!)

### 5. API Permissions
Ensure your app has these permissions:
- **Azure Data Explorer**: `https://help.kusto.windows.net/user_impersonation`
- **Microsoft Graph**: `User.Read` (for basic profile)

### 6. Grant Admin Consent
- Click **Grant admin consent for [Your Organization]**
- Confirm with **Yes**

---

## Next Steps After Azure Portal Configuration:
1. Update environment variables with client secret
2. Implement real authentication flow
3. Test live connection
4. Deploy to production

**⚠️ IMPORTANT:** Keep your client secret secure - never commit it to GitHub!
