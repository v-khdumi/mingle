# ✨ Welcome to Your Spark Template!
You've just launched your brand-new Spark Template Codespace — everything’s fired up and ready for you to explore, build, and create with Spark!

This template is your blank canvas. It comes with a minimal setup to help you get started quickly with Spark development.

🚀 What's Inside?
- A clean, minimal Spark environment
- Pre-configured for local development
- Ready to scale with your ideas
  
🧠 What Can You Do?

Right now, this is just a starting point — the perfect place to begin building and testing your Spark applications.

## ☁️ Deploy to Azure

Click the button below to deploy the Mingle app to Azure Static Web Apps:

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fv-khdumi%2Fmingle%2Fmain%2Fazuredeploy.json)

### What gets deployed

| Resource | Type | Purpose |
|----------|------|---------|
| Azure Static Web App | `Microsoft.Web/staticSites` | Hosts the React SPA with global CDN, free SSL, and staging environments for PRs |

### Prerequisites

- An [Azure subscription](https://azure.microsoft.com/free/)
- A GitHub account (for CI/CD integration)

### Setup steps

1. **Deploy the infrastructure** — click the button above or run the Azure CLI command below.
2. **Copy the deployment token** — from the Azure Portal, open the Static Web App resource → **Manage deployment token**.
3. **Add the token as a GitHub secret** — go to your repo → **Settings → Secrets and variables → Actions** → create `AZURE_STATIC_WEB_APPS_API_TOKEN` with the deployment token value.
4. **Push to `main`** — the GitHub Actions workflow (`.github/workflows/azure-deploy.yml`) will build and deploy automatically.

### Deploy with Azure CLI

```bash
# Login to Azure
az login

# Create a resource group (if needed)
az group create --name mingle-rg --location westeurope

# Deploy the ARM template
az deployment group create \
  --resource-group mingle-rg \
  --template-file azuredeploy.json \
  --parameters azuredeploy.parameters.json

# Retrieve the deployment token
az staticwebapp secrets list --name mingle-app --resource-group mingle-rg
```

🧹 Just Exploring?
No problem! If you were just checking things out and don’t need to keep this code:

- Simply delete your Spark.
- Everything will be cleaned up — no traces left behind.

📄 License For Spark Template Resources 

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
