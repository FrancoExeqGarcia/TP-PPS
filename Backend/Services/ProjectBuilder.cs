using TODOLIST.Data.Entities;

namespace TODOLIST.Services
{
    public class ProjectBuilder
    {
        private string _name = string.Empty;
        private string _description = string.Empty;
        private DateTime _startDate;
        private DateTime _endDate;
        private List<int> _collaboratorIds = [];
        private List<ToDo> _toDos = [];

        private ProjectBuilder() { }

        public static ProjectBuilder Init()
        {
            return new ProjectBuilder();
        }

        public ProjectBuilder WithName(string name)
        {
            _name = name;
            return this;
        }

        public ProjectBuilder WithDescripcion(string description)
        {
            _description = description;
            return this;
        }

        public ProjectBuilder WithStartDate(DateTime startDate)
        {
            _startDate = startDate;
            return this;
        }

        public ProjectBuilder WithEndDate(DateTime endDate)
        {
            _endDate = endDate;
            return this;
        }

        public ProjectBuilder AddCollaborators(List<int> collaboratorIds)
        {
            _collaboratorIds.AddRange(collaboratorIds);
            return this;
        }

        public ProjectBuilder WithToDos(List<ToDo> toDos)
        {
            _toDos.AddRange(toDos);
            return this;
        }

        public Project Build()
            => new()
            {
                Name = _name,
                Description = _description,
                StartDate = _startDate,
                EndDate = _endDate,
                Collaborators = _collaboratorIds.Select(id => new User { Id = id }).ToList(),
                ToDos = _toDos
            };
    }
}
