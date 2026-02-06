using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // This protects ALL endpoints in this controller
    public class MembersController : ControllerBase
    {
        private readonly GymDbContext _context;

        public MembersController(GymDbContext context)
        {
            _context = context;
        }

        // GET: api/members
        [HttpGet]
        public async Task<ActionResult<IEnumerable<members>>> GetMembers()
        {
            return await _context.Members.ToListAsync();
        }

        // GET: api/members/5
        [HttpGet("{id}")]
        public async Task<ActionResult<members>> GetMember(int id)
        {
            var member = await _context.Members.FindAsync(id);

            if (member == null)
            {
                return NotFound();
            }

            return member;
        }

        // POST: api/members
        [HttpPost]
        public async Task<ActionResult<members>> CreateMember(members member)
        {
            _context.Members.Add(member);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMember), new { id = member.id }, member);
        }

        // PUT: api/members/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMember(int id, members member)
        {
            if (id != member.id)
            {
                return BadRequest();
            }

            _context.Entry(member).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await MemberExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/members/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMember(int id)
        {
            var member = await _context.Members.FindAsync(id);
            if (member == null)
            {
                return NotFound();
            }

            _context.Members.Remove(member);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<bool> MemberExists(int id)
        {
            return await _context.Members.AnyAsync(e => e.id == id);
        }
    }
}
