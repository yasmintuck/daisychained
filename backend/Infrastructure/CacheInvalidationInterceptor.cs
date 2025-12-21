using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Caching.Memory;
using backend.Data;
using System.Linq;

namespace backend.Infrastructure;

public class CacheInvalidationInterceptor : SaveChangesInterceptor
{
    private readonly IMemoryCache _cache;
    private readonly CacheKeyStore _keyStore;

    public CacheInvalidationInterceptor(IMemoryCache cache, CacheKeyStore keyStore)
    {
        _cache = cache;
        _keyStore = keyStore;
    }

    public override ValueTask<int> SavedChangesAsync(SaveChangesCompletedEventData eventData, int result, CancellationToken cancellationToken = default)
    {
        // Inspect the saved entries to see if any relevant entity types were modified.
        var ctx = eventData.Context;
        if (ctx != null)
        {
            var changed = ctx.ChangeTracker.Entries()
                .Where(e => e.State == Microsoft.EntityFrameworkCore.EntityState.Added
                            || e.State == Microsoft.EntityFrameworkCore.EntityState.Modified
                            || e.State == Microsoft.EntityFrameworkCore.EntityState.Deleted)
                .Select(e => e.Entity.GetType().Name)
                .ToHashSet();

            // If any Module/Package relation changed, evict known cache keys
            var interesting = new[] { "Module", "Package", "ModulePackage", "OrganisationPackage" };
            if (changed.Overlaps(interesting))
            {
                foreach (var key in _keyStore.GetKeys())
                {
                    _cache.Remove(key);
                }
                _keyStore.Clear();
            }
        }

        return base.SavedChangesAsync(eventData, result, cancellationToken);
    }
}
