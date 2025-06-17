# Use the official .NET 6 SDK image
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /app

# Copy everything and build
COPY . ./
RUN dotnet restore
RUN dotnet build -c Release -o out

# Run app
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS runtime
WORKDIR /app
COPY --from=build /app/out ./
ENTRYPOINT ["dotnet", "backend.dll"]