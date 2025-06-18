using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "DaisyChained API", Version = "v1" });
});

var app = builder.Build();

// Enable Swagger UI even in production (optional)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "DaisyChained API v1");
});

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers(); // <- This is what maps [Route] controllers

app.Run();
