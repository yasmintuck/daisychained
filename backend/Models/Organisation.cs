namespace backend.Models;

public class Organisation
{
    public int OrganisationId { get; set; }
    public string OrganisationName { get; set; }
    public string Domain { get; set; }

    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<OrganisationPackage> OrganisationPackages { get; set; } = new List<OrganisationPackage>();
}