using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TODOLIST.Data.Entities;
using TODOLIST.DBContext;
using TODOLIST.Exceptions;
using TODOLIST.Repositories.Interfaces;
using TODOLIST.Services.Interfaces;

namespace TODOLIST.Repositories.Implementations
{
    public class CRUDRepository<T> : ICRUDRepository<T> where T : BaseEntity
    {
        protected readonly ToDoContext _dbContext;

        public CRUDRepository(ToDoContext dbContext)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        }

        public virtual T Create(T entity)
        {
            var result = _dbContext.Add(entity);

            _dbContext.SaveChanges();

            return result.Entity;
        }

        public virtual void Delete(int id)
        {
            var found = _dbContext.Set<T>().SingleOrDefault(e => e.Id == id);

            if (found == null)
                throw new NotFoundException("Entidad no encontrada");

            _dbContext.Set<T>().Remove(found);

            try
            {
                _dbContext.SaveChanges();
            }
            catch (DbUpdateException ex)
            {
                // Aquí puedes verificar la excepción para asegurarte de que es por una referencia
                if (ex.InnerException is SqlException sqlEx && sqlEx.Number == 547) // Código de error de violación de referencia
                {
                    throw new InvalidOperationException("No se puede eliminar el proyecto porque tiene tareas asociadas.", ex);
                }
                throw; // Re-lanzar si es otra excepción
            }
        }

        public virtual List<T> GetAll()
            => _dbContext.Set<T>().ToList();

        public virtual T? GetById(int id)
            => _dbContext.Set<T>().SingleOrDefault(e => e.Id == id);

        public virtual T Update(int id, T entity)
        {
            _dbContext.Set<T>().Update(entity);

            _dbContext.SaveChanges();

            return entity;
        }
    }
}
