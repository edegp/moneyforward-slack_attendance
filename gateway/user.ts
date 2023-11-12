import { Aws_secret } from '../driver/aws_secret'
import { Slack_api } from '../driver/slack_api'
import { Port } from '../port'

export class User implements Port.IUserPort {
  async get_user_email(userId: string): Promise<string> {
    const Slack_api_instance = new Slack_api()
    try {
      const userInfo = await Slack_api_instance.get_user_info(userId)
      const email = userInfo.profile?.email
      if (!email) {
        throw Error('メールアドレスが取得できませんでした')
      }
      return email
    } catch (error: Error | any) {
      console.error(error)
      throw error
    }
  }

  async get_user_password(email: string): Promise<string> {
    const aws_secret_instance = new Aws_secret()
    try {
      const password_secret = await aws_secret_instance.get_secret(
        process.env.SECRET_NAME as string
      )
      const password = JSON.parse(password_secret)[email]
      if (!password) {
        throw new Error('パスワードが登録されていません')
      }
      return password
    } catch (error: Error | any) {
      console.error(error)
      throw error
    }
  }
}
