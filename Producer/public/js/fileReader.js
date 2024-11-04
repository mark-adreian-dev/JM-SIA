const fileInput = document.querySelector(".file-input")
const codeEditor = document.querySelector("#editor")
const submitBtn = document.querySelector('.submit')
const reciepient = document.querySelector(".select")

const editor = ace.edit("editor");
editor.setTheme("ace/theme/twilight");
editor.session.setMode("ace/mode/javascript");
codeEditor.style.fontSize = "24px";

const fileSelectHandler = e => {
    let file = fileInput.files[0];
    let fileReader = new FileReader();
    fileReader.onload = e => editor.setValue(e.target.result)
    fileReader.readAsText(file)
}
const handleSubmit = () => {
    
    const payload = {
        data: String(editor.getValue()).replace((/  |\r\n|\n|\r/gm),""),
        reciepient: String(reciepient.value)
    }
 
    fetch("/xml", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json"
        }
    })
}

submitBtn.addEventListener('click', handleSubmit, false)
fileInput.addEventListener('change', fileSelectHandler, false)
