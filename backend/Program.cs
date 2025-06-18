using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "DaisyChained API",
        Version = "v1",
        Description = "API for DaisyChained platform",
    });
});

var app = builder.Build();

// ✅ ENABLE Swagger in all environments (not just development)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "DaisyChained API v1");
    c.RoutePrefix = "swagger"; // This ensures it's available at /swagger
});

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
