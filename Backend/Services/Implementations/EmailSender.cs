using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using TODOLIST.Services.Interfaces;

namespace TODOLIST.Services.Implementations
{
    public class GMailEmailSender : IEmailSender
    {

        private readonly IConfiguration _config;

        private readonly string Password;
        private readonly string Email;
        private readonly string From;

        public GMailEmailSender(IConfiguration config)
        {
            _config = config ?? throw new ArgumentNullException(nameof(config));

            Email = _config["EmailSender:Email"] ?? throw new Exception("EmailSender.Email is missing on the appsettings");
            Password = _config["EmailSender:Password"] ?? throw new Exception("EmailSender.Password is missing on the appsettings");
            From = _config["EmailSender:From"] ?? throw new Exception("EmailSender.From is missing on the appsettings");
        }

        public void Send(string receiverName, string receiverAddress, string subject, string message)
        {
            var mailMessage = new MimeMessage();
            mailMessage.From.Add(new MailboxAddress(From, Email));
            mailMessage.To.Add(new MailboxAddress(receiverName, receiverAddress));
            mailMessage.Subject = subject;
            mailMessage.Body = new TextPart("plain")
            {
                Text = message
            };

            using var client = new SmtpClient();
            try
            {
                client.Connect("smtp.gmail.com", 587, SecureSocketOptions.StartTls);

                // Nota: No es seguro guardar tu contraseña en el código. Considera usar un gestor de secretos o variables de entorno.
                client.Authenticate(Email, Password);

                client.Send(mailMessage);
                Console.WriteLine("Correo enviado correctamente.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al enviar el correo: {ex.Message}");
            }
            finally
            {
                client.Disconnect(true);
            }
        }
    }
}
