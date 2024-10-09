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

  async lookup_user_by_email(email: string): Promise<string | void> {
    try {
      const response = await this.client.users.lookupByEmail({ email })

      if (response.ok) {
        if (response.user !== undefined) {
          console.log('User found:', response.user.id)
          const user = response.user.id as string
          return user
        }
      } else {
        console.error('Error looking up user:', response.error)
      }
    } catch (error) {
      console.error('API call failed:', error)
    }
  }

  async get_user_presence(userId: string): Promise<string> {
    try {
      const response = await this.client.users.getPresence({ user: userId })
      if (response.ok) {
        if (response.presence === undefined) {
          throw new Error('ユーザーのプレゼンスが取得できませんでした')
        }
        return response.presence
      } else {
        console.error('Error getting user presence:', response.error)
        throw new Error('ユーザーのプレゼンスが取得できませんでした')
      }
    } catch (error) {
      console.error('API call failed:', error)
      throw new Error('ユーザーのプレゼンスが取得できませんでした')
    }
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
