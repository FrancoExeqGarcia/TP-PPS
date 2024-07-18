using Moq;
using TODOLIST.Exceptions;
using TODOLIST.Repositories.Interfaces;
using TODOLIST.Services.Implementations;
using TODOLIST.Services.Interfaces;
using TODOLIST.Data.Models.Project;
using TODOLIST.Data.Entities;


namespace Tests
{
    public class ProjectServiceTests
    {
        private readonly Mock<IProjectRepository> _repositoryMock;
        private readonly IProjectService _projectService;

        public ProjectServiceTests()
        {
            _repositoryMock = new Mock<IProjectRepository>();
            _projectService = new ProjectService(_repositoryMock.Object);
        }
        [Theory]
        [InlineData(1)] // Datos que causarán que la prueba falle
        public void AlwaysFailGetAll(int expectedCount)
        {
            // Arrange
            var projects = GetTestProjects();
            _repositoryMock.Setup(repo => repo.GetAll()).Returns(projects);

            // Act
            var result = _projectService.GetAll();

            // Assert
            Assert.Equal(expectedCount, result.Count); // Esto fallará porque el valor esperado es incorrecto
   
        }

        [Fact]
        public void GetAllTest()
        {
            // Arrange
            var projects = GetTestProjects();
            _repositoryMock.Setup(repo => repo.GetAll()).Returns(projects);

            // Act
            var result = _projectService.GetAll();

            // Assert
            Assert.Equal(2, result.Count);
        }

        [Fact]
        public void GetByIdTest()
        {
            // Arrange
            var project = GetTestProject();
            _repositoryMock.Setup(repo => repo.GetById(1)).Returns(project);

            // Act
            var result = _projectService.GetById(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Project 1", result.Name);
        }

        [Fact]
        public void GetByIdNotExistTest()
        {
            // Arrange
            _repositoryMock.Setup(repo => repo.GetById(1)).Returns((Project)null);

            // Act & Assert
            Assert.Throws<NotFoundException>(() => _projectService.GetById(1));
        }

        [Fact]
        public void CreateProjectTest()
        {
            // Arrange
            var createRequest = new CreateProjectRequest
            {
                Name = "New Project",
                Description = "Description",
                StartDate = DateTime.Now,
                EndDate = DateTime.Now.AddMonths(1),
                CollaboratorIds = new List<int> { 1, 2 }
            };

            var createdProject = new Project
            {
                Id = 1,
                Name = "New Project",
                Description = "Description",
                StartDate = createRequest.StartDate,
                EndDate = createRequest.EndDate,
                CreatedByUserId = 1,
                State = true,
                Collaborators = new List<User>()
            };

            _repositoryMock.Setup(repo => repo.Create(It.IsAny<Project>())).Returns(createdProject);

            // Act
            var result = _projectService.Create(createRequest);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("New Project", result.Name);
        }

        [Fact]
        public void UpdateProjectTest()
        {
            // Arrange
            var existingProject = GetTestProject();
            _repositoryMock.Setup(repo => repo.GetById(1)).Returns(existingProject);

            var updateRequest = new UpdateProjectRequest
            {
                Name = "Updated Project",
                Description = "Updated Description",
                StartDate = DateTime.Now,
                EndDate = DateTime.Now.AddMonths(2)
            };

            existingProject.Name = updateRequest.Name;
            existingProject.Description = updateRequest.Description;
            existingProject.StartDate = updateRequest.StartDate;
            existingProject.EndDate = updateRequest.EndDate;

            _repositoryMock.Setup(repo => repo.Update(1, existingProject)).Returns(existingProject);

            // Act
            var result = _projectService.Update(1, updateRequest);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Updated Project", result.Name);
        }

        [Fact]
        public void DeleteProyectTest()
        {
            // Arrange
            _repositoryMock.Setup(repo => repo.Delete(1));

            // Act
            _projectService.Delete(1);

            // Assert
            _repositoryMock.Verify(repo => repo.Delete(1), Times.Once);
        }

        // Métodos auxiliares para crear datos de prueba
        private List<Project> GetTestProjects()
        {
            return new List<Project>
            {
                new Project { Id = 1, Name = "Project 1", Description = "Description 1", StartDate = DateTime.Now, EndDate = DateTime.Now.AddMonths(1), CreatedByUserId = 1, State = true, Collaborators = new List<User>() },
                new Project { Id = 2, Name = "Project 2", Description = "Description 2", StartDate = DateTime.Now, EndDate = DateTime.Now.AddMonths(2), CreatedByUserId = 2, State = true, Collaborators = new List<User>() }
            };
        }

        private Project GetTestProject()
        {
            return new Project
            {
                Id = 1,
                Name = "Project 1",
                Description = "Description 1",
                StartDate = DateTime.Now,
                EndDate = DateTime.Now.AddMonths(1),
                CreatedByUserId = 1,
                State = true,
                Collaborators = new List<User>()
            };
        }
    }
}
