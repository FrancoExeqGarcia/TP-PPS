namespace TODOLIST.Repositories.Interfaces
{
    public interface ICRUDRepository<T>
    where T : class
    {
        List<T> GetAll();
        T? GetById(int id);
        T Create(T entity);
        T Update(int id, T entity);
        void Delete(int id);
    }
}
