import { Resend } from 'resend'

class EmailService {
  private resend: Resend

  constructor() {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
      throw new Error(
        '[Error][EmailService] RESEND_API_KEY is not configured in environment variables'
      )
    }

    this.resend = new Resend(apiKey)
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.FROM_EMAIL || 'Vilela.Ai <support@vilela.ai>',
        to: [email],
        subject: 'Código de Verificação - Vilela AI',
        html: this.getVerificationEmailTemplate(code),
      })

      if (error) {
        console.error('[Error][EmailService] Error sending email:', error)
        throw new Error('Falha ao enviar email de verificação')
      }

      console.log('[EmailService] Email sent successfully:', data?.id)
    } catch (error) {
      console.error('[Error][EmailService] Error sending email:', error)
      throw new Error('Falha ao enviar email de verificação')
    }
  }

  private getVerificationEmailTemplate(code: string): string {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Código de Verificação</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">Vilela AI</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
              Código de Verificação
            </h2>
            
            <p style="color: #4a5568; margin: 0 0 30px 0; font-size: 16px; line-height: 1.5;">
              Olá! Use o código abaixo para acessar sua conta no Vilela AI:
            </p>
            
            <!-- Code Box -->
            <div style="background: #f7fafc; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
              <div style="color: #2d3748; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${code}
              </div>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 30px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                ⏰ <strong>Este código expira em 10 minutos</strong>
              </p>
            </div>
            
            <p style="color: #718096; margin: 30px 0 0 0; font-size: 14px; line-height: 1.5;">
              Se você não solicitou este código, pode ignorar este email com segurança.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0;">
            <p style="color: #a0aec0; margin: 0; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Vilela AI. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  // Método para envio de email de boas-vindas (opcional)
  async sendWelcomeEmail(email: string, name?: string): Promise<void> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.FROM_EMAIL || 'Vilela AI <onboarding@resend.dev>',
        to: [email],
        subject: 'Bem-vindo ao Vilela AI! 🚀',
        html: this.getWelcomeEmailTemplate(name || 'Usuário'),
      })

      if (error) {
        console.error('Erro ao enviar email de boas-vindas:', error)
        // Não lançar erro aqui para não quebrar o fluxo de auth
        return
      }

      console.log('Email de boas-vindas enviado:', data?.id)
    } catch (error) {
      console.error('Erro ao enviar email de boas-vindas:', error)
      // Não lançar erro aqui para não quebrar o fluxo de auth
    }
  }

  private getWelcomeEmailTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bem-vindo ao Vilela AI</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">Vilela AI</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
              Bem-vindo, ${name}! 🎉
            </h2>
            
            <p style="color: #4a5568; margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">
              Obrigado por se juntar ao Vilela AI! Agora você pode:
            </p>
            
            <ul style="color: #4a5568; margin: 20px 0; padding-left: 20px;">
              <li style="margin-bottom: 10px;">🎤 Iniciar chamadas com transcrição em tempo real</li>
              <li style="margin-bottom: 10px;">🤖 Gerar respostas inteligentes com IA</li>
              <li style="margin-bottom: 10px;">📊 Acompanhar suas conversas e métricas</li>
            </ul>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; display: inline-block;">
                Começar Agora
              </a>
            </div>
            
            <p style="color: #718096; margin: 30px 0 0 0; font-size: 14px; line-height: 1.5;">
              Se tiver dúvidas, responda este email. Estamos aqui para ajudar!
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0;">
            <p style="color: #a0aec0; margin: 0; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Vilela AI. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

export const emailService = new EmailService()
