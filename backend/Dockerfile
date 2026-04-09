# Use the official .NET SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
WORKDIR /app

# Copy csproj and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy everything else and build
COPY . ./
RUN dotnet publish -c Release -o out

# Use the runtime image for the final stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Copy the build output
COPY --from=build-env /app/out .

# Disable file watching to prevent inotify issues
ENV DOTNET_USE_POLLING_FILE_WATCHER=false
ENV DOTNET_HOSTBUILDER__RELOADCONFIGONCHANGE=false

# Expose the port (Render will use $PORT env var)
EXPOSE 8080

# Run the application
ENTRYPOINT ["dotnet", "backend.dll"]