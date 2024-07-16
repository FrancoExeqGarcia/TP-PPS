namespace TODOLIST.Data.Models.User
{
    public class VerifyPasswordRequest
    {
        public int UserId { get; set; }
        public string Password { get; set; }
    }
}
