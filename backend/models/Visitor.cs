namespace backend.models
{
    public class Visitor
    {
        public int id { get; set; }
        public string name { get; set; }
        public string contactNumber { get; set; }
        public string address { get; set; }
        public bool contacted { get; set; }
        public bool joined { get; set; }
        public DateTime visitedDate { get; set; }
        public string? remark { get; set; }
    }
}
