import { Slack_api } from 'driver/slack_api'
import { Port } from 'port'

export class Presence implements Port.IPresence {
  private user_port: Slack_api

  constructor() {
    this.user_port = new Slack_api()
  }

  async checkPresence(email: string): Promise<string> {
    try {
      // User ID of the user to track
      const userId: string = (await this.user_port.lookup_user_by_email(email)) as string

      // Call the Slack API to get the user's presence
      const currentPresence = await this.user_port.get_user_presence(userId)

      console.log(currentPresence)
      return currentPresence
    } catch (error: Error | any) {
      console.error(error)
      throw error
    }
  }
}
