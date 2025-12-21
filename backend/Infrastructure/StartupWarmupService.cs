using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using backend.Data;

namespace backend.Infrastructure
{
    /// <summary>
    /// Small startup warm-up service to execute a lightweight read against the DB
    /// so EF Core compiles its model and the first DB connection is opened while
    /// the app is starting. Keeps the operation read-only and forgiving of errors.
    /// </summary>
    public class StartupWarmupService : IHostedService
    {
        private readonly IServiceProvider _services;
        private readonly ILogger<StartupWarmupService> _logger;

        public StartupWarmupService(IServiceProvider services, ILogger<StartupWarmupService> logger)
        {
            _services = services ?? throw new ArgumentNullException(nameof(services));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("StartupWarmupService: beginning warm-up (EF model + DB connection)");

            try
            {
                using var scope = _services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                // Lightweight read to force EF model build and open a connection.
                // Use AsNoTracking and limit results.
                await db.Modules.AsNoTracking().Select(m => m.ModuleId).Take(1).ToListAsync(cancellationToken);

                _logger.LogInformation("StartupWarmupService: warm-up completed successfully");
            }
            catch (OperationCanceledException)
            {
                _logger.LogWarning("StartupWarmupService: warm-up cancelled");
            }
            catch (Exception ex)
            {
                // Don't fail startup if warm-up fails; just log the issue.
                _logger.LogWarning(ex, "StartupWarmupService: warm-up encountered an error (ignoring)");
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            // Nothing to do on stop.
            return Task.CompletedTask;
        }
    }
}
