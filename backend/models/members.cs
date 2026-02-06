namespace backend.models
{
    public class members
    {
        public int id { get; set; }
        public string subscriptionPlan { get; set; }
        public string name { get; set; }
        public string address { get; set; }
        public string contactNumber { get; set; }
        public int payment { get; set; }
        public int paid { get; set; }
        public int due { get; set; }
        public DateTime subscriptionExpiryDate { get; set; }
        public bool bagProvided { get; set; }
    }
}