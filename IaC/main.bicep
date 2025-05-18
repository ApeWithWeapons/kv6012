// IaC/main.bicep

@description('Location for all resources')
param location string = 'UK South'

@description('Name prefix for resources')
param prefix   string = 'kv6012'

var rgName        = '${prefix}-rg'
var planName      = '${prefix}-plan'
var webAppName    = '${prefix}-web'
var sqlServerName = toLower('${prefix}sqlsrv')
var sqlDbName     = '${prefix}-db'
var vaultName     = toLower('${prefix}-kv')

// Resource Group (if deploying at subscription level; omit if you created RG manually)
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: rgName
  location: location
}

// App Service Plan
resource plan 'Microsoft.Web/serverfarms@2021-02-01' = {
  name: planName
  location: location
  sku: {
    name: 'B1'      // small dev tier
    tier: 'Basic'
  }
  kind: 'linux'     // or 'windows' per your stack
}

// Web App
resource web 'Microsoft.Web/sites@2021-02-01' = {
  name: webAppName
  location: location
  kind: 'app'
  properties: {
    serverFarmId: plan.id
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'   // Node.js 20
    }
  }
  identity: {
    type: 'SystemAssigned'           // for Key Vault access
  }
}

// SQL Server
resource sqlServer 'Microsoft.Sql/servers@2021-02-01' = {
  name: sqlServerName
  location: location
  properties: {
    administratorLogin: 'sqladminuser'
    administratorLoginPassword: 'P@ssw0rd!'  // replace with secure process
  }
  sku: {
    name: 'GP_Gen5_2'
  }
}

// SQL Database
resource sqlDb 'Microsoft.Sql/servers/databases@2021-02-01' = {
  parent: sqlServer
  name: sqlDbName
  sku: {
    name: 'GP_Gen5_2'
  }
}

// Key Vault
resource vault 'Microsoft.KeyVault/vaults@2021-06-01-preview' = {
  name: vaultName
  location: location
  properties: {
    tenantId: subscription().tenantId
    sku: { family: 'A', name: 'standard' }
    accessPolicies: []  // we’ll add policies in a moment
  }
}

// Grant Web App access to Key Vault
resource vaultAccess 'Microsoft.KeyVault/vaults/accessPolicies@2021-06-01-preview' = {
  name: '${vault.name}/add'
  properties: {
    accessPolicies: [
      {
        tenantId: subscription().tenantId
        objectId: web.identity.principalId
        permissions: { secrets: [ 'get' ] }
      }
    ]
  }
}

// Output the Web App URL
output webAppUrl string = 'https://${web.name}.azurewebsites.net'
