using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public class EnquiryRequestDto
    {
        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Company { get; set; } = string.Empty;

        public string JobTitle { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;

        // Make these optional so different forms (e.g. custom content) can omit them.
        public string PreferredContactMethod { get; set; } = string.Empty;

        public string HelpTopic { get; set; } = string.Empty;
        // Optional request type used by the backend to adjust email subject (e.g. "Custom content request")
        public string RequestType { get; set; } = string.Empty;
    }
}
