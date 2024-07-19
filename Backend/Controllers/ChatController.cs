using Microsoft.AspNetCore.Mvc;
using TODOLIST.Services.Interfaces;

namespace TODOLIST.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly IEmailSender _emailSender;

        public ChatController(IEmailSender emailSender)
        {
            _emailSender = emailSender;
        }

        [HttpPost("send-report")]
        public IActionResult SendReport([FromBody] ReportRequest reportRequest)
        {
            if (reportRequest == null)
                return BadRequest("Invalid report request");

            var subject = "Reporte de Problema";
            var message = $"Reporte recibido:\n\n{reportRequest.ReportDetails}";

            _emailSender.Send("Soporte", "support@example.com", subject, message);

            return Ok("Reporte enviado correctamente.");
        }

        [HttpPost("contact-admin")]
        public IActionResult ContactAdmin([FromBody] ContactRequest contactRequest)
        {
            if (contactRequest == null)
                return BadRequest("Invalid contact request");

            var subject = $"Consulta: {contactRequest.Subject}";
            var message = $"Consulta recibida:\n\n{contactRequest.Message}\n\n" +
                          $"Email de contacto: {contactRequest.ContactEmail}\n" +
                          $"Fecha estimada de respuesta: {contactRequest.EstimatedResponseTime}";

            _emailSender.Send("Soporte", "support@example.com", subject, message);

            return Ok("Consulta enviada correctamente.");
        }
    }

    public class ReportRequest
    {
        public string ReportDetails { get; set; }
    }

    public class ContactRequest
    {
        public string Subject { get; set; }
        public string Message { get; set; }
        public string ContactEmail { get; set; }
        public string EstimatedResponseTime { get; set; }
    }
}
