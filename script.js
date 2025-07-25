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

    // variable to destroy existing instance of pie-chart in the canvas
    let pieChartInstance = null; // initialise it with null

    //editing row
    let transactionBeingEdited = null; 

    //local storage setup
    let transactions = [];
    const dataStored = localStorage.getItem("transactions");
    
    //fetching from local storage
    if(dataStored)
    {
        transactions = JSON.parse(dataStored); //converting from json to js

        transactions.forEach(transaction => {
            displayTransactions(transaction); 
        });

        calculateTotals();
        pieChart(transactions);  // if data exists chart is plotted
    }

    //displayTransaction function
    function displayTransactions(transaction){
        const { id,description, amount, category, date, type} = transaction;

        const row = document.createElement("tr");

        //LINE 56 - to add color to amount based on type

        row.innerHTML = `
        <td>${description}</td>
        <td><span class="${type}-amount">${amount.toFixed(2)}</span></td> 
        <td>${category}</td>
        <td>${date}</td>
        <td>
            <button class="edit-button">Edit</button>    
            <button class="delete-button">Delete</button>
        </td>
        `;

        row.setAttribute("data-amount", amount);
        row.setAttribute("data-type", type);
        row.setAttribute("data-id",id);

        const tableBody = document.getElementById("transactions-body");
        tableBody.appendChild(row);
        updateCategoryFilterOptions();


        //deletion of row
        const deleteButton = row.querySelector(".delete-button");
        deleteButton.addEventListener("click",()=>{
            const transactionId = Number(row.getAttribute("data-id"));
            const transactionToDelete = transactions.find(t => t.id === transactionId);

            if(!transactionToDelete){
                row.remove();
                return;
            }

        
            transactions = transactions.filter(t => t.id !== transactionId);
            localStorage.setItem("transactions",JSON.stringify(transactions)); // converting from js to string

            row.remove();
            calculateTotals();
            pieChart(transactions); // after removing data chart is plotted
        });

        //editing row

        const editButton = row.querySelector(".edit-button");
        editButton.addEventListener("click",()=>{
            transactionBeingEdited = transaction;

            //fill the form with the row values which we want to edit
            descriptionInput.value=transaction.description;
            amountInput.value=transaction.amount;
            dateInput.value=transaction.date;
            categoryInput.value=transaction.category;

            //handling of "type"
            if(transaction.type === "income"){
                incomeButton.checked=true;
                submitButton.textContent="Update Income";
            }
            else{
                expenseButton.checked=true;
                submitButton.textContent="Update Expense";
            }

            //handling category
            if (categoryInput.value === transaction.category) {
                categoryContainer.style.display = "none";  // if the category exists in dropdown dont show custom category
            }
            else{
                categoryInput.value = "custom";
                customCategoryInput.value=transaction.category;
                categoryContainer.style.display = "none"; // show custom category 
            }

            submitButton.disabled=false; // enable the submitButton for editing
        });
    }

    // function to update category filter options

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

    //function to calculate total values

    function calculateTotals(){
        totalIncome=0;
        totalExpense=0;

        transactions.forEach(t=>{
            if(t.type==="income"){
                totalIncome+=t.amount;
            }
            else{
                totalExpense+=t.amount;
            }
        });

        const balance= totalIncome-totalExpense;

        totalIncomeSpan.textContent = totalIncome.toFixed(2);
        totalExpenseSpan.textContent = totalExpense.toFixed(2);
        totalBalanceSpan.textContent = balance.toFixed(2);
    }



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


    // chart function
    
    function pieChart(transactions){
        const expenseByCategory = {}; // object to hold values from categories

        transactions.forEach(transaction => {
            if(transaction.type === "expense"){
                if(!expenseByCategory[transaction.category]){ // if the category has not been added to the object yet then...
                    expenseByCategory[transaction.category] = 0;
                } 
                expenseByCategory[transaction.category] += transaction.amount;
            }
        });

        const categoryNames = Object.keys(expenseByCategory); // fetching labels - (keys) from the object to plot chart
        const categoryValues = Object.values(expenseByCategory); // fetching data - (values) from the object to plot chart

        const ctx = document.getElementById('expense-pie-chart').getContext('2d');

         if(pieChartInstance){ //check if chart already exists 
            pieChartInstance.destroy(); 
        }

        pieChartInstance = new Chart(ctx,{ 
            type: 'pie',
            data: {
                labels: categoryNames,
                datasets:[{
                    label: "Expense By Categories",
                    data:categoryValues,
                    backgroundColor: [

                        '#f4a261', '#e9c46a','#e76f51','#d4a373','#fcd5ce','#9552EA','#f6bd60'
                ]
                }]
            },

            options: {
                responsive:true,
                plugins:{
                    legend: {
                        position: 'bottom',
                        align:'start',
                        labels: {
                            boxWidth: 20,
                            padding: 10,
                            usePointStyle: true,
                            font:{
                                size: 14,
                            }
                        }

                    }
                }
            }   
        });
    }

    // submit listener

    form.addEventListener("submit",(event)=>{
        event.preventDefault();

        //if validation is not successful cannot submit
        if(!validateForm()){ 
            return;
        }

        const description = descriptionInput.value;
        const amount= parseFloat(amountInput.value); // converting to float from string
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
        
        if(transactionBeingEdited){
            //editing row

            const index=transactions.findIndex(t=>t.id===transactionBeingEdited.id) //locating the index of transaction in the transactions array

            transactions[index]={
                id: transactionBeingEdited.id, // id same so no new row is added but edited
                description,
                amount,
                category,
                date,
                type
            };

            localStorage.setItem("transactions", JSON.stringify(transactions)); // saving to local storage

            document.getElementById("transactions-body").innerHTML=""; // removing the entire table from html

            transactions.forEach(displayTransactions); // replotting table entirely to html 


            pieChart(transactions); // replotting pie-chart
            calculateTotals();

            // reset edit mode
            transactionBeingEdited = null;
            submitButton.textContent = "Add Expense";
        }
        else{
            //adding row

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
        localStorage.setItem("transactions", JSON.stringify(transactions)); // saving to local storage

        displayTransactions(transaction);
        pieChart(transactions); // after rows are added chart is plotted
        calculateTotals();
        }

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

    //export transactions
    document.getElementById("export-button").addEventListener("click",()=>{
        const transactionsJSON = JSON.stringify(transactions); // converting the transactions array into JSON text

        const downloadDataURL = "data:text/json;charset=utf-8," + encodeURIComponent(transactionsJSON); // data url + safety uri component

        const temporaryDownloadLink = document.createElement('a'); // temporary anchor tag to download

        temporaryDownloadLink.setAttribute("href", downloadDataURL); // referencing data url

        temporaryDownloadLink.setAttribute("download", "My_transactions.json");

        document.body.appendChild(temporaryDownloadLink); //Add the link to the DOM

        temporaryDownloadLink.click(); // downloading file on click

        document.body.removeChild(temporaryDownloadLink); // clean link post download from DOM
    });

    //import transactions
    document.getElementById("import-file").addEventListener("change",(event)=>{
        const selectedFile= event.target.files[0]; // only letting user select 1 file - the first file selected

        if(!selectedFile){
            alert("No file has been selected");
            return;
        }

        const fileReader = new FileReader(); // to read file contents as text

        fileReader.onload = function(e){
            try{
                const importedData = JSON.parse(e.target.result); // converting json to js (array)

                //checking if data is actually an array 
                if(!Array.isArray(importedData)){ 
                    alert("Invalid File Format");
                    return;
                }

                transactions=importedData; // saving the imported data array in the current transactions array
                
                localStorage.setItem("transactions", JSON.stringify(transactions)); // saving to local storage

                document.getElementById("transactions-body").innerHTML = "";

                transactions.forEach(displayTransactions);

                calculateTotals();

                pieChart(transactions);

                alert("Import successful!");

            } catch(error){
                alert("Error reading file...");
            }   
        };
        
        fileReader.readAsText(selectedFile); //this triggers onload when done reading as plain text
    });
});