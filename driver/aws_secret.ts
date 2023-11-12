import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'

export class Aws_secret {
  client: SecretsManagerClient
  constructor() {
    this.client = new SecretsManagerClient({
      region: process.env.REGION || 'ap-northeast-1'
    })
  }

  async get_secret(secret_name: string): Promise<string> {
    let response

    try {
      response = await this.client.send(
        new GetSecretValueCommand({
          SecretId: secret_name,
          VersionStage: 'AWSCURRENT' // VersionStage defaults to AWSCURRENT if unspecified
        })
      )
      if (response.SecretString === undefined) {
        throw Error('SecretString is undefined')
      }
      return response.SecretString
    } catch (error: Error | any) {
      // For a list of exceptions thrown, see
      // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
      console.error(error)
      throw error
    }
  }
}
