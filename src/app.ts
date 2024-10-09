import { App, AwsLambdaReceiver } from '@slack/bolt'
import 'dotenv/config'
import { AttendanceUseCase } from 'usecases/attendance'
import { Attendance } from 'controller/attendance'
import { Presence } from 'controller/presence'
import { User as gatewayUser } from 'gateway/user'
import { User as usecasesUser } from 'usecases/user'
import { AwsCallback, AwsEvent } from '@slack/bolt/dist/receivers/AwsLambdaReceiver'

// Initialize your custom receiver
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET as string

const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: SLACK_SIGNING_SECRET,
  customPropertiesExtractor: req => req
})

// ボットトークンと Signing Secret を使ってアプリを初期化します
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: awsLambdaReceiver,
  processBeforeResponse: true
})

app.use(async args => {
  const { context, next } = args
  // リトライされたイベントであればスキップすべきかどうか判断する
  if (
    context?.retryNum &&
    (context.headers['x-slack-retry-num'] || context.headers['X-Slack-Retry-Num'])
  )
    return
  await next()
})

// Instantiate the services
const userPort = new gatewayUser()
const attendancePort = new Attendance()
const presencePort = new Presence()
// Inject the services into the use case
const attendanceUseCase = new AttendanceUseCase(userPort, attendancePort, presencePort)

// "in" を含むメッセージをリッスンします
// thisを渡すためにbindを使う
app.message(/^in$/, async message_arg => await attendanceUseCase.attendance_from_slack(message_arg))

app.message(
  /^out$/,
  async message_arg => await attendanceUseCase.attendance_from_slack(message_arg)
)

app.message(
  /^bin$/,
  async message_arg => await attendanceUseCase.attendance_from_slack(message_arg)
)

app.message(
  /^bout$/,
  async message_arg => await attendanceUseCase.attendance_from_slack(message_arg)
)

app.view('login_model', async context => await new usecasesUser(userPort).save_user_secret(context))

// Lambda 関数のイベントを処理します
module.exports.handler = async (event: AwsEvent, context: any, callback: AwsCallback) => {
  const handler = await awsLambdaReceiver.start()
  return handler(event, context, callback)
}

module.exports.checkPresence = async (event: AwsEvent, context: any, callback: AwsCallback) => {
  await attendanceUseCase.set_emails()
  await attendanceUseCase.on_change_presence_for_attendance(app)
}

module.exports.login = async (event: AwsEvent, context: any, callback: AwsCallback) => {
  const handler = await awsLambdaReceiver.start()
  return handler(event, context, callback)
}
