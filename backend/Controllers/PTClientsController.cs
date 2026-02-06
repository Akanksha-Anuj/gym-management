using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PTClientsController : ControllerBase
    {
        private readonly GymDbContext _context;

        public PTClientsController(GymDbContext context)
        {
            _context = context;
        }

        // GET: api/ptclients
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PTClient>>> GetPTClients()
        {
            return await _context.PTClients
                .OrderByDescending(c => c.ptStartDate)
                .ToListAsync();
        }

        // GET: api/ptclients/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PTClient>> GetPTClient(int id)
        {
            var ptClient = await _context.PTClients.FindAsync(id);

            if (ptClient == null)
            {
                return NotFound();
            }

            return ptClient;
        }

        // POST: api/ptclients
        [HttpPost]
        public async Task<ActionResult<PTClient>> CreatePTClient(PTClient ptClient)
        {
            _context.PTClients.Add(ptClient);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPTClient), new { id = ptClient.id }, ptClient);
        }

        // PUT: api/ptclients/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePTClient(int id, PTClient ptClient)
        {
            if (id != ptClient.id)
            {
                return BadRequest();
            }

            _context.Entry(ptClient).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await PTClientExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/ptclients/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePTClient(int id)
        {
            var ptClient = await _context.PTClients.FindAsync(id);
            if (ptClient == null)
            {
                return NotFound();
            }

            _context.PTClients.Remove(ptClient);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<bool> PTClientExists(int id)
        {
            return await _context.PTClients.AnyAsync(e => e.id == id);
        }
    }
}
