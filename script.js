document.addEventListener("DOMContentLoaded",  () =>{
    //get inputs 
    const form= document.getElementById("expense-income-form");
    const descriptionInput= document.getElementById("description");
    const amountInput= document.getElementById("amount");
    const categoryInput= document.getElementById("category");
    const dateInput= document.getElementById("date");
    const customCategoryInput= document.getElementById("custom-category");
    const categoryContainer= document.getElementById("category-container");
    const incomeButton= document.getElementById("income");
    const expenseButton= document.getElementById("expense");
    const submitButton= document.querySelector("button[type='submit']");
    submitButton.disabled = true;

    //expense calculation setup
    let totalExpense= 0;
    let totalIncome= 0;

    let totalExpenseSpan= document.getElementById("total-expense");
    let totalIncomeSpan= document.getElementById("total-income");
    let totalBalanceSpan= document.getElementById("total-balance");

    //local storage setup
    let transactions = [];
    const dataStored = localStorage.getItem("transactions");
    if(dataStored)
    {
        transactions = JSON.parse(dataStored); //converting from json to js
        totalIncome = 0; 
        totalExpense = 0; 
        transactions.forEach(transaction => {
            displayTransactions(transaction);
        });
    }

    //displayTransaction function
    function displayTransactions(transaction){
        const { id,description, amount, category, date, type} = transaction;

        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${description}</td>
        <td>${amount.toFixed(2)}</td>
        <td>${category}</td>
        <td>${date}</td>
        <td><button class="delete-button">Delete</button></td>
        `;

        row.setAttribute("data-amount", amount);
        row.setAttribute("data-type", type);
        row.setAttribute("data-id",id);

        const tableBody = document.getElementById("transactions-body");
        tableBody.appendChild(row);
        updateCategoryFilterOptions();


        if (type === "income"){
            totalIncome += amount;
        } 
        else {
            totalExpense += amount;
        }

        const balance = (totalIncome-totalExpense);

        totalIncomeSpan.textContent = totalIncome.toFixed(2);
        totalExpenseSpan.textContent = totalExpense.toFixed(2);
        totalBalanceSpan.textContent = balance.toFixed(2);

        const deleteButton = row.querySelector(".delete-button");
        deleteButton.addEventListener("click",()=>{
            const transactionId = Number(row.getAttribute("data-id"));
            const transactionToDelete = transactions.find(t => t.id === transactionId);

            if(!transactionToDelete){
                row.remove();
                return;
            }

            if(transactionToDelete.type === "income"){
                totalIncome -= transactionToDelete.amount;
            } 
            else{
                totalExpense -= transactionToDelete.amount;
            }

            const newBalance = totalIncome - totalExpense;
            totalIncomeSpan.textContent = totalIncome.toFixed(2);
            totalExpenseSpan.textContent = totalExpense.toFixed(2);
            totalBalanceSpan.textContent = newBalance.toFixed(2);

            transactions = transactions.filter(t => t.id !== transactionId);
            localStorage.setItem("transactions",JSON.stringify(transactions)); // converting from js to string

            row.remove();
        });
    }

    function updateCategoryFilterOptions() {
    const filterSelect = document.getElementById("category-filter");
    const usedCategories = [...new Set(transactions.map(t => t.category))];

    filterSelect.innerHTML = '<option value="all">Show All</option>';

    usedCategories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        filterSelect.appendChild(option);
    });
    }

    document.getElementById("category-filter").addEventListener("change", (e) => {
    const selected = e.target.value;
    const rows = document.querySelectorAll("#transactions-body tr");

        rows.forEach(row => {
            const rowCategory = row.children[2].textContent;
            if (selected === "all" || rowCategory === selected) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    });



    // function to validate form
    function validateForm(){
        let isValid= true;

        // clear warning messages
        document.querySelectorAll(".error").forEach(span => {
        span.textContent = "";
        span.style.display = "none";
    }); 

        // checking if description is empty
        if(descriptionInput.value.trim() === ""){
            const err = document.getElementById("description-error");
            err.textContent = "Description is required.";
            err.style.display = "inline";
            isValid = false;
        }
        
        //checking if amount is empty
        if(amountInput.value.trim()===""){
            const err = document.getElementById("amount-error");
            err.textContent = "Please enter an amount";
            err.style.display = "inline";
            isValid=false;
        }

        //checking date
        if(dateInput.value === "") {
            const err = document.getElementById("date-error");
            err.textContent = "Date is required.";
            err.style.display = "inline";
            isValid = false;
        }
        
        //checking if type is empty
        if(!incomeButton.checked && !expenseButton.checked) {
            const err = document.getElementById("type-error");
            err.textContent = "Please select Income or Expense.";
            err.style.display = "inline";
            isValid = false;
        }

        //checking for category
        if(categoryInput.value === "custom") {
            if(customCategoryInput.value.trim() === ""){
                const err = document.getElementById("custom-category-error");
                err.textContent = "Enter a custom category.";
                err.style.display = "inline";
                isValid = false;
            }
        } 
        else if(categoryInput.value === "Select Category"){
            const err = document.getElementById("category-error");
            err.textContent = "Please select a category.";
            err.style.display = "inline";
            isValid = false;
        }

        submitButton.disabled = !isValid;

        return isValid;
    }


    // submit listener
    form.addEventListener("submit",(event)=>{
        event.preventDefault();

        //if validation is not successful cannot submit
        if(!validateForm()){ 
            return;
        }

        const description = descriptionInput.value;
        const amount= parseFloat(amountInput.value); // Converting to floating point number from string
        const date=dateInput.value;

        //checking if income or expense is selected
        let type = "";
        if (incomeButton.checked){
        type = "income";
        } 
        else if (expenseButton.checked){
        type = "expense";
        } 
        else{
        alert("Please select Income or Expense");
        return;
        }

        // if custom is selected then an input text box will show up else category is simply assigned from the options provided.
        let category;
        if (categoryInput.value === "custom"){
        category = customCategoryInput.value;
        } 
        else{
        category = categoryInput.value;
        }

        // creating the row based on user inputs and adding it to the table
        const transactionId = Date.now(); // generate a unique ID
        const transaction = {
            id: transactionId,
            description,
            amount,
            category,
            date,
            type
        };

        transactions.push(transaction);
        localStorage.setItem("transactions", JSON.stringify(transactions));

        displayTransactions(transaction);

        //onclick submit reset 
        form.reset();
        submitButton.textContent = "Add Expense";
        submitButton.disabled = true;
        categoryContainer.style.display = "none";
    });

    categoryInput.addEventListener("change", () => {
        if (categoryInput.value === "custom") {
            categoryContainer.style.display = "block";
        } 
        else{
            categoryContainer.style.display = "none";
        }
        validateForm();
    });

    incomeButton.addEventListener("change", () => {
        if (incomeButton.checked) {
            submitButton.textContent = "Add Income";
        }
    });

    expenseButton.addEventListener("change", () => {
        if (expenseButton.checked) {
            submitButton.textContent = "Add Expense";
        }
    });

    [descriptionInput, amountInput, dateInput, categoryInput, customCategoryInput, incomeButton, expenseButton].forEach(input=>{
        // checking for update of value dynamically and running the validation code
        input.addEventListener("input",validateForm); 
        input.addEventListener("change", validateForm);
    });
});