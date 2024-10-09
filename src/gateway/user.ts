import { Aws_secret } from 'driver/aws_secret'
import { Slack_api } from 'driver/slack_api'
import { Port } from 'port'

export class User implements Port.IUserPort {
  async get_user_name(email: string): Promise<string> {
    const Slack_api_instance = new Slack_api()
    try {
      const userId = await Slack_api_instance.lookup_user_by_email(email)
      if (!userId) {
        throw Error('ユーザーIDが取得できませんでした')
      }
      const userInfo = await Slack_api_instance.get_user_info(userId)
      const name = userInfo.profile?.display_name
      if (!name) {
        throw Error('ユーザー名が取得できませんでした')
      }
      return name
    } catch (error: Error | any) {
      console.error(error)
      throw error
    }
  }
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

  async get_users_emails(): Promise<string[]> {
    const aws_secret_instance = new Aws_secret()
    let emails: string[] = []
    try {
      const password_secret = await aws_secret_instance.get_secret(
        process.env.SECRET_NAME as string
      )
      emails = Object.keys(JSON.parse(password_secret))
      return emails
    } catch (error: Error | any) {
      console.error('Error retrieving secrets:', error)
      throw error
    }
  }
  async update_user_secret(email: string, password: string): Promise<void> {
    const aws_secret_instance = new Aws_secret()
    const secret_name = process.env.SECRET_NAME as string
    const secret = await aws_secret_instance.get_secret(secret_name)

    if (!secret) {
      throw new Error('シークレットが取得できませんでした')
    }

    try {
      if (JSON.parse(secret)[email]) {
        await aws_secret_instance.put_secret(secret_name, { email: password })
      } else {
        await aws_secret_instance.post_secret(secret_name, { email: password })
      }
    } catch (error: Error | any) {
      console.error(error)
      throw error
    }
  }
}
