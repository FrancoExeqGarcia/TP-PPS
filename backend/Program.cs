using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using TODOLIST.Data;
using TODOLIST.Services.Interfaces;
using TODOLIST.Services.Implementations;
using TODOLIST.DBContext;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(setupAction =>
{
    setupAction.AddSecurityDefinition("TaskMangerApiBearerAuth", new OpenApiSecurityScheme() //Esto va a permitir usar swagger con el token.
    {
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        Description = "Ac� pegar el token generado al loguearse."
    });

    setupAction.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "TaskMangerApiBearerAuth" } //Tiene que coincidir con el id seteado arriba en la definici�n
                }, new List<string>() }
    });
});

builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IToDoService, TodoService>();
builder.Services.AddScoped<IUserService, UserService>();

builder.Services.AddAuthentication("Bearer") //"Bearer" es el tipo de auntenticaci�n que tenemos que elegir despu�s en PostMan para pasarle el token
    .AddJwtBearer(options => //Ac� definimos la configuraci�n de la autenticaci�n. le decimos qu� cosas queremos comprobar. La fecha de expiraci�n se valida por defecto.
    {
        options.TokenValidationParameters = new()
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Authentication:Issuer"],
            ValidAudience = builder.Configuration["Authentication:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(builder.Configuration["Authentication:SecretForKey"]))
        };
    }
);

// Configure DbContext with SQL Server connection string
builder.Services.AddDbContext<ToDoContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// Configure Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "TODOLIST API", Version = "v1" });
});

builder.Services.AddCors(options => {
    options.AddPolicy("CorsPolicy" , 
    builder => builder.WithOrigins("https://localhost:3000")
    .AllowAnyMethod()
    .AllowAnyHeader()
    );
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "TODOLIST API V1");
    });
}

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.UseCors("AllowLocalhost3000");

app.MapControllers();

app.Run();
