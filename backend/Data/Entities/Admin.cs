using System.Collections;
using System.ComponentModel.DataAnnotations;

namespace TODOLIST.Data.Entities
{
    public class Admin : User
    {
        public List<Project>? Projects { get; set; }
    }
}
