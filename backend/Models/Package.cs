namespace backend.Models;

public class Package
{
    public int PackageId { get; set; }
    public string PackageName { get; set; }
    public string PackageDescription { get; set; }
    public string? ColorHex { get; set; }

    public ICollection<ModulePackage> ModulePackages { get; set; } = new List<ModulePackage>();
    public ICollection<OrganisationPackage> OrganisationPackages { get; set; } = new List<OrganisationPackage>();
}