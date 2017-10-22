var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        totalIncome > 0 ? this.percentage = Math.round((this.value / totalIncome) * 100) : this.percentage = -1;
    };

    Expense.prototype.getPercent = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var caculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(currentItem) {
            sum += currentItem.value;
        });

        data.totals[type] = sum;
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            data.allItems[type].length > 0 ? ID = data.allItems[type][data.allItems[type].length - 1].id + 1 : ID = 0;

            type === 'exp' ? newItem = new Expense(ID, des, val) : newItem = new Income(ID, des, val);

            data.allItems[type].push(newItem);

            return newItem;
        },
        deleteItem: function(type, id) {
            var ids = data.allItems[type].map(function(currentItem) {
                return currentItem.id;
            });

            var index = ids.indexOf(id);

            if (index !== -1)
                data.allItems[type].splice(index, 1);
        },
        caculateBudget: function() {
            caculateTotal('exp');
            caculateTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;
            data.totals.inc > 0 ? data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100) : data.percentage = -1;
        },
        caculatePercentages: function() {
            data.allItems.exp.forEach(function(currentItem) {
                currentItem.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(currentItem) {
                return currentItem.getPercent();
            });
            return allPercentages;
        },
        getBudget: function() {
            return {
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                budget: data.budget,
                percentage: data.percentage
            };
        }
    };
})();



var UIController = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomesContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        num = Math.abs(num);
        num = num.toFixed(2);

        var numSplit = num.split('.');

        var int = numSplit[0];
        var dec = numSplit[1];

        if (int.length > 3)
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(nodeList, callback) {
        for (var i = 0; i < nodeList.length; i++) {
            callback(nodeList[i], i);
        }
    };

    return {
        addListItem: function(obj, type) {
            var html, newHtml, container;

            if (type === 'inc') {
                container = DOMstrings.incomesContainer;

                html = '<div class="item clearfix" id="inc-%id%">\
                <div class="item__description">%description%</div>\
                    <div class="right clearfix">\
                        <div class="item__value">%value%</div>\
                        <div class="item__delete">\
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>\
                    </div>\
                </div>\
            </div>';
            }
            else if (type === 'exp') {
                container = DOMstrings.expenseContainer;

                html = '<div class="item clearfix" id="exp-%id%">\
                        <div class="item__description">%description%</div>\
                            <div class="right clearfix">\
                                <div class="item__value">%value%</div>\
                                <div class="item__percentage">21%</div>\
                                <div class="item__delete">\
                                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>\
                            </div>\
                        </div>\
                    </div>';
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            document.querySelector(container).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem: function(itemID) {
            var element = document.getElementById(itemID);
            element.parentNode.removeChild(element);
        },
        clearFields: function() {
            var fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            var fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(currentField) {
                currentField.value = "";
            });

            fieldsArr[0].focus();
        },
        displayBudget: function(obj) {
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, obj.budget > 0 ? 'inc' : 'exp');

            obj.percentage > 0 ? document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%' : document.querySelector(DOMstrings.percentageLabel).textContent = '---';
        },
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercentLabel);


            nodeListForEach(fields, function(currentItem, index) {
                percentages[index] > 0 ? currentItem.textContent = percentages[index] + '%' : currentItem.textContent = '---';
            });
        },
        displayMonth: function() {
            var months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            var now = new Date();
            var year = now.getFullYear();
            var monthNumber = now.getMonth();

            document.querySelector(DOMstrings.dateLabel).textContent = months[monthNumber] + ', ' + year;
        },
        changedType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

            nodeListForEach(fields, function(currentItem) {
                currentItem.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
        },
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Inc || Exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        getDOMstrings: function() {
            return DOMstrings;
        }
    };
})();

var controller = (function(budgetCtrl, UICtrl) {
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            //"Which" is for older browswers
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };

    var updateBudget = function() {
        budgetCtrl.caculateBudget();

        var budget = budgetCtrl.getBudget();

        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        budgetCtrl.caculatePercentages();
        var percentages = budgetCtrl.getPercentages();
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function() {
        var input = UICtrl.getInput();

        if (input.description === "" || isNaN(input.value) || input.value < 0)
            return;

        var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        UICtrl.addListItem(newItem, input.type);

        UICtrl.clearFields();

        updateBudget();
        updatePercentages();
    };

    var ctrlDeleteItem = function(event) {
        var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            var splitID = itemID.split('-');
            var type = splitID[0];
            var id = parseInt(splitID[1]);

            budgetCtrl.deleteItem(type, id);

            UICtrl.deleteListItem(itemID);

            updateBudget();
            updatePercentages();
        }
    };

    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();
            setupEventListeners();
        }
    };
})(budgetController, UIController);


controller.init();
