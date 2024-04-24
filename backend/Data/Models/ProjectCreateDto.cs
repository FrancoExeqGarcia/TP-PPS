namespace TODOLIST.Data.Models
{
    public class ProjectCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Description { get; set; } = string.Empty;
        public int UserID { get; set; }
    }
}
