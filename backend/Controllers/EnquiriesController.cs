using backend.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EnquiriesController : ControllerBase
    {
        private readonly IConfiguration _config;

        public EnquiriesController(IConfiguration config)
        {
            _config = config;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] EnquiryRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Read SMTP config from environment or appsettings. Prefer ENQUIRIES_* but fall back to existing DEMO_* keys.
            var host = _config["ENQUIRIES_SMTP_HOST"] ?? _config["DEMO_SMTP_HOST"] ?? _config["DemoSmtp:Host"];
            var portStr = _config["ENQUIRIES_SMTP_PORT"] ?? _config["DEMO_SMTP_PORT"] ?? _config["DemoSmtp:Port"];
            var user = _config["ENQUIRIES_SMTP_USER"] ?? _config["DEMO_SMTP_USER"] ?? _config["DemoSmtp:User"];
            var pass = _config["ENQUIRIES_SMTP_PASS"] ?? _config["DEMO_SMTP_PASS"] ?? _config["DemoSmtp:Pass"];
            var useStartTls = (_config["ENQUIRIES_SMTP_USESTARTTLS"] ?? _config["DEMO_SMTP_USESTARTTLS"] ?? _config["DemoSmtp:UseStartTls"] ?? "true").ToLower() == "true";
            var from = _config["ENQUIRIES_FROM"] ?? _config["DEMO_FROM"] ?? _config["DemoSmtp:From"] ?? user;
            var to = _config["ENQUIRIES_TO"] ?? _config["DEMO_TO"] ?? _config["DemoSmtp:To"] ?? user;

            if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(to))
            {
                return StatusCode(500, "SMTP not configured. Set ENQUIRIES_SMTP_HOST (or DEMO_SMTP_HOST) and ENQUIRIES_TO (or DEMO_TO) environment variables.");
            }

            int port = 587;
            if (!string.IsNullOrWhiteSpace(portStr) && int.TryParse(portStr, out var p)) port = p;

            var message = new MimeMessage();
            message.From.Add(MailboxAddress.Parse(from));
            message.To.Add(MailboxAddress.Parse(to));
            var prefix = string.IsNullOrWhiteSpace(dto.RequestType) ? "Enquiry request" : dto.RequestType.Trim();
            message.Subject = $"[{prefix}] {dto.FullName} - {dto.Company}";

            var bodyText = $@"Name: {dto.FullName}
Email: {dto.Email}
Phone: {dto.Phone}
Company: {dto.Company}

Message:
{dto.Message}
";

            // Include new fields in email body where present
            bodyText += $@"
Preferred contact method: {dto.PreferredContactMethod}
What they need help with: {dto.HelpTopic}
";

            message.Body = new TextPart("plain") { Text = bodyText };

            // Add Reply-To so replies go to the requesting user's email
            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                try
                {
                    var replyAddr = new MailboxAddress(dto.FullName ?? dto.Email, dto.Email);
                    message.ReplyTo.Add(replyAddr);
                }
                catch
                {
                    // ignore malformed reply-to address; sending will proceed without it
                }
            }

            var (sent, error) = await SendEmailAsync(message);
            if (!sent)
                return StatusCode(500, $"Failed to send email: {error}");

            return Ok(new { message = "Enquiry sent" });
        }

        // POST /api/enquiries/test
        [HttpPost("test")]
        public async Task<IActionResult> Test()
        {
            // Accept either the new or previous header keys for backwards compatibility
            var keyHeader = Request.Headers.ContainsKey("X-ENQUIRIES-TEST-KEY") ? "X-ENQUIRIES-TEST-KEY" : "X-DEMO-TEST-KEY";
            var key = Request.Headers.ContainsKey(keyHeader) ? Request.Headers[keyHeader].ToString() : null;
            var expected = _config["ENQUIRIES_TEST_API_KEY"] ?? _config["DEMO_TEST_API_KEY"];
            if (string.IsNullOrWhiteSpace(expected) || key != expected)
            {
                return Forbid();
            }

            var to = _config["ENQUIRIES_TO"] ?? _config["DEMO_TO"] ?? _config["DemoSmtp:To"] ?? _config["DEMO_SMTP_USER"];
            if (string.IsNullOrWhiteSpace(to))
                return StatusCode(500, "SMTP recipient not configured (ENQUIRIES_TO or DEMO_TO)");

            var message = new MimeMessage();
            var from = _config["ENQUIRIES_FROM"] ?? _config["DEMO_FROM"] ?? _config["DemoSmtp:From"] ?? _config["DEMO_SMTP_USER"];
            message.From.Add(MailboxAddress.Parse(from ?? to));
            message.To.Add(MailboxAddress.Parse(to));
            message.Subject = "[Enquiry request test] Test email from DaisyChained";
            message.Body = new TextPart("plain") { Text = "This is a test email from the DaisyChained production health check." };

            var (sent, error) = await SendEmailAsync(message);
            if (!sent)
                return StatusCode(500, $"Failed to send test email: {error}");

            return Ok(new { message = "Test email sent" });
        }

        private async Task<(bool sent, string error)> SendEmailAsync(MimeMessage message)
        {
            // Read SMTP config from environment or appsettings. Prefer ENQUIRIES_* but fall back to existing DEMO_* keys.
            var host = _config["ENQUIRIES_SMTP_HOST"] ?? _config["DEMO_SMTP_HOST"] ?? _config["DemoSmtp:Host"];
            var portStr = _config["ENQUIRIES_SMTP_PORT"] ?? _config["DEMO_SMTP_PORT"] ?? _config["DemoSmtp:Port"];
            var user = _config["ENQUIRIES_SMTP_USER"] ?? _config["DEMO_SMTP_USER"] ?? _config["DemoSmtp:User"];
            var pass = _config["ENQUIRIES_SMTP_PASS"] ?? _config["DEMO_SMTP_PASS"] ?? _config["DemoSmtp:Pass"];
            var useStartTls = (_config["ENQUIRIES_SMTP_USESTARTTLS"] ?? _config["DEMO_SMTP_USESTARTTLS"] ?? _config["DemoSmtp:UseStartTls"] ?? "true").ToLower() == "true";

            if (string.IsNullOrWhiteSpace(host) || message.To.Count == 0)
            {
                return (false, "SMTP not configured. Set ENQUIRIES_SMTP_HOST (or DEMO_SMTP_HOST) and ENQUIRIES_TO (or DEMO_TO) environment variables.");
            }

            int port = 587;
            if (!string.IsNullOrWhiteSpace(portStr) && int.TryParse(portStr, out var p)) port = p;

            try
            {
                using var client = new SmtpClient();
                if (useStartTls)
                {
                    await client.ConnectAsync(host, port, SecureSocketOptions.StartTlsWhenAvailable);
                }
                else
                {
                    await client.ConnectAsync(host, port, SecureSocketOptions.Auto);
                }

                if (!string.IsNullOrWhiteSpace(user) && !string.IsNullOrWhiteSpace(pass))
                {
                    await client.AuthenticateAsync(user, pass);
                }

                await client.SendAsync(message);
                await client.DisconnectAsync(true);
                return (true, string.Empty);
            }
            catch (Exception ex)
            {
                return (false, ex.Message);
            }
        }
    }
}
