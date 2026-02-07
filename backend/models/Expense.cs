namespace backend.models
{
    public class Expense
    {
        public int Id { get; set; }
        public DateTime ExpenseDate { get; set; }
        public decimal Amount { get; set; }
        public string ExpenseType { get; set; } // rent, salary, maintenance, water, electricity, miscellaneous
        public string Remarks { get; set; }
    }
}
