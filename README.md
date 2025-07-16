# Expense Tracker 

A simple web-based expense tracker to manage personal finances.  
Users can add income and expenses, categorize them, and view summaries with a pie chart.

## Live Demo

[Try the Expense Tracker (Hosted on Vercel)](https://expense-tracker-seven-chi-11.vercel.app/)

**Note:**  
GitHub README links open in the **same tab by default**.  
If you want to open the demo in a **new tab**, use:

- **Ctrl + Click** (Windows/Linux)  
- **Cmd + Click** (Mac)  
- Or **Middle-click** the link


## Technologies Used

- **HTML**
- **CSS** (Responsive with Flexbox & Media Queries)
- **JavaScript** (Vanilla JS)
- **Chart.js** (via CDN)

## Features

- Add and edit **income** and **expenses**
- Categorize transactions (Food, Shopping, Transportation, etc.)
- Create **custom categories** dynamically
- Visual summary with a **pie chart** (Chart.js)
- Filter transactions by category
- **Color-coded amounts:**  
  - **Green** for income  
  - **Red** for expenses
- **Local Storage Persistence:**  
  - All data is saved in the browser using `localStorage`  
  - Transactions persist after refresh (no backend required)
- Import and export transactions as **JSON**
- Fully **responsive design**: works on **desktop, tablet, and mobile**

## How to Run

1. Download or clone this repository.
2. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, etc.).
3. Start adding your expenses and income!

## How Data is Stored

- The app uses **`localStorage`** to automatically save all transactions.
- No database or server is required.
- Export your data as a `.json` file for backup.
- Import a `.json` file to restore or transfer your transactions.

## Project Structure

```
Expense-Tracker/
│
├── index.html       # Main UI structure
├── script.js        # All logic (add, edit, delete, filter, import/export, chart)
├── style/
│   └── style.css    # Styling (responsive layout, warm theme, button colors)
└── README.md        # Project overview & usage guide
```

## Input Validation

- All fields are required: **description, amount, category, date, type (income/expense)**
- Custom categories are validated before being added
- Error messages are displayed next to invalid fields

