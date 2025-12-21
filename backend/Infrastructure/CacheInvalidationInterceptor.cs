using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Caching.Memory;
using backend.Data;
using System.Linq;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using System.Collections.Generic;

namespace backend.Infrastructure;

public class CacheInvalidationInterceptor : SaveChangesInterceptor
{
    private readonly IMemoryCache _cache;
    private readonly CacheKeyStore _keyStore;
    private readonly ILogger<CacheInvalidationInterceptor> _logger;

    public CacheInvalidationInterceptor(IMemoryCache cache, CacheKeyStore keyStore, ILogger<CacheInvalidationInterceptor> logger)
    {
        _cache = cache;
        _keyStore = keyStore;
        _logger = logger;
    }

    public override async ValueTask<int> SavedChangesAsync(SaveChangesCompletedEventData eventData, int result, CancellationToken cancellationToken = default)
    {
        var ctx = eventData.Context;
        if (ctx != null)
        {
            // Collect organisation ids affected by the saved changes, where possible
            var orgIds = new HashSet<int>();

            foreach (var entry in ctx.ChangeTracker.Entries()
                .Where(e => e.State == Microsoft.EntityFrameworkCore.EntityState.Added
                            || e.State == Microsoft.EntityFrameworkCore.EntityState.Modified
                            || e.State == Microsoft.EntityFrameworkCore.EntityState.Deleted))
            {
                switch (entry.Entity)
                {
                    case OrganisationPackage op:
                        orgIds.Add(op.OrganisationId);
                        break;
                    case ModulePackage mp:
                        // find organisations that reference this package
                        var packageId = mp.PackageId;
                        try
                        {
                            var orgsForPackage = await ctx.Set<OrganisationPackage>()
                                .AsNoTracking()
                                .Where(x => x.PackageId == packageId)
                                .Select(x => x.OrganisationId)
                                .ToListAsync(cancellationToken);
                            foreach (var id in orgsForPackage) orgIds.Add(id);
                        }
                        catch
                        {
                            // ignore lookup failures
                        }
                        break;
                    case Package p:
                        try
                        {
                            var orgs = await ctx.Set<OrganisationPackage>()
                                .AsNoTracking()
                                .Where(x => x.PackageId == p.PackageId)
                                .Select(x => x.OrganisationId)
                                .ToListAsync(cancellationToken);
                            foreach (var id in orgs) orgIds.Add(id);
                        }
                        catch
                        {
                        }
                        break;
                    case Module m:
                        try
                        {
                            var packageIds = await ctx.Set<ModulePackage>()
                                .AsNoTracking()
                                .Where(x => x.ModuleId == m.ModuleId)
                                .Select(x => x.PackageId)
                                .ToListAsync(cancellationToken);
                            if (packageIds.Any())
                            {
                                var orgs = await ctx.Set<OrganisationPackage>()
                                    .AsNoTracking()
                                    .Where(x => packageIds.Contains(x.PackageId))
                                    .Select(x => x.OrganisationId)
                                    .ToListAsync(cancellationToken);
                                foreach (var id in orgs) orgIds.Add(id);
                            }
                        }
                        catch
                        {
                        }
                        break;
                    default:
                        // other entities ignored
                        break;
                }
            }

            if (orgIds.Count > 0)
            {
                foreach (var orgId in orgIds)
                {
                    var keys = _keyStore.GetKeysForOrg(orgId);
                    foreach (var key in keys)
                    {
                        _cache.Remove(key);
                        _logger.LogInformation("Cache invalidated key {Key} for org {OrgId}", key, orgId);
                    }
                    _keyStore.ClearOrg(orgId);
                }
            }
            else
            {
                // Couldn't determine affected orgs; be conservative and avoid mass eviction in-process.
                _logger.LogInformation("CacheInvalidationInterceptor detected relevant changes but could not determine affected organisations; no in-process evictions performed.");
            }
        }

        return await base.SavedChangesAsync(eventData, result, cancellationToken);
    }
}
