namespace TODOLIST.Exceptions
{
    public class ForbiddenActionException : Exception
    {
        public ForbiddenActionException(string message) : base(message) { }
    }
}
