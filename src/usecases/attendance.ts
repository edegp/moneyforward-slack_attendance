import { ChatPostMessageResponse } from '@slack/web-api'
import { App, MessageEvent } from '@slack/bolt'
import { Port } from 'port'

const stamp_map = {
  in: '出勤',
  out: '退勤',
  bin: '休憩開始',
  bout: '休憩終了'
}

type stamp = 'in' | 'out' | 'bin' | 'bout'

export class AttendanceUseCase {
  lastPresence: string | null
  emails: string[]
  constructor(
    private user_port: Port.IUserPort,
    private attendance_port: Port.IAttendancePort,
    private presence_port: Port.IPresence
  ) {
    this.lastPresence = 'away'
    this.emails = []
  }

  async set_emails(): Promise<void> {
    this.emails = await this.user_port.get_users_emails()
  }

  async attendance_from_slack({
    message,
    say
  }: {
    message: MessageEvent & { user?: string; text?: string }
    say: (ms: string) => Promise<ChatPostMessageResponse>
  }): Promise<void> {
    // イベントがトリガーされたチャンネルに say() でメッセージを送信します
    const { user, channel, text } = message
    // 対象チャンネル以外もしくはuserがundefinedもしくはtextが想定外の場合は無視する
    if (
      channel != process.env.TARGET_CHANNEL_ID ||
      user === undefined ||
      text == undefined ||
      text in stamp_map === false
    )
      return

    const stamp = text as stamp

    let email: string
    try {
      email = await this.user_port.get_user_email(user)
    } catch (error: Error | any) {
      console.error(error.message)
      await say('メールアドレスの取得に失敗しました')
      return
    }

    let password: string
    try {
      password = await this.user_port.get_user_password(email)
    } catch (error: Error | any) {
      console.error(error.message)
      await say('パスワードの取得に失敗しました')
      return
    }

    try {
      switch (stamp) {
        case 'in':
          await this.attendance_port.attendance_in(email, password)
          break
        case 'out':
          await this.attendance_port.attendance_out(email, password)
          break
        case 'bin':
          await this.attendance_port.start_break(email, password)
          break
        case 'bout':
          await this.attendance_port.end_break(email, password)
          break
      }

      await say(`${stamp_map[stamp]}しました`)
    } catch (error: Error | any) {
      await say(error.message)
    }
  }

  async on_change_presence_for_attendance(app: App): Promise<void> {
    // Process each email
    for (const email of this.emails) {
      let password: string
      try {
        password = await this.user_port.get_user_password(email)
      } catch (error: Error | any) {
        console.error(error.message)
        continue
      }
      const user_name = await this.user_port.get_user_name(email)
      try {
        const currentPresence = await this.presence_port.checkPresence(email)
        if (currentPresence !== this.lastPresence) {
          console.log(
            `User ${email} changed presence from ${this.lastPresence} to ${currentPresence}`
          )
          switch (currentPresence) {
            case 'active':
              await this.attendance_port.attendance_in(email, password)
              await app.client.chat.postMessage({
                channel: process.env.TARGET_CHANNEL_ID as string,
                text: `:wave: @${user_name} ${email} が出勤しました`
              })
              break
            case 'away':
              await this.attendance_port.attendance_out(email, password)
              await app.client.chat.postMessage({
                channel: process.env.TARGET_CHANNEL_ID as string,
                text: `:wave: @${user_name} ${email} が退勤しました`
              })
              break
            default:
              console.log(`Unknown presence: ${this.lastPresence}`)
          }
          this.lastPresence = currentPresence
          console.log(`User's presence has changed to: ${currentPresence}`)
        } else {
          console.log(`User ${email} is still ${currentPresence}`)
        }
      } catch (error: Error | any) {
        console.error(`Error processing email ${email}:`, error)
      }
    }
  }
}
