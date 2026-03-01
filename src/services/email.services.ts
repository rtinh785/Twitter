import { Resend } from 'resend'
import { getVerifyEmailTemplate } from '~/utils/emailTemplate'

const resend = new Resend('haha')

export const sendEmail = async (email: string, token: string, resetPassword?: boolean) => {
  const html = getVerifyEmailTemplate(token, resetPassword)

  const { data, error } = await resend.emails.send({
    from: 'Tinh <onboarding@resend.dev>',
    to: 'tinh_dth216199@student.agu.edu.vn',
    subject: 'Verify email',
    html
  })

  if (error) {
    throw error
  }

  return data
}
