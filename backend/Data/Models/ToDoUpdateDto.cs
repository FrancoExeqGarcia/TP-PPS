namespace TODOLIST.Data.Models
{
    public class ToDoUpdateDto
    {
        public string Name { get; set; }  = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsCompleted { get; set; } = false;

    }
}
