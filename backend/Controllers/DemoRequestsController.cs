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
    public class DemoRequestsController : ControllerBase
    {
        private readonly IConfiguration _config;

        public DemoRequestsController(IConfiguration config)
        {
            _config = config;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] DemoRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Read SMTP config from environment or appsettings
            var host = _config["DEMO_SMTP_HOST"] ?? _config["DemoSmtp:Host"];
            var portStr = _config["DEMO_SMTP_PORT"] ?? _config["DemoSmtp:Port"];
            var user = _config["DEMO_SMTP_USER"] ?? _config["DemoSmtp:User"];
            var pass = _config["DEMO_SMTP_PASS"] ?? _config["DemoSmtp:Pass"];
            var useStartTls = (_config["DEMO_SMTP_USESTARTTLS"] ?? _config["DemoSmtp:UseStartTls"] ?? "true").ToLower() == "true";
            var from = _config["DEMO_FROM"] ?? _config["DemoSmtp:From"] ?? user;
            var to = _config["DEMO_TO"] ?? _config["DemoSmtp:To"] ?? user;

            if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(to))
            {
                return StatusCode(500, "SMTP not configured. Set DEMO_SMTP_HOST and DEMO_TO environment variables.");
            }

            int port = 587;
            if (!string.IsNullOrWhiteSpace(portStr) && int.TryParse(portStr, out var p)) port = p;

            var message = new MimeMessage();
            message.From.Add(MailboxAddress.Parse(from));
            message.To.Add(MailboxAddress.Parse(to));
            message.Subject = $"[Demo request] {dto.FullName} - {dto.Company}";

            var bodyText = $@"Name: {dto.FullName}
Email: {dto.Email}
Phone: {dto.Phone}
Company: {dto.Company}

Message:
{dto.Message}
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

            return Ok(new { message = "Demo request sent" });
        }

        // POST /api/demo/test
        // Protected by a simple header key `X-DEMO-TEST-KEY` which must match `DEMO_TEST_API_KEY` env var.
        [HttpPost("test")]
        public async Task<IActionResult> Test()
        {
            var key = Request.Headers.ContainsKey("X-DEMO-TEST-KEY") ? Request.Headers["X-DEMO-TEST-KEY"].ToString() : null;
            var expected = _config["DEMO_TEST_API_KEY"];
            if (string.IsNullOrWhiteSpace(expected) || key != expected)
            {
                return Forbid();
            }

            var to = _config["DEMO_TO"] ?? _config["DemoSmtp:To"] ?? _config["DEMO_SMTP_USER"];
            if (string.IsNullOrWhiteSpace(to))
                return StatusCode(500, "SMTP recipient not configured (DEMO_TO)");

            var message = new MimeMessage();
            var from = _config["DEMO_FROM"] ?? _config["DemoSmtp:From"] ?? _config["DEMO_SMTP_USER"];
            message.From.Add(MailboxAddress.Parse(from ?? to));
            message.To.Add(MailboxAddress.Parse(to));
            message.Subject = "[Demo request test] Test email from DaisyChained";
            message.Body = new TextPart("plain") { Text = "This is a test email from the DaisyChained production health check." };

            var (sent, error) = await SendEmailAsync(message);
            if (!sent)
                return StatusCode(500, $"Failed to send test email: {error}");

            return Ok(new { message = "Test email sent" });
        }

        private async Task<(bool sent, string error)> SendEmailAsync(MimeMessage message)
        {
            // Read SMTP config from environment or appsettings
            var host = _config["DEMO_SMTP_HOST"] ?? _config["DemoSmtp:Host"];
            var portStr = _config["DEMO_SMTP_PORT"] ?? _config["DemoSmtp:Port"];
            var user = _config["DEMO_SMTP_USER"] ?? _config["DemoSmtp:User"];
            var pass = _config["DEMO_SMTP_PASS"] ?? _config["DemoSmtp:Pass"];
            var useStartTls = (_config["DEMO_SMTP_USESTARTTLS"] ?? _config["DemoSmtp:UseStartTls"] ?? "true").ToLower() == "true";

            if (string.IsNullOrWhiteSpace(host) || message.To.Count == 0)
            {
                return (false, "SMTP not configured. Set DEMO_SMTP_HOST and DEMO_TO environment variables.");
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
