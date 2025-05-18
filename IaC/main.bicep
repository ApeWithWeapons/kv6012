// IaC/main.bicep

targetScope = 'subscription'

@description('Location for all resources')
param location string = 'UK South'

@description('Resource name prefix')
param prefix string = 'kv6012'

@description('SQL admin user')
param sqlAdminUsername string = 'sqladmin'

@description('SQL admin password')
@secure()
param sqlAdminPassword string

var rgName     = '${prefix}-rg'
var planName   = '${prefix}-plan'
var webName    = '${prefix}-web'
var sqlName    = toLower('${prefix}sql')
var dbName     = '${prefix}db'
var vaultName  = toLower('${prefix}kv')



// App Service Plan
resource plan 'Microsoft.Web/serverfarms@2021-02-01' = {
  name: planName
  location: rg.location
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
}

// Web App (Node 20) with system-assigned identity
resource web 'Microsoft.Web/sites@2021-02-01' = {
  name: webName
  location: rg.location
  properties: {
    serverFarmId: plan.id
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
    }
  }
  identity: {
    type: 'SystemAssigned'
  }
}

// SQL Server + Database
resource sqlServer 'Microsoft.Sql/servers@2021-02-01' = {
  name: sqlName
  location: rg.location
  properties: {
    administratorLogin: sqlAdminUsername
    administratorLoginPassword: sqlPassword
  }
  sku: {
    name: 'GP_Gen5_2'
  }
}

resource sqlDb 'Microsoft.Sql/servers/databases@2021-02-01' = {
  parent: sqlServer
  name: dbName
  sku: {
    name: 'GP_Gen5_2'
  }
}

// Key Vault + access for Web App
resource vault 'Microsoft.KeyVault/vaults@2021-06-01-preview' = {
  name: vaultName
  location: rg.location
  properties: {
    tenantId: subscription().tenantId
    sku: { family: 'A'; name: 'standard' }
    accessPolicies: [
      {
        tenantId: subscription().tenantId
        objectId: web.identity.principalId
        permissions: { secrets: [ 'get' ] }
      }
    ]
  }
}

// Output the URL
output webAppUrl string = 'https://${web.name}.azurewebsites.net'
