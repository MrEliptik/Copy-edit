var bubble = null;
var bubble_img = null;
var copyInput = null;
var input_container = null;
var isBubbleActive = false;
var isInputActive = false;
var selectionTop = 0;
var selectionLeft = 0;
var selection = "";

// Return text highlighted by user
function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    
        s = window.getSelection();
        oRange = s.getRangeAt(0); //get the text range
        oRect = oRange.getBoundingClientRect();
        console.log(oRange, oRect);
        selectionTop = oRect.bottom;
        selectionLeft = oRect.left + (oRect.width / 2);
        

    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    if(text != ""){
        console.log(text);
    }    
    return text;
}

document.addEventListener('mouseup', (e) => {
    selection = getSelectionText();
	if((selection && (selection = new String(selection).replace(/^\s+|\s+$/g,''))) && bubble_img == null && !isBubbleActive && !isInputActive) {
        addFloatingBubble();
    }
    else if(bubble_img != null && e.target != bubble_img){
        removeFloatingBubble();
    }
    else if(copyInput != null && e.target != copyInput){
        removeInput();
    }
});

function addFloatingBubble(){
    bubble = document.createElement ('div');
    let runtime_url = chrome.extension.getURL('images/copyedit16.png');
    let leftOffset = selectionLeft - 8; // 16/2 to center the image of 16px width
    bubble.innerHTML   = 
        `<div id="copy-edit-bubble" 
            style="
                position: absolute; 
                z-index:2147483647;
                left: ${leftOffset}px; 
                top: ${selectionTop}px;
                margin-top: 5px; 
                background-color:white;
                border-radius: 5px;
                border-style: groove;
            ">
            <img id="bubble" class="bubble_logo" src="${runtime_url}" alt="CopyEdit" 
                style="
                    cursor: pointer;
                    margin: 3px;
                ">
        </div>`;
    document.body.appendChild (bubble);
    bubble_img = document.getElementById("bubble");

    bubble_img.addEventListener('click', () => {
        removeFloatingBubble();
        addInput(selection);
    });
    isBubbleActive = true;  
}

function removeFloatingBubble(){
    console.log('Removing bubble..');
    document.body.removeChild(bubble);
    isBubbleActive = false;
    bubble = null;
    bubble_img = null;
}

function addInput(text){
    console.log("add input");
    input_container = document.createElement ('div');
    input_container.innerHTML   = `
        <div id="input" 
            style="
                position: absolute; 
                z-index:2147483647;
                left: ${selectionLeft}px; 
                top: ${selectionTop}px; 
                margin-top:5px; 
            ">
            <textarea class="form-control" id="copyInput" rows="1">${text}</textarea>
        </div>`;
    document.body.appendChild(input_container);
    let input = document.getElementById("input");
    console.log(input.offsetLeft, input.offsetWidth);
    input.style.left = (input.offsetLeft - (input.offsetWidth/2)) + "px";
    copyInput = document.getElementById("copyInput");
    
    // Store edited string into clipboard
    /* Select the text field */
    copyInput.select();

    /* Copy the text inside the text field */
    document.execCommand("copy");
    copyInput.focus();
    copyInput.setSelectionRange(copyInput.textContent.length, copyInput.textContent.length); 


    copyInput.addEventListener('input', (e) => {
        console.log("Input changed");

        // Store caret position before selection
        let caretPos = e.target.selectionStart;

        // Store edited string into clipboard
        /* Select the text field */
        copyInput.select();

        /* Copy the text inside the text field */
        document.execCommand("copy");

        // Put caret at it's original position
        copyInput.focus();
        copyInput.setSelectionRange(caretPos, caretPos);
    })
    copyInput.addEventListener('input', resize, false);
    copyInput.addEventListener('cut', delayedResize, false);
    copyInput.addEventListener('paste', delayedResize, false);
    copyInput.addEventListener('drop', delayedResize, false);
    copyInput.addEventListener('keydown', delayedResize, false);
    isInputActive = true;
}

function removeInput(){
    console.log('Removing input..');
    document.body.removeChild(input_container);
    isInputActive = false;
    copyInput = null;
    input_container = null;
}

function resize () {
    copyInput.style.height = 'auto';
    copyInput.style.height = copyInput.scrollHeight+'px';
}

/* 0-timeout to get the already changed text */
function delayedResize () {
    window.setTimeout(resize, 0);
}  

