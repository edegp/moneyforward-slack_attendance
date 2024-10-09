import chromium from '@sparticuz/chromium'
import puppeteer, { Browser, Page } from 'puppeteer-core'

export class Chrome_browser {
  page: Page | null
  browser: Browser | null

  constructor() {
    this.page = null
    this.browser = null
  }
  async setup(): Promise<void> {
    try {
      const executablePath =
        process.env.STAGE === 'prd'
          ? await chromium.executablePath('/opt/nodejs/node_modules/@sparticuz/chromium/bin')
          : '/opt/homebrew/bin/chromium'
      console.info('executablePath:', executablePath)
      console.info('ブラウザを起動します')
      console.log(chromium.defaultViewport)

      this.browser = await puppeteer.launch({
        ignoreHTTPSErrors: true,
        defaultViewport: chromium.defaultViewport,
        args: chromium.args,
        executablePath: executablePath,
        headless: process.env.STAGE === 'prd' ? chromium.headless : false // ブラウザが動く様子を確認する
      })
      console.info('ブラウザを起動しました')
      if (this.browser === null) {
        throw Error('ブラウザを起動できませんでした')
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
      console.info(`${url} 画面を開きました`)
      if (open_response === null) {
        throw new Error('ログイン画面を開けませんでした')
      }
    } catch (e) {
      console.error('An error occurred:', e)
      throw new Error('ブラウザが開けませんでした: ' + e.message)
    }
  }

  async click(selector: string): Promise<void> {
    try {
      // await this.page.click(selector)
      const target = await this.page.$(selector)
      if (target === null) {
        throw new Error(selector + 'が見つかりませんでした')
      }
      await target.evaluate(b => (b as HTMLElement).click())
    } catch (e: Error | any) {
      console.error(e)
      throw e
    }
  }

  async type(selector: string, text: string): Promise<void> {
    try {
      const type_response = await this.page.type(selector, text, {
        delay: 50
      })
      console.info(selector + 'に入力しました')
      if (type_response === null) {
        throw new Error(selector + 'を入力できませんでした')
      }
    } catch (e: Error | any) {
      console.error(e)
      throw e
    }
  }

  async wait_for_selector(selector: string): Promise<void> {
    try {
      await this.page.waitForSelector(selector, {
        visible: true
      })
      console.info(selector + 'が見つかりました')
    } catch (e: Error | any) {
      console.error(e)
      throw new Error(selector + 'が見つかりませんでした')
    }
  }

  async wait_for_navigation(): Promise<void> {
    try {
      await this.page.waitForNavigation()
      console.info('ページ遷移しました')
    } catch (e: Error | any) {
      console.error(e)
      throw new Error('ページ遷移できませんでした')
    }
  }

  async close(): Promise<void> {
    try {
      await this.browser.close()
      console.info('ブラウザを閉じました')
    } catch (e: Error | any) {
      console.error(e)
      throw new Error('ブラウザが閉じれませんでした')
    }
  }

  async get_href(selector: string): Promise<string> {
    try {
      const handle = await this.page.$(selector)
      console.info(selector + 'を取得しました')
      if (handle === null) {
        throw new Error(selector + 'が見つかりませんでした')
      }
      const path = await this.page.evaluate(anchor => anchor?.getAttribute('href'), handle)
      console.info(selector + 'のhref を取得しました ' + path)
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
