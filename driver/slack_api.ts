import { WebClient, LogLevel } from '@slack/web-api'
import { User } from '@slack/web-api/dist/response/UsersInfoResponse'
import 'dotenv/config'

export class Slack_api {
  client: WebClient

  constructor() {
    this.client = new WebClient(process.env.SLACK_BOT_TOKEN, {
      logLevel: LogLevel.INFO
    })
  }

  async get_user_info(userId: string): Promise<User> {
    // Call the users.info method using the WebClient
    try {
      // Call the users.info method using the WebClient
      const result = await this.client.users.info({
        user: userId
      })
      if (result.error) {
        throw new Error(result.error)
      }
      if (result.user === undefined) {
        throw new Error('ユーザー情報が取得できませんでした')
      }
      return result.user
    } catch (error) {
      console.error(error)
      throw new Error('ユーザー情報が取得できませんでした')
    }
  }
}
