namespace backend.Models;

public class ModulePackage
{
    public int ModuleId { get; set; }
    public Module Module { get; set; }

    public int PackageId { get; set; }
    public Package Package { get; set; }
}
