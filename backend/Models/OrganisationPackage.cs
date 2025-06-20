namespace backend.Models;

public class OrganisationPackage
{
    public int OrganisationId { get; set; }
    public Organisation Organisation { get; set; }

    public int PackageId { get; set; }
    public Package Package { get; set; }
}
