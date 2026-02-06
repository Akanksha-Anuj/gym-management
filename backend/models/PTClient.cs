namespace backend.models
{
    public class PTClient
    {
        public int id { get; set; }
        public string name { get; set; }
        public string contactNumber { get; set; }
        public string address { get; set; }
        public decimal payment { get; set; }
        public decimal paid { get; set; }
        public decimal due { get; set; }
        public DateTime ptStartDate { get; set; }
        public DateTime ptEndDate { get; set; }
        public string trainer { get; set; }
        public string? remarks { get; set; }
    }
}
