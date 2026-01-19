using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public class DemoRequestDto
    {
        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Company { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;
    }
}
