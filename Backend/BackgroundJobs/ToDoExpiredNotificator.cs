using Quartz;
using TODOLIST.Repositories.Interfaces;
using TODOLIST.Services.Interfaces;


namespace TODOLIST.BackgroundJobs
{
    public class ToDoExpiredNotificator : IJob
    {
        private readonly IToDoRepository _todoRepository;
        private readonly IEmailSender _emailSender;

        public ToDoExpiredNotificator(IToDoRepository todoRepository, IEmailSender emailSender)
        {
            _todoRepository = todoRepository ?? throw new ArgumentNullException(nameof(todoRepository));
            _emailSender = emailSender ?? throw new ArgumentNullException(nameof(emailSender));
        }

        public Task Execute(IJobExecutionContext context)
        {
            var expiredToDos = _todoRepository.GetExpired();

            foreach (var user in expiredToDos.Select(e => e.AssignedUser).Distinct())
            {
                if (user != null)
                {
                    _emailSender.Send(user.Name, user.Email, "You have expired ToDos", "You have expired ToDos that are not yet completed, please update your dashboard.");
                }
            }

            return Task.CompletedTask;
        }

    }
}
