namespace TODOLIST.Data.Models
{
    public class ToDoCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int ProjectID { get; set; }

    }
}
