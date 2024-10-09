import { AllMiddlewareArgs, SlackViewAction, SlackViewMiddlewareArgs } from '@slack/bolt'
import { StringIndexed } from '@slack/bolt/dist/types/helpers'
import { Port } from 'port'

export class User {
  constructor(private user_port: Port.IUserPort) {}
  async save_user_secret({
    ack,
    body,
    view,
    client,
    logger
  }: SlackViewMiddlewareArgs<SlackViewAction> & AllMiddlewareArgs<StringIndexed>): Promise<void> {
    await ack()

    const values = view.state.values
    const email = values['email_block']['email_input'].value as string
    const password = values['password_block']['password_input'].value as string
    const user = body['user']['id']

    try {
      await this.user_port.update_user_secret(email, password)
      await client.views.update({
        view_id: view.id,
        hash: view.hash,
        view: {
          type: 'modal',
          callback_id: 'user_secret_modal',
          title: {
            type: 'plain_text',
            text: 'ユーザー情報の登録'
          },
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: 'ユーザー情報を登録しました'
              }
            }
          ]
        }
      })
      await client.chat.postMessage({
        channel: user,
        text: `
          email: ${email}
          password: ${password}
          ユーザー情報を登録しました
        `
      })
    } catch (error: Error | any) {}
  }
}
