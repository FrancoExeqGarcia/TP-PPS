using Moq;
using System.Collections.Generic;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TODOLIST.Controllers;
using TODOLIST.Services;
using Xunit;
using TODOLIST.Services.Interfaces;
using TODOLIST.Data.Entities;

namespace ProjectServicesShould
{
    public class UnitTest1
    {
        public class ProjectControllerTests
        {
            [Fact]
            public void ReturnsProjectById()
            {
                // Arrange
                var mockService = new Mock<IProjectService>();
                mockService.Setup(service => service.GetProjectById(1))
                           .Returns(GetTestProject());

                var controller = new ProjectController(mockService.Object);

                // Act
                var result = controller.GetProject(1) as ActionResult<Project>;

                // Assert
                var okResult = Assert.IsType<OkObjectResult>(result.Result);
                var project = Assert.IsType<Project>(okResult.Value);
                Assert.Equal(1, project.ProjectId);
            }

            private Project GetTestProject()
            {
                return new Project { ProjectId = 1, Name = "Project 1" };
            }

        }
    }
}