import { Port } from '../port'
import { Chrome_browser } from '../driver/chrome_browser'
import { Browser } from 'puppeteer-core'

export class Attendance implements Port.IAttendancePort {
  private async login(browser: Chrome_browser, email: string, password: string): Promise<void> {
    try {
      await browser.open('https://attendance.moneyforward.com/employee_session/new')
      await browser.wait_for_selector('a.attendance-button-mfid.attendance-button-link')
      let path = await browser.get_href('a.attendance-button-mfid.attendance-button-link')
      // キャッシュ適応クエリを削除
      const prompt_index = path.indexOf('prompt=select_account')
      if (prompt_index !== -1) {
        path = path.slice(0, prompt_index - 1)
      }
      const url = 'https://attendance.moneyforward.com' + path
      await browser.open(url)
      await browser.wait_for_selector('input[type="email"]')
      await browser.type('input[type="email"]', email)
      await browser.click('#submitto')
      await browser.wait_for_selector('input[type="password"]')
      await browser.type('input[type="password"]', password)
      await browser.click('#submitto')
    } catch (error: Error | any) {
      console.error(error)
      throw Error('ブラウザが開けませんでした')
    }
  }
  async attendance_in(email: string, password: string): Promise<void | Error> {
    const browser = new Chrome_browser()
    try {
      await browser.setup()
      await this.login(browser, email, password)
      await browser.wait_for_selector('.clock_in button')
      await browser.click('.clock_in button')
    } catch (error: Error | any) {
      console.error(error)
      return Error(error.message)
    } finally {
      await browser.close()
    }
  }
  async attendance_out(email: string, password: string): Promise<void | Error> {
    const browser = new Chrome_browser()
    try {
      await browser.setup()
      await this.login(browser, email, password)
      await browser.wait_for_selector('.clock_out button')
      await browser.click('.clock_out button')
    } catch (error: Error | any) {
      console.error(error)
      return Error(error.message)
    } finally {
      await browser.close()
    }
  }
  async start_break(email: string, password: string): Promise<void | Error> {
    const browser = new Chrome_browser()
    try {
      await browser.setup()
      await this.login(browser, email, password)
      await browser.wait_for_selector('.start_break button')
      await browser.click('.start_break button')
    } catch (error: Error | any) {
      console.error(error)
      return Error(error.message)
    } finally {
      await browser.close()
    }
  }
  async end_break(email: string, password: string): Promise<void | Error> {
    const browser = new Chrome_browser()
    try {
      await browser.setup()
      await this.login(browser, email, password)
      await browser.wait_for_selector('.end_break button')
      await browser.click('.end_break button')
    } catch (error: Error | any) {
      console.error(error)
      return Error(error.message)
    } finally {
      await browser.close()
    }
  }
}
