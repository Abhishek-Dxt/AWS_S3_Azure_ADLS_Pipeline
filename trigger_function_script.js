module.exports = async function (context, myBlob) {
    context.log("JavaScript blob trigger function processed blob \n Blob:");
    context.log("'''***Azure Function Triggered***'''");
    var result =true;
    try{
        context.log(myBlob.toString());
        JSON.parse(myBlob.toString().trim().replace('\n', ' ')); // Validation by parsing the input JSON file
    }catch(exception){
        context.log(exception); //If parsing fails, file is invalid & will be sent to the rejected folder
        result =false;
    }
    if(result){
        context.bindings.stagingFolder = myBlob.toString();
        context.log("'''****Valid File, Sent to Staging Folder****'''");
    } else{
        
        context.bindings.rejectedFolder = myBlob.toString();
        context.log("'''****Inavlid File; Sent to Rejected Folder****'''");
    }

    context.log("'''****Function Completed Successfully****'''");
    
};