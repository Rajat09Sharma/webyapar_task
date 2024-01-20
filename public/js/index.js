
var userName="";
var croppedUserImage="";


var imgBox=document.getElementById("imgBox");
var loadFile=function(event){
    imgBox.style.backgroundImage="url("+URL.createObjectURL(event.target.files[0])+")";
}


const image=document.getElementById("image");
const cropper= new Cropper(image,{
    aspectRatio: 0,
    viewMode:0  
});

document.getElementById("cropImageButton").addEventListener("click",function(){
    var croppedImage=cropper.getCroppedCanvas().toDataURL("image/png");
    document.getElementById("output").src=croppedImage;
    var imgUrl=document.getElementById("imgUrl");
    imgUrl.value=croppedImage;
    croppedUserImage=croppedImage;
})


var uploadButton=document.getElementById("uploadButton").addEventListener("click",function(){

    
})



var nameInput=document.getElementById("nameInput");
var inputFun=function(event){
    var userInputName=event.target.value;
    userName=userInputName;
}

// var viewPageUserName=document.getElementById("giga");
// viewPageUserName.innerText=userName;


