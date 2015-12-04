var data;
$(document).ready(function(){
    console.log("page is ready");

    
    if(Lockr.get("checkingLedger")){
        console.log('Reading data from localStorage');
        data = Lockr.get("checkingLedger");
    }
    else{
        console.log("Initializing data in localStorage");
        data = [
                {
                    payee: 'Opening Balance',
                    increase: "15000"
                }
                ];
    
        Lockr.set("checkingLedger", data);
    }
    
    for(var x=0; x<(data.length + 1); x++){
            addline(x,$('#register'));
    }
    
    data.forEach(function(value, index){
        $('#' + index + '-payee').val(value.payee);
        $('#' + index + '-memo').val(value.memo);
        $('#' + index + '-category').val(value.category);
        var previousLedgerIndex = index-1;
        if(value.decrease){
            $('#' + index + '-decrease').val(numeral(value.decrease).format('$0,0.00'));
            var balance = parseInt(numeral().unformat($('#' + previousLedgerIndex + '-balance').html())) - value.decrease;
            $('#' + index + '-balance').html(numeral(balance).format('$0,0.00'));
        }
        else {
            $('#' + index + '-increase').val(numeral(value.increase).format('$0,0.00'));
            var balance = parseInt(numeral().unformat($('#' + previousLedgerIndex + '-balance').html()))  + value.increase;
            $('#' + index + '-balance').html(numeral(balance).format('$0,0.00'));
        }
        
    });
    
});




function save(){
    var table = $(this).closest("tbody");
    var numberofrows = parseInt($('tr', table).size()) / 2;
    addline(numberofrows,table);
}

function addline(rowIndex,table){
    var buffer = new StringBuffer();
    if(rowIndex % 2 == 0){
        var oddeven = 'even';
    }
    else {
        var oddeven = 'odd';
    }
    buffer.append('<tr id="' + rowIndex + '=a" class="' + oddeven + '">');
    buffer.append('<td width="55%"><input class="form-control" type="text" id="' + rowIndex + '-payee" placeholder="payee"/></td>');
    buffer.append('<td><input class="text-right form-control" type="text" id="' + rowIndex + '-decrease" placeholder="debit"/></td>');
    buffer.append('<td><input class="text-right form-control" type="text" id="' + rowIndex + '-increase" placeholder="credit"/></td>');
    buffer.append('<td class="text-right" width="10%" id="' + rowIndex + '-balance"></td>');
    buffer.append('</tr>');
    buffer.append('<tr id="' + rowIndex + '=b" class="' + oddeven + '">');
    buffer.append('<td><input class="form-control" type="text" id="' + rowIndex + '-category" placeholder="category / account code"/></td>');
    buffer.append('<td colspan="2"><input class="form-control" type="text" id="' + rowIndex + '-memo" placeholder="memo"/></td>');
    //buffer.append('<td class="text-right"><button id="' + rowIndex + '-save" class="savebtn">Save</button></td>');
    buffer.append('<td class="text-right"></td>');
    
    //<button id="' + rowIndex + '-delete" class="deletebtn">Delete</button>
    buffer.append('</tr>')
    table.append(buffer.toString());
    var button = '#' + rowIndex + '-save';
    $(button).on("click",save);
    
    $('#' + rowIndex + '-payee').on('change', function(){
        var currentindex = parseInt(this.id.split("-")[0]);
        if(data[currentindex]){
            data[currentindex].payee = this.value;
        }
        else {
            data[currentindex] = {};
            data[currentindex].payee = this.value;
        }
        Lockr.set("checkingLedger", data);
    });
    
    $('#' + rowIndex + '-category').on('change', function(){
        var currentindex = parseInt(this.id.split("-")[0]);
        if(data[currentindex]){
            data[currentindex].category = this.value;
        }
        else {
            data[currentindex] = {};
            data[currentindex].category = this.value;
        }
        Lockr.set("checkingLedger", data);
    });
    
     $('#' + rowIndex + '-memo').on('change', function(){
        var currentindex = parseInt(this.id.split("-")[0]);
        if(data[currentindex]){
            data[currentindex].memo = this.value;
        }
        else {
            data[currentindex] = {};
            data[currentindex].memo = this.value;
        }
        Lockr.set("checkingLedger", data);
    });
    
    //Calculate the current balance on change
    $('#' + rowIndex + '-decrease').on('change', function(){
        //debugger;
        var registerentries = (parseInt($('tr', table).size()) / 2)-1;
        console.log(registerentries);
        var currentindex = parseInt(this.id.split("-")[0]);
        console.log("currentindex" + currentindex);
        $('#' + currentindex + '-increase').val('');
        var previousrow =  currentindex - 1;
        var currentbalance = numeral().unformat($('#' + previousrow + '-balance').html());
        $('#' + currentindex + '-balance').html(numeral(currentbalance - this.value).format('$0,0.00'));
        
        
        if(data[currentindex]){
            data[currentindex].decrease = this.value;
        }
        else {
            data[currentindex] = {};
            data[currentindex].decrease = this.value;
        }
        Lockr.set("checkingLedger", data);
        
        $(this).val(numeral(this.value).format('$0,0.00'));
        

        if(currentindex < registerentries){
            var nextLedgerIndex = currentindex + 1
            recalculate(nextLedgerIndex, registerentries);
        }
        
        if(registerentries == currentindex){
            addline((currentindex+1), $('#register'));
        }
    });
    
    $('#' + rowIndex + '-increase').on('change', function(){
        var registerentries = (parseInt($('tr', table).size()) / 2)-1;
        var currentindex = parseInt(this.id.split("-")[0]);
        $('#' + currentindex + '-decrease').val('');
        var previousrow =  currentindex - 1;
        var currentbalance = numeral().unformat($('#' + previousrow + '-balance').html());
        $('#' + currentindex + '-balance').html(numeral(parseInt(currentbalance) + parseInt(this.value)).format('$0,0.00'));
        
         if(data[currentindex]){
            data[currentindex].increase = this.value;
        }
        else {
            data[currentindex] = {};
            data[currentindex].increase = this.value;
        }
        Lockr.set("checkingLedger", data);
        
        $(this).val(numeral(this.value).format('$0,0.00'));
        
        if(currentindex < registerentries){
            var nextLedgerIndex = currentindex + 1
            recalculate(nextLedgerIndex, registerentries);
        }
        
        if(registerentries == currentindex){
            addline((currentindex+1), $('#register'));
        }
        
    });
    
}

function recalculate(startingIndex, registerentries){
    console.log("recalculate ledger entries");
    for(var x=startingIndex; x<registerentries; x++){
        if(numeral().unformat($('#' + x + '-decrease').val()) > 0){
            var previousLedgerIndex = x - 1;
            var previousBalance = numeral().unformat($('#' + previousLedgerIndex + '-balance').html());
            var balance = previousBalance - numeral().unformat($('#' + x + '-decrease').val());
            $('#' + x + '-balance').html(numeral(balance).format('$0,0.00'));
        }
        else if(numeral().unformat($('#' + x + '-increase').val()) > 0){
            var previousLedgerIndex = x - 1;
            var previousBalance = numeral().unformat($('#' + previousLedgerIndex + '-balance').html());
            var balance = previousBalance + numeral().unformat($('#' + x + '-increase').val());
            $('#' + x + '-balance').html(numeral(balance).format('$0,0.00'));
        }
    }
    
}


function StringBuffer() {
    this.buffer = [];
}
StringBuffer.prototype.append = function append(string) {
    this.buffer.push(string);
    return this;
};
StringBuffer.prototype.toString = function toString() {
    return this.buffer.join("");
};
    