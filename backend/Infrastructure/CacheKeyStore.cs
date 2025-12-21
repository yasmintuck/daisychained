using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Infrastructure;

/// <summary>
/// Tracks cache keys grouped by organisation so we can evict only affected org keys.
/// Uses IMemoryCache as a backing store (in-process). For distributed caches you would
/// implement a Redis-backed set instead.
/// </summary>
public class CacheKeyStore
{
    // Per-org set prefix stored in IMemoryCache
    private const string OrgKeysPrefix = "__daisy_org_keys_";
    private readonly IMemoryCache _cache;

    public CacheKeyStore(IMemoryCache cache)
    {
        _cache = cache;
    }

    // Record a key for an organisation
    public void AddKeyForOrg(string key, int organisationId)
    {
        var storeKey = OrgKeysPrefix + organisationId;
        var set = _cache.GetOrCreate(storeKey, entry => new HashSet<string>())!;
        lock (set)
        {
            set.Add(key);
        }
        _cache.Set(storeKey, set);
    }

    // Retrieve keys for an organisation
    public IEnumerable<string> GetKeysForOrg(int organisationId)
    {
        var storeKey = OrgKeysPrefix + organisationId;
        if (_cache.TryGetValue(storeKey, out HashSet<string>? set) && set != null)
        {
            lock (set)
            {
                return set.ToList();
            }
        }
        return Enumerable.Empty<string>();
    }

    // Clear keys for an organisation
    public void ClearOrg(int organisationId)
    {
        var storeKey = OrgKeysPrefix + organisationId;
        _cache.Remove(storeKey);
    }

    // For compatibility / admin: clear all recorded org key sets (expensive)
    public void ClearAll()
    {
        // IMemoryCache doesn't provide enumeration; this is a noop for now.
        // If needed, maintain a global registry of org ids separately.
    }
}
