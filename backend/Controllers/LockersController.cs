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
    public class LockersController : ControllerBase
    {
        private readonly GymDbContext _context;

        public LockersController(GymDbContext context)
        {
            _context = context;
        }

        // GET: api/lockers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Locker>>> GetLockers()
        {
            return await _context.Lockers.ToListAsync();
        }

        // GET: api/lockers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Locker>> GetLocker(int id)
        {
            var locker = await _context.Lockers.FindAsync(id);

            if (locker == null)
            {
                return NotFound();
            }

            return locker;
        }

        // POST: api/lockers
        [HttpPost]
        public async Task<ActionResult<Locker>> CreateLocker(Locker locker)
        {
            locker.createdAt = DateTime.UtcNow;
            
            _context.Lockers.Add(locker);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetLocker), new { id = locker.id }, locker);
        }

        // PUT: api/lockers/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLocker(int id, Locker locker)
        {
            if (id != locker.id)
            {
                return BadRequest();
            }

            var existingLocker = await _context.Lockers.FindAsync(id);
            if (existingLocker == null)
            {
                return NotFound();
            }

            // Preserve the original createdAt date
            locker.createdAt = existingLocker.createdAt;

            _context.Entry(existingLocker).CurrentValues.SetValues(locker);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await LockerExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/lockers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLocker(int id)
        {
            var locker = await _context.Lockers.FindAsync(id);
            if (locker == null)
            {
                return NotFound();
            }

            _context.Lockers.Remove(locker);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<bool> LockerExists(int id)
        {
            return await _context.Lockers.AnyAsync(e => e.id == id);
        }
    }
}
