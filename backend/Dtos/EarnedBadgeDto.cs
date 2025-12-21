namespace backend.Dtos
{
    public class EarnedBadgeDto
    {
        public int ModuleId { get; set; }
        public string ModuleTitle { get; set; } = string.Empty;
        public DateTime? CompletedAt { get; set; }

        // relative path for the frontend (e.g., /assets/badges/<slug>.png)
        public string BadgePath { get; set; } = string.Empty;

        public string CategoryName { get; set; } = string.Empty;
        public string CategoryColorHex { get; set; } = "#2E2B29";

        // API route (frontend will append ?origin=window.location.origin)
        public string CertificateDownloadUrl { get; set; } = string.Empty;

        // The package id chosen for this badge (nullable if none)
        public int? PackageId { get; set; }
    }
}

