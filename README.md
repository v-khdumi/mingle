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

Deploy the Mingle app to Azure Static Web Apps using one of the options below.

### Option A — One-click deploy (recommended)

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fv-khdumi%2Fmingle%2Fmain%2Fazuredeploy.json)

Click the button above to deploy all required Azure resources automatically.

### Option B — Custom template editor

1. Open the [Azure Portal Custom Deployment](https://portal.azure.com/#create/Microsoft.Template) page.
2. Click **Build your own template in the editor**.
3. Copy the contents of [`azuredeploy.json`](azuredeploy.json) and paste them into the editor.
4. Click **Save**, fill in the parameters, then click **Review + create**.

### What gets deployed

| Resource | Type | Purpose |
|----------|------|---------|
| Azure Static Web App | `Microsoft.Web/staticSites` | Hosts the React SPA with global CDN, free SSL, and staging environments for PRs |
| Azure OpenAI | `Microsoft.CognitiveServices/accounts` | AI-powered compatibility matching, icebreakers, horoscopes, and profile analysis (GPT-4o & GPT-4o-mini) |
| Azure Cosmos DB | `Microsoft.DocumentDB/databaseAccounts` | Serverless NoSQL database for user profiles and match data |

The template also:
- Deploys **GPT-4o** and **GPT-4o-mini** model deployments in the OpenAI account
- Creates a **mingle** database with a **profiles** container in Cosmos DB
- Configures the Static Web App with `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_KEY`, `COSMOS_DB_ENDPOINT`, `COSMOS_DB_KEY`, `COSMOS_DB_DATABASE`, and `COSMOS_DB_CONTAINER` app settings automatically
- Includes a `staticwebapp.config.json` that configures SPA navigation fallback routing and security headers

### Prerequisites

- An [Azure subscription](https://azure.microsoft.com/free/)
- A GitHub account with a [personal access token (classic)](https://github.com/settings/tokens) that has **repo** and **workflow** scopes
- Access to Azure OpenAI Service (you may need to [request access](https://aka.ms/oai/access))

### Setup steps

1. **Create a GitHub personal access token** — go to [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens) and create a token with `repo` and `workflow` scopes.
2. **Deploy the infrastructure** — use Option A (recommended), Option B, or the Azure CLI command below. When prompted, provide your **Repository URL** (e.g. `https://github.com/yourusername/mingle`) and **Repository Token** (the GitHub PAT from step 1).
3. **Done!** — Azure automatically sets up GitHub integration, generates a CI/CD workflow, and deploys the app. Future pushes to `main` trigger automatic redeployment.

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
  --parameters azuredeploy.parameters.json \
  --parameters repositoryUrl=https://github.com/yourusername/mingle \
               repositoryToken=ghp_YOUR_GITHUB_PAT
```

🧹 Just Exploring?
No problem! If you were just checking things out and don’t need to keep this code:

- Simply delete your Spark.
- Everything will be cleaned up — no traces left behind.

📄 License For Spark Template Resources 

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
