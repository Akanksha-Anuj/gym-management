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
    public class VisitorsController : ControllerBase
    {
        private readonly GymDbContext _context;

        public VisitorsController(GymDbContext context)
        {
            _context = context;
        }

        // GET: api/visitors
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Visitor>>> GetVisitors()
        {
            return await _context.Visitors.OrderByDescending(v => v.visitedDate).ToListAsync();
        }

        // GET: api/visitors/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Visitor>> GetVisitor(int id)
        {
            var visitor = await _context.Visitors.FindAsync(id);

            if (visitor == null)
            {
                return NotFound();
            }

            return visitor;
        }

        // POST: api/visitors
        [HttpPost]
        public async Task<ActionResult<Visitor>> CreateVisitor(Visitor visitor)
        {
            visitor.visitedDate = DateTime.Now;
            _context.Visitors.Add(visitor);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetVisitor), new { id = visitor.id }, visitor);
        }

        // PUT: api/visitors/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVisitor(int id, Visitor visitor)
        {
            if (id != visitor.id)
            {
                return BadRequest();
            }

            _context.Entry(visitor).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await VisitorExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/visitors/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVisitor(int id)
        {
            var visitor = await _context.Visitors.FindAsync(id);
            if (visitor == null)
            {
                return NotFound();
            }

            _context.Visitors.Remove(visitor);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/visitors/statistics/yearly?year=2026
        [HttpGet("statistics/yearly")]
        public async Task<ActionResult<object>> GetYearlyStatistics([FromQuery] int year)
        {
            var monthlyStats = new List<object>();

            for (int month = 1; month <= 12; month++)
            {
                var startDate = new DateTime(year, month, 1);
                var endDate = startDate.AddMonths(1);

                var totalInquiries = await _context.Visitors
                    .Where(v => v.visitedDate >= startDate && v.visitedDate < endDate)
                    .CountAsync();

                var converted = await _context.Visitors
                    .Where(v => v.visitedDate >= startDate && v.visitedDate < endDate && v.joined)
                    .CountAsync();

                monthlyStats.Add(new
                {
                    month,
                    totalInquiries,
                    converted
                });
            }

            return Ok(monthlyStats);
        }

        private async Task<bool> VisitorExists(int id)
        {
            return await _context.Visitors.AnyAsync(e => e.id == id);
        }
    }
}
