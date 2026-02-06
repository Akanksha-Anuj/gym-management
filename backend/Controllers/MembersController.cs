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
            var membersList = await _context.Members.ToListAsync();
            
            // Fix any members with default memberSince date (from migration)
            bool hasChanges = false;
            foreach (var member in membersList)
            {
                if (member.memberSince.Year == 1)
                {
                    member.memberSince = member.subscriptionStartDate;
                    hasChanges = true;
                }
            }
            
            if (hasChanges)
            {
                await _context.SaveChangesAsync();
            }
            
            return membersList;
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
            // Set memberSince to current subscription start date for new members
            member.memberSince = member.subscriptionStartDate;
            
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

            // Get the existing member to preserve memberSince
            var existingMember = await _context.Members.FindAsync(id);
            if (existingMember == null)
            {
                return NotFound();
            }

            // Preserve the original memberSince date
            member.memberSince = existingMember.memberSince;

            _context.Entry(existingMember).CurrentValues.SetValues(member);

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

        // GET: api/members/statistics/monthly
        [HttpGet("statistics/monthly")]
        public async Task<ActionResult<object>> GetMonthlyStatistics([FromQuery] int year, [FromQuery] int month)
        {
            var members = await _context.Members.ToListAsync();

            // Total members
            var totalMembers = members.Count;

            // Filter for new admissions (memberSince in the specified month AND subscriptionStartDate is the same)
            var newAdmissions = members
                .Where(m => m.memberSince.Year == year 
                         && m.memberSince.Month == month 
                         && m.subscriptionStartDate.Year == year 
                         && m.subscriptionStartDate.Month == month)
                .Count();

            // Filter for renewals ONLY (subscriptionStartDate in the month but memberSince is different/earlier)
            var renewals = members
                .Where(m => m.subscriptionStartDate.Year == year 
                         && m.subscriptionStartDate.Month == month
                         && !(m.memberSince.Year == year && m.memberSince.Month == month))
                .Count();

            // Memberships expiring this month
            var expiringThisMonth = members
                .Where(m => m.subscriptionExpiryDate.Year == year && m.subscriptionExpiryDate.Month == month)
                .Count();

            return Ok(new
            {
                year,
                month,
                totalMembers,
                newAdmissions,
                renewals,
                expiringThisMonth,
                total = newAdmissions + renewals
            });
        }

        // GET: api/members/statistics/yearly
        [HttpGet("statistics/yearly")]
        public async Task<ActionResult<object>> GetYearlyStatistics([FromQuery] int year)
        {
            var members = await _context.Members.ToListAsync();

            var monthlyData = new List<object>();

            for (int month = 1; month <= 12; month++)
            {
                // Count members whose subscription started in this specific month and year
                var memberCount = members
                    .Where(m => m.subscriptionStartDate.Year == year && m.subscriptionStartDate.Month == month)
                    .Count();

                monthlyData.Add(new
                {
                    month,
                    memberCount
                });
            }

            return Ok(monthlyData);
        }
    }
}
