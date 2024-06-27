using Castle.Components.DictionaryAdapter;
using TODOLIST.Data.Entities;
using TODOLIST.DBContext;
using TODOLIST.Exceptions;
using TODOLIST.Repositories.Interfaces;
using TODOLIST.Services.Interfaces;
using static TODOLIST.Repositories.Interfaces.ICRUDRepository;

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

            _dbContext.SaveChanges();
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
