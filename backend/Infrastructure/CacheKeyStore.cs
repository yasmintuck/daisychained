using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Infrastructure;

public class CacheKeyStore
{
    private const string StoreKey = "__daisy_cache_keys";
    private readonly IMemoryCache _cache;

    public CacheKeyStore(IMemoryCache cache)
    {
        _cache = cache;
    }

    public void AddKey(string key)
    {
        var set = _cache.GetOrCreate(StoreKey, entry => new HashSet<string>())!;
        lock (set)
        {
            set.Add(key);
        }
        // persist the set
        _cache.Set(StoreKey, set);
    }

    public IEnumerable<string> GetKeys()
    {
        if (_cache.TryGetValue(StoreKey, out HashSet<string>? set) && set != null)
        {
            lock (set)
            {
                return set.ToList();
            }
        }
        return Enumerable.Empty<string>();
    }

    public void Clear()
    {
        _cache.Remove(StoreKey);
    }
}
