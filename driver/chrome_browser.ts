import chromium from '@sparticuz/chromium'
import puppeteer, { Browser, Page } from 'puppeteer-core'

export class Chrome_browser {
  page: Page
  browser: Browser
  async setup(): Promise<void> {
    try {
      const executablePath =
        process.env.STAGE === 'prd'
          ? await chromium.executablePath('/opt/nodejs/node_modules/@sparticuz/chromium/bin')
          : '/usr/bin/google-chrome'
      this.browser = await puppeteer.launch({
        ignoreHTTPSErrors: true,
        defaultViewport: chromium.defaultViewport,
        args: chromium.args,
        executablePath: executablePath,
        headless: process.env.STAGE === 'prd' ? chromium.headless : false // ブラウザが動く様子を確認する
      })
      if (this.browser === null) {
        throw Error('ブラウザが開けませんでした')
      }
      this.page = await this.browser.newPage()
      if (this.page === null) {
        throw Error('ページが開けませんでした')
      }
    } catch (e: Error | any) {
      console.error(e)
      throw e
    }
  }

  async open(url: string): Promise<void> {
    try {
      const open_response = await this.page.goto(url)
      if (open_response === null) {
        throw new Error('ログイン画面を開けませんでした')
      }
    } catch (e) {
      console.error('An error occurred:', e)
      throw new Error('ブラウザが開けませんでした: ' + e.message)
    }
  }

  async click(selector: string): Promise<void> {
    const error = new Error(selector + 'ボタンを押せませんでした')
    try {
      const click_response = await this.page.click(selector)
      if (click_response === null) {
        throw error
      }
    } catch (e: Error | any) {
      console.error(e)
      throw e
    }
  }

  async type(selector: string, text: string): Promise<void> {
    const error = new Error(selector + 'を入力できませんでした')
    try {
      const type_response = await this.page.type(selector, text, {
        delay: 50
      })
      if (type_response === null) {
        throw error
      }
    } catch (e: Error | any) {
      console.error(e)
      throw error
    }
  }

  async wait_for_selector(selector: string): Promise<void> {
    try {
      await this.page.waitForSelector(selector, {
        visible: true
      })
    } catch (e: Error | any) {
      console.error(e)
      throw new Error(selector + 'が見つかりませんでした')
    }
  }

  async close(): Promise<void> {
    try {
      await this.browser.close()
    } catch (e: Error | any) {
      console.error(e)
      throw new Error('ブラウザが閉じれませんでした')
    }
  }

  async get_href(selector: string): Promise<string> {
    try {
      const handle = await this.page.$(selector)
      if (handle === null) {
        throw new Error(selector + 'が見つかりませんでした')
      }
      const path = await this.page.evaluate(anchor => anchor?.getAttribute('href'), handle)
      if (path === null) {
        throw new Error(selector + 'のhrefが取得できませんでした')
      }
      return path
    } catch (e: Error | any) {
      console.error(e)
      throw new Error(e.message)
    }
  }
  // async screen_shot(path: string): Promise<void> {
  //   try {
  //     await this.page.screenshot({ path: path })
  //   } catch (e: Error | any) {
  //     console.error(e)
  //     throw new Error('スクリーンショットが取れませんでした')
  //   }
  // }
}
