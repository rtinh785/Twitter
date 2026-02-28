import fs from 'fs'
import path from 'path'
import 'dotenv/config'

export const getVerifyEmailTemplate = (token: string, resetPassword?: boolean) => {
  const templatePath = path.resolve('src/templates/verify-email.html')
  let html = fs.readFileSync(templatePath, 'utf-8')

  const title = resetPassword ? 'Đặt lại mật khẩu' : 'Xác thực email'
  const content = resetPassword
    ? 'Nhấn nút bên dưới để đặt lại mật khẩu của bạn'
    : 'Nhấn nút bên dưới để xác thực tài khoản của bạn'
  const link = `${process.env.URL_CLIENT_HOST}/${resetPassword ? 'reset-password' : 'verify-email'}?token=${token}`
  const titleLink = resetPassword ? 'Đặt lại mật khẩu ngay' : 'Xác thực ngay'

  html = html
    .replace('{{title}}', title)
    .replace('{{content}}', content)
    .replace('{{link}}', link)
    .replace('{{titleLink}}', titleLink)

  return html
}
