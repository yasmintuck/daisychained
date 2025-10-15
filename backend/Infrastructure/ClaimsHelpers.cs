// backend/Infrastructure/ClaimsHelpers.cs
using System.Security.Claims;

namespace backend.Infrastructure;

public static class ClaimsHelpers
{
    private const string Ns = "https://daisychained.co.uk/claims";

    public static string? GetEmail(ClaimsPrincipal user) =>
        user.FindFirst($"{Ns}/email")?.Value
        ?? user.FindFirst("email")?.Value
        ?? user.FindFirst(ClaimTypes.Email)?.Value;

    public static string? GetDisplayName(ClaimsPrincipal user) =>
        user.FindFirst($"{Ns}/name")?.Value
        ?? user.FindFirst("name")?.Value;

    public static string GetSub(ClaimsPrincipal user) =>
        user.FindFirst("sub")?.Value
        ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value
        ?? throw new UnauthorizedAccessException("No subject in token");
}
