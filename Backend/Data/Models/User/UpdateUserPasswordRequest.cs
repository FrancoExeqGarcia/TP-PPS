namespace TODOLIST.Data.Models.User
{
    public class UpdateUserPasswordRequest
    {
        public int Id { get; set; }
        public string NewPassword { get; set; }
    }
   
}
