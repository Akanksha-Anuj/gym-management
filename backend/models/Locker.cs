namespace backend.models
{
    public class Locker
    {
        public int id { get; set; }
        public string name { get; set; }
        public string contactNumber { get; set; }
        public string duration { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
        public string lockerNumber { get; set; }
        public int amount { get; set; }
        public int paid { get; set; }
        public int due { get; set; }
        public DateTime createdAt { get; set; } = DateTime.UtcNow;
    }
}
