namespace TODOLIST.Services.Interfaces
{
    public interface IEmailSender
    {
        void Send(string receiverName, string receiverAddress, string subject, string message);
    }
}
